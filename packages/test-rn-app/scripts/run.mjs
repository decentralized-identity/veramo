// RN harness runner: for each mode, Metro bundles the entry as an RN app is bundled, hermesc (the Hermes compiler
// react-native ships) compiles the bundle, and the bundle runs in a node:vm context holding only what React Native on
// Hermes provides. Each mode must pass a fixed number of tests. See ../README.md.
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

// Counts are fixed here, not derived from what ran, so a test that silently stops running fails the harness.
// `getRandomValues` stands in for react-native-get-random-values, a native module every RN app installs.
const MODES = [
  { name: 'safe-set', entry: 'src/entry.safe-set.ts', expected: 8, getRandomValues: true },
  // 4 suites x (verify credential, verify presentation, byte-identical re-issue)
  { name: 'ld', entry: 'src/entry.ld.ts', expected: 12 },
]

// Built-ins of the Hermes VM react-native 0.87.1 ships that a node:vm context lacks, and V8 built-ins that Hermes
// lacks (measured by listing both engines' globals and built-in properties). A library that feature-detects one of
// the latter takes its Hermes path here too. (Symbol.dispose / asyncDispose cannot be deleted; `using` would fail
// in hermesc anyway.)
const HERMES_ONLY = { atob, btoa } // and TextEncoder, defined in the context by rnContext
const encoder = new TextEncoder()
const V8_ONLY = [
  'AsyncDisposableStack',
  'Atomics',
  'DisposableStack',
  'FinalizationRegistry',
  'Float16Array',
  'Iterator',
  'SharedArrayBuffer',
  'SuppressedError',
  'WebAssembly',
  'Array.fromAsync',
  'Array.prototype.toSorted',
  'ArrayBuffer.prototype.detached',
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
  'Map.groupBy',
  'Math.f16round',
  'Object.groupBy',
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

const only = process.argv.slice(2)
const modes = only.length ? MODES.filter((m) => only.includes(m.name)) : MODES
if (modes.length !== (only.length || MODES.length)) {
  console.error(
    `rn-harness: unknown mode in ${only.join(', ')}; modes: ${MODES.map((m) => m.name).join(', ')}`,
  )
  process.exit(2)
}

const rnDir = dirname(req.resolve('react-native/package.json'))
const hermesc = join(
  dirname(createRequire(join(rnDir, 'package.json')).resolve('hermes-compiler/package.json')),
  'hermesc',
  { darwin: 'osx-bin/hermesc', linux: 'linux64-bin/hermesc', win32: 'win64-bin/hermesc.exe' }[
    process.platform
  ],
)

/** The vm context: what RN's native runtime and its JS setup provide, on Hermes' built-ins. */
function rnContext(mode) {
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
    nativeModuleProxy: {},
    ...(mode.getRandomValues && { crypto: { getRandomValues: (array) => webcrypto.getRandomValues(array) } }),
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

async function runMode(mode, config, Metro) {
  const bundle = join(outDir, `${mode.name}.ios.js`)
  const built = await Metro.runBuild(config, {
    entry: mode.entry,
    platform: 'ios',
    dev: false,
    minify: false,
    sourceMap: true, // its `sources` feed the LEAKED check
    sourceMapUrl: `${mode.name}.ios.js.map`,
  })
  writeFileSync(bundle, built.code)
  const leaked = JSON.parse(built.map)
    .sections.flatMap((section) => section.map.sources)
    .filter((f) => LEAKED.test(f))
  if (leaked.length) return `bundle contains Node-stdlib shims: ${leaked.join(', ')}`

  const compiled = spawnSync(hermesc, ['-emit-binary', '-out', bundle.replace(/\.js$/, '.hbc'), bundle], {
    encoding: 'utf8',
  })
  if (compiled.status !== 0) return `hermesc cannot compile the bundle:\n${compiled.stderr}`

  const context = rnContext(mode)
  vm.runInContext(built.code, context, { filename: bundle })
  const result = await context.__harnessResult
  const failures = result.failures.map((f) => `\n  ${f.name}: ${f.error}`).join('')
  return result.passed === mode.expected && result.failed === 0
    ? null
    : `passed=${result.passed} failed=${result.failed} expected=${mode.expected}${failures}`
}

const unhandled = []
process.on('unhandledRejection', (error) => unhandled.push(error))

const Metro = req(req.resolve('metro'))
const config = await Metro.loadConfig({ config: join(pkgDir, 'metro.config.cjs'), cwd: pkgDir })
mkdirSync(outDir, { recursive: true })
console.log(
  `rn-harness: react-native ${req('react-native/package.json').version}, metro ${req('metro/package.json').version}`,
)

let ok = true
for (const mode of modes) {
  console.log(`\n== ${mode.name} (${mode.entry})`)
  const problem = await runMode(mode, config, Metro).catch((e) => String(e?.stack ?? e))
  console.log(
    problem ? `${mode.name}: FAIL: ${problem}` : `${mode.name}: PASS (${mode.expected}/${mode.expected})`,
  )
  ok &&= !problem
}
for (const error of unhandled) {
  console.log(`rn-harness: FAIL: unhandled rejection: ${error?.stack ?? error}`)
  ok = false
}
console.log(ok ? '\nrn-harness: GREEN' : '\nrn-harness: RED')
process.exit(ok ? 0 : 1)
