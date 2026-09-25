# @veramo/test-rn-app: React Native harness

Metro bundles a tiny Veramo agent (the "safe set": core, key-manager, kms-local, did-manager,
did-resolver, test-utils' did:fake) and runs the bundle on **the Hermes VM that react-native 0.87.1
pins**, hosted by a small C++ JSI program (`host/host.cpp`). No device, no simulator, and the bundle
never runs on Node. The goal is to measure honestly which hoops an RN consumer must jump through.

## Run

```sh
pnpm test:rn     # from the repo root: builds the @veramo/* deps, then runs scripts/run.mjs
```

## Host-provided globals

The host has no `InitializeCore`, so it provides natively what RN's runtime (native code plus its
own JS setup) gives every app. Paths are under `node_modules/react-native/` (0.87.1).

| Global | Installed in RN by | RN source |
|---|---|---|
| microtask queue (runtime config) | native | `ReactCommon/react/runtime/hermes/HermesInstance.cpp` (`withMicrotaskQueue`) |
| `RN$Bridgeless = true` | native | `ReactCommon/react/runtime/ReactInstance.cpp` |
| `nativeLoggingHook(msg, level)` | native | `ReactCommon/jsitooling/react/runtime/JSRuntimeBindings.cpp`; `console` is built on it by `@react-native/js-polyfills/console.js` (a Metro-prepended RN polyfill) |
| `setTimeout/clearTimeout/setInterval/clearInterval` | native | `ReactCommon/react/runtime/TimerManager.cpp` (delay NaN/negative → 0; the host also caps at 2^31-1 ms) |
| `queueMicrotask(fn)` | RN JS setup | `Libraries/Core/setUpTimers.js` (bridgeless branch) over the `NativeMicrotasks` C++ TurboModule (`ReactCommon/react/nativemodule/microtasks/NativeMicrotasks.cpp`) |
| `setImmediate/clearImmediate` (microtask-based) | RN JS setup | `Libraries/Core/Timers/immediateShim.js` via `setUpTimers.js` |
| promise rejection tracker (diagnostic) | RN JS setup, `__DEV__` | `Libraries/Core/polyfillPromise.js` + `Libraries/promiseRejectionTrackingOptions.js` (`onUnhandled`/`onHandled`); only rejections still unhandled when the loop is idle count as errors |

**Not provided:** `crypto`, `Buffer`, `process`, `fetch`, `TextDecoder`, `window`, `self`, `URL`.

## Limitations

- **macOS only**: links the macOS slice of `hermesvm.framework`. Linux would need Hermes built from
  source at tag `hermes-v${V}`, linked to the same `host.cpp`.
- **No `InitializeCore`**: no TurboModules, no bridge; JS-side globals such as `window`, `fetch`,
  `XMLHttpRequest`, `URL`, `performance`, `navigator`, `ErrorUtils` are absent. That can only
  cause a false red, never a false green; nothing in the chain above is caused by it.
- `fetch` (RN's JS `fetch` over the native `Networking` module) is deferred.
- Only `ios` bundles are built; `android` resolution is not measured.
- Lockfile side effect: with `react-native@0.87.1` in the workspace, pnpm now satisfies the optional
  `react-native` peer of the expo/@sphereon chains used by `@veramo/credential-ld` and
  `@veramo/did-provider-ion` with 0.87.1 (previously the auto-installed 0.81.4). No `@veramo/*` dep
  changed.
