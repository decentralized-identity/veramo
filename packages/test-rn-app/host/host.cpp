// RN harness JSI host.

#include <hermes/hermes.h>
#include <jsi/jsi.h>
#include <stdlib.h>

#include <chrono>
#include <cmath>
#include <fstream>
#include <iostream>
#include <map>
#include <memory>
#include <set>
#include <sstream>
#include <string>
#include <thread>
#include <vector>

using namespace facebook;
using Clock = std::chrono::steady_clock;

namespace {

constexpr double kMaxDelayMs = 2147483647;  // 2^31-1, the browser timer bound
constexpr double kMaxRandomBytes = 65536;   // react-native-get-random-values' quota

struct Timer {
  std::shared_ptr<jsi::Function> fn;
  std::shared_ptr<std::vector<jsi::Value>> args;
  double delayMs;
  bool repeat;
  Clock::time_point due;
};

// The only static holding jsi values; cleared before the runtime is destroyed.
std::map<int, Timer> timers;
std::set<int> clearedImmediates;
std::map<double, std::string> unhandledRejections;  // tracker id -> message
int nextTimerId = 1;
int nextImmediateId = 1;
int errors = 0;

void reportError(const char* tag, const std::string& msg) {
  errors++;
  std::cout << tag << ": " << msg << std::endl;
}

void setFn(jsi::Runtime& rt, jsi::Object& target, const char* name, unsigned argc,
           jsi::HostFunctionType fn) {
  target.setProperty(
      rt, name,
      jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, name), argc, std::move(fn)));
}

std::shared_ptr<std::vector<jsi::Value>> restArgs(jsi::Runtime& rt, const jsi::Value* args, size_t count,
                                                  size_t from) {
  auto rest = std::make_shared<std::vector<jsi::Value>>();
  for (size_t i = from; i < count; i++) rest->emplace_back(rt, args[i]);
  return rest;
}

bool isFunction(jsi::Runtime& rt, const jsi::Value& v) {
  return v.isObject() && v.getObject(rt).isFunction(rt);
}

Clock::time_point dueIn(double ms) {
  return Clock::now() + std::chrono::microseconds((long long)(ms * 1000));
}

jsi::Value addTimer(jsi::Runtime& rt, const jsi::Value* args, size_t count, bool repeat) {
  if (count == 0) throw jsi::JSError(rt, "timer must be called with at least one argument");
  if (!isFunction(rt, args[0])) return 0;
  double delay = count > 1 && args[1].isNumber() ? args[1].getNumber() : 0;
  if (std::isnan(delay) || delay < 0) delay = 0;
  if (delay > kMaxDelayMs) delay = kMaxDelayMs;
  int id = nextTimerId++;
  timers[id] = Timer{std::make_shared<jsi::Function>(args[0].getObject(rt).getFunction(rt)),
                     restArgs(rt, args, count, 2), delay, repeat, dueIn(delay)};
  return id;
}

std::string base64(const uint8_t* p, size_t n) {
  static const char* alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  std::string out;
  for (size_t i = 0; i < n; i += 3) {
    uint32_t v = p[i] << 16 | (i + 1 < n ? p[i + 1] << 8 : 0) | (i + 2 < n ? p[i + 2] : 0);
    out += alphabet[v >> 18 & 63];
    out += alphabet[v >> 12 & 63];
    out += i + 1 < n ? alphabet[v >> 6 & 63] : '=';
    out += i + 2 < n ? alphabet[v & 63] : '=';
  }
  return out;
}

std::string describe(jsi::Runtime& rt, const jsi::Value& v) {
  if (v.isObject() && v.getObject(rt).hasProperty(rt, "stack"))
    return v.getObject(rt).getProperty(rt, "stack").toString(rt).utf8(rt);
  return v.toString(rt).utf8(rt);
}

void installGlobals(jsi::Runtime& rt, bool hoopRandom) {
  jsi::Object global = rt.global();
  global.setProperty(rt, "RN$Bridgeless", true);

  setFn(rt, global, "nativeLoggingHook", 2, [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) {
    if (count > 0) std::cout << args[0].toString(rt).utf8(rt) << std::endl;
    return jsi::Value::undefined();
  });

  setFn(rt, global, "setTimeout", 3, [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) {
    return addTimer(rt, args, count, false);
  });
  setFn(rt, global, "setInterval", 3, [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) {
    return addTimer(rt, args, count, true);
  });
  auto clearTimer = [](jsi::Runtime&, const jsi::Value&, const jsi::Value* args, size_t count) {
    if (count > 0 && args[0].isNumber()) timers.erase((int)args[0].getNumber());
    return jsi::Value::undefined();
  };
  setFn(rt, global, "clearTimeout", 1, clearTimer);
  setFn(rt, global, "clearInterval", 1, clearTimer);

  setFn(rt, global, "queueMicrotask", 1, [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) {
    if (count == 0 || !isFunction(rt, args[0])) throw jsi::JSError(rt, "queueMicrotask: argument must be a function");
    rt.queueMicrotask(args[0].getObject(rt).getFunction(rt));
    return jsi::Value::undefined();
  });

  // immediateShim.js semantics: queue a microtask that runs unless cleared first.
  setFn(rt, global, "setImmediate", 1, [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) {
    if (count == 0 || !isFunction(rt, args[0]))
      throw jsi::JSError(rt, "The first argument to setImmediate must be a function.");
    int id = nextImmediateId++;
    clearedImmediates.erase(id);  // immediateShim.js: the id may have been "guessed" and cleared early
    auto fn = std::make_shared<jsi::Function>(args[0].getObject(rt).getFunction(rt));
    auto rest = restArgs(rt, args, count, 1);
    rt.queueMicrotask(jsi::Function::createFromHostFunction(
        rt, jsi::PropNameID::forAscii(rt, "immediate"), 0,
        [id, fn, rest](jsi::Runtime& rt, const jsi::Value&, const jsi::Value*, size_t) {
          if (clearedImmediates.erase(id) == 0) fn->call(rt, (const jsi::Value*)rest->data(), rest->size());
          return jsi::Value::undefined();
        }));
    return id;
  });
  setFn(rt, global, "clearImmediate", 1, [](jsi::Runtime&, const jsi::Value&, const jsi::Value* args, size_t count) {
    if (count > 0 && args[0].isNumber()) clearedImmediates.insert((int)args[0].getNumber());
    return jsi::Value::undefined();
  });

  if (hoopRandom) {
    jsi::Object nativeModule(rt);
    setFn(rt, nativeModule, "getRandomBase64", 1,
          [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) {
            double n = count > 0 && args[0].isNumber() ? args[0].getNumber() : NAN;
            if (!(n >= 0 && n <= kMaxRandomBytes))
              throw jsi::JSError(rt, "getRandomBase64: byteLength must be a number in 0..65536");
            std::vector<uint8_t> buf((size_t)n);
            if (!buf.empty()) arc4random_buf(buf.data(), buf.size());
            return jsi::String::createFromAscii(rt, base64(buf.data(), buf.size()));
          });
    global.setProperty(rt, "RNGetRandomValues", std::move(nativeModule));
  }

  jsi::Object hermesInternal = global.getPropertyAsObject(rt, "HermesInternal");
  if (hermesInternal.hasProperty(rt, "enablePromiseRejectionTracker")) {
    jsi::Object options(rt);
    options.setProperty(rt, "allRejections", true);
    setFn(rt, options, "onUnhandled", 2, [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value* args, size_t count) {
      double id = count > 0 && args[0].isNumber() ? args[0].getNumber() : -1;
      std::string msg = count > 1 ? describe(rt, args[1]) : "?";
      std::cout << "rejection not yet handled (id " << id << "): " << msg << std::endl;
      unhandledRejections[id] = msg;
      return jsi::Value::undefined();
    });
    setFn(rt, options, "onHandled", 1, [](jsi::Runtime&, const jsi::Value&, const jsi::Value* args, size_t count) {
      double id = count > 0 && args[0].isNumber() ? args[0].getNumber() : -1;
      std::cout << "rejection handled late (id " << id << ")" << std::endl;
      unhandledRejections.erase(id);
      return jsi::Value::undefined();
    });
    hermesInternal.getPropertyAsFunction(rt, "enablePromiseRejectionTracker").call(rt, std::move(options));
  }
}

// Drain microtasks (all of them, even if one throws), then fire the earliest
// due timer; repeat until idle.
void eventLoop(jsi::Runtime& rt) {
  for (;;) {
    for (bool drained = false; !drained;) {
      try {
        drained = rt.drainMicrotasks();
      } catch (const std::exception& e) {
        reportError("UNCAUGHT_ERROR", e.what());
      }
    }
    if (timers.empty()) return;
    auto next = timers.begin();
    for (auto it = timers.begin(); it != timers.end(); ++it)
      if (it->second.due < next->second.due) next = it;
    std::this_thread::sleep_until(next->second.due);
    Timer timer = next->second;
    if (timer.repeat)
      next->second.due = dueIn(timer.delayMs);
    else
      timers.erase(next);
    try {
      timer.fn->call(rt, (const jsi::Value*)timer.args->data(), timer.args->size());
    } catch (const std::exception& e) {
      reportError("UNCAUGHT_ERROR", e.what());
    }
  }
}

int run(jsi::Runtime& rt, const std::string& code, const char* url, bool hoopRandom) {
  try {
    installGlobals(rt, hoopRandom);
    rt.evaluateJavaScript(std::make_shared<jsi::StringBuffer>(code), url);
  } catch (const std::exception& e) {
    reportError("EVAL_ERROR", e.what());
    return 4;
  }
  eventLoop(rt);
  for (auto& [id, msg] : unhandledRejections) reportError("UNHANDLED_REJECTION", msg);
  return errors ? 5 : 0;
}

}  // namespace

int main(int argc, char** argv) {
  if (argc < 2) {
    std::cerr << "usage: host <bundle.js> [--hoop=get-random-values]" << std::endl;
    return 2;
  }
  bool hoopRandom = false;
  for (int i = 2; i < argc; i++) {
    std::string arg = argv[i];
    if (arg != "--hoop=get-random-values") {
      std::cerr << "HOST_ERROR: unknown argument " << arg << std::endl;
      return 2;
    }
    hoopRandom = true;
  }
  std::ifstream in(argv[1], std::ios::binary);
  if (!in) {
    std::cerr << "HOST_ERROR: cannot read " << argv[1] << std::endl;
    return 3;
  }
  std::stringstream code;
  code << in.rdbuf();

  auto rt = facebook::hermes::makeHermesRuntime(
      ::hermes::vm::RuntimeConfig::Builder().withMicrotaskQueue(true).build());
  int status = run(*rt, code.str(), argv[1], hoopRandom);
  timers.clear();  // no jsi value may outlive the runtime
  rt.reset();
  return status;
}
