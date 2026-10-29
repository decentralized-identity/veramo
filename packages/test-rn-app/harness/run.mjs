// RN harness runner: Metro bundles harness/app.ts as an RN app is bundled, hermesc (the Hermes compiler react-native
// ships) compiles the bundle, and the bundle runs in a node:vm context holding only what React Native on Hermes
// provides. A fixed number of tests must pass. See ../README.md.
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { webcrypto } from 'node:crypto'
import vm from 'node:vm'

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(pkgDir, '.cache')
const req = createRequire(join(pkgDir, 'package.json'))

// Built-ins of the Hermes VM react-native 0.88.1 ships (260318099.0.5) that a node:vm context lacks, and V8 built-ins that Hermes
// lacks (measured by listing both engines' globals and built-in properties). A library that feature-detects one of
// the latter takes its Hermes path here too. (Symbol.dispose / asyncDispose cannot be deleted; `using` would fail
// in hermesc anyway. Hermes' Math.sumPrecise is not added.)
const HERMES_ONLY = { atob, btoa, TextDecoder } // and TextEncoder, defined in the context by rnContext
const encoder = new TextEncoder()
const V8_ONLY = [
  'AsyncDisposableStack',
  'Atomics',
  'DisposableStack',
  'Float16Array',
  'SharedArrayBuffer',
  'SuppressedError',
  'WebAssembly',
  'Array.fromAsync',
  'Array.prototype.toSorted',
  'ArrayBuffer.prototype.maxByteLength',
  'ArrayBuffer.prototype.resizable',
  'ArrayBuffer.prototype.resize',
  'ArrayBuffer.prototype.transfer',
  'ArrayBuffer.prototype.transferToFixedLength',
  'Error.stackTraceLimit',
  'Intl.DisplayNames',
  'Intl.DurationFormat',
  'Intl.ListFormat',
  'Intl.Locale',
  'Intl.PluralRules',
  'Intl.RelativeTimeFormat',
  'Intl.Segmenter',
  'Intl.supportedValuesOf',
  'JSON.isRawJSON',
  'JSON.rawJSON',
  'Math.f16round',
  'RegExp.escape',
  'RegExp.prototype.unicodeSets',
  'TypedArray.prototype.toReversed',
  'TypedArray.prototype.toSorted',
  'TypedArray.prototype.with',
]
// Node-stdlib shims a real RN app would not have: pnpm hoists every store package into node_modules/.pnpm/node_modules,
// where Metro's hierarchical lookup can find one for any `require('crypto')`, giving a false green.
const LEAKED =
  /node_modules\/\.pnpm\/(crypto-browserify|stream-browserify|path-browserify|node-stdlib-browser|buffer|process|util)@/

const rnDir = dirname(req.resolve('react-native/package.json'))
const hermesc = join(
  dirname(createRequire(join(rnDir, 'package.json')).resolve('hermes-compiler/package.json')),
  'hermesc',
  { darwin: 'osx-bin/hermesc', linux: 'linux64-bin/hermesc', win32: 'win64-bin/hermesc.exe' }[
    process.platform
  ],
)

/** The vm context: what RN's native runtime and its JS setup provide, on Hermes' built-ins. */
function rnContext() {
  const context = vm.createContext({
    ...HERMES_ONLY,
    // RN's native globals: logging (RN's console polyfill is built on it), timers, bridgeless TurboModules (none)
    nativeLoggingHook: (message) => console.log('  | ' + message),
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    // RN's JS setup (setUpTimers.js): queueMicrotask, and setImmediate on top of microtasks
    queueMicrotask,
    setImmediate: (fn, ...args) => (queueMicrotask(() => fn(...args)), 0),
    clearImmediate: () => {},
    RN$Bridgeless: true,
    nativeModuleProxy: {
      // C++ TurboModule in every RN app; RN's `performance` (setUpPerformance) is built on it. Only what `now()` needs
      NativePerformanceCxx: { now: () => performance.now(), timeOrigin: () => performance.timeOrigin },
    },
    // the native half of react-native-get-random-values, which every Veramo RN app installs
    crypto: { getRandomValues: (array) => webcrypto.getRandomValues(array) },
  })
  const global = vm.runInContext('globalThis', context)
  const root = (name) => (name === 'TypedArray' ? Object.getPrototypeOf(global.Uint8Array) : global[name])
  for (const path of V8_ONLY) {
    const [head, ...keys] = path.split('.')
    const key = keys.pop()
    if (key === undefined) delete global[head]
    else delete keys.reduce((owner, k) => owner[k], root(head))[key]
  }
  delete global.console // RN's console polyfill (prepended by Metro) installs its own on nativeLoggingHook
  // defined in the context so it returns the context's Uint8Array: Node's returns Node's, which fails `instanceof`
  global.TextEncoder = vm.runInContext(
    `(encoder) => class TextEncoder {
      get encoding() { return 'utf-8' }
      encode(input = '') { return new Uint8Array(encoder.encode(String(input))) }
      encodeInto(input, destination) { return encoder.encodeInto(String(input), destination) }
    }`,
    context,
  )(encoder)
  return context
}

/** Bundles harness/app.ts and compiles it with hermesc; returns the bundle's code. */
async function build(Metro, config) {
  const bundle = join(outDir, 'index.ios.js')
  const built = await Metro.runBuild(config, {
    entry: 'harness/app.ts',
    platform: 'ios',
    dev: false,
    minify: false,
    sourceMap: true, // its `sources` feed the LEAKED check
    sourceMapUrl: 'index.ios.js.map',
  })
  writeFileSync(bundle, built.code)
  const leaked = JSON.parse(built.map)
    .sections.flatMap((section) => section.map.sources)
    .filter((f) => LEAKED.test(f))
  if (leaked.length) throw new Error(`bundle contains Node-stdlib shims: ${leaked.join(', ')}`)

  const compiled = spawnSync(hermesc, ['-emit-binary', '-out', join(outDir, 'index.ios.hbc'), bundle], {
    encoding: 'utf8',
  })
  if (compiled.status !== 0) throw new Error(`hermesc cannot compile the bundle:\n${compiled.stderr}`)
  return { code: built.code, filename: bundle }
}

/** Runs the bundle's tests; resolves to their result (harness/vitest.ts). */
async function run(bundle) {
  const context = rnContext()
  vm.runInContext(bundle.code, context, { filename: bundle.filename })
  return context.__harnessResult
}

const unhandled = []
process.on('unhandledRejection', (error) => unhandled.push(error))

const Metro = req(req.resolve('metro'))
const config = await Metro.loadConfig({ config: join(pkgDir, 'metro.config.cjs'), cwd: pkgDir })
mkdirSync(outDir, { recursive: true })
console.log(
  `rn-harness: react-native ${req('react-native/package.json').version}, metro ${req('metro/package.json').version}`,
)

const bundle = await build(Metro, config).catch((e) => {
  console.log(`rn-harness: FAIL: ${e?.message ?? e}\n\nrn-harness: RED`)
  process.exit(1)
})

const result = await run(bundle).catch((e) => ({
  passed: 0,
  failed: 1,
  failures: [{ name: 'bundle', error: e?.stack ?? e }],
}))
let ok = result.passed > 0 && result.failed === 0
console.log(`\nrn-harness: ${result.passed} passed, ${result.failed} failed`)
for (const { name, error } of result.failures) console.log(`  FAIL ${name}: ${error}`)
for (const error of unhandled) {
  console.log(`rn-harness: FAIL: unhandled rejection: ${error?.stack ?? error}`)
  ok = false
}
console.log(ok ? '\nrn-harness: GREEN' : '\nrn-harness: RED')
process.exit(ok ? 0 : 1)
