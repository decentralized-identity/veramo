// RN harness runner: Metro-bundle the safe-set tests and run the
// bundles on the Hermes VM that react-native ships, hosted by host/host.cpp.
//
//   bare  : src/entry.bare.ts, no hoops. Must fail with BARE_EXPECTED, with a
//           clean host exit (a library getting better or worse is noticed).
//   hoops : src/entry.hoops.ts + host --hoop=get-random-values. Must pass all
//           SAFE_SET_TEST_COUNT tests.

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isPass, LD_TEST_COUNT, SAFE_SET_TEST_COUNT } from '../src/verdict.js'

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cacheDir = join(pkgDir, '.cache')
const req = createRequire(join(pkgDir, 'package.json'))
// Host exit codes: 0 all good, 4 bundle evaluation threw, 5 errors reported
// while running. Anything else (signal, crash, usage error) fails every mode.
const HOST_EXIT_OK = [0, 4, 5]
// sha256 of hermes-ios-<V>-hermes-ios-release.tar.gz, reviewed and pinned here.
const HERMES_SHA256 = {
  '250829098.0.17': '2967ee51b41bd433b3027dda875e96194354e2b4d715f9f186fd0c04ccef309d',
}
// Each hoop: its label, and the host flag that installs its native half (if any).
const HOOP = {
  textEncoding: { label: 'text-encoding: fast-text-encoding@1.0.6 (pure JS, fills TextDecoder)' },
  getRandomValues: {
    label:
      'get-random-values: react-native-get-random-values@2.0.0 emulated (host arc4random_buf + JS installer)',
    hostArg: '--hoop=get-random-values',
  },
  subtleDigest: {
    label:
      'subtle-digest: react-native-quick-crypto `crypto.subtle.digest` emulated (host CommonCrypto + JS installer)',
    hostArg: '--hoop=subtle-digest',
  },
  importMeta: {
    label:
      'import-meta: Babel transform of `import.meta` (babel-preset-expo unstable_transformImportMeta shape) + registry',
  },
}
// Packages that are only reachable through a sibling workspace package's
// Node-stdlib aliases (test-react-app: "crypto": "npm:crypto-browserify", ...),
// which pnpm hoists into node_modules/.pnpm/node_modules where Metro's
// hierarchical lookup finds them. A real RN app has none of them, so any of
// them in a bundle would be a false green: the run fails instead.
const LEAKED =
  /node_modules\/\.pnpm\/(crypto-browserify|stream-browserify|path-browserify|node-stdlib-browser|buffer|process|util)@/
const MODES = [
  // 10a: the safe set (no JSON-LD).
  {
    name: 'bare',
    entry: 'src/entry.bare.ts',
    hoops: [],
    expect: { stage: 'run', error: /Property 'TextDecoder' doesn't exist/ },
  },
  {
    name: 'hoops',
    entry: 'src/entry.hoops.ts',
    hoops: [HOOP.textEncoding, HOOP.getRandomValues],
    expect: { pass: SAFE_SET_TEST_COUNT },
  },
  // 10c: JSON-LD. Recorded dead-ends first, then the green candidate.
  {
    // Hermes cannot parse `import.meta`, which @digitalbazaar/credentials-context@3 (a dependency of
    // @digitalbazaar/vc) uses; this records what an RN app without the transform gets.
    name: 'ld-veramo-no-import-meta',
    entry: 'src/entry.ld-veramo.ts',
    hoops: [HOOP.textEncoding, HOOP.getRandomValues, HOOP.subtleDigest],
    expect: { stage: 'run', error: /'import\.meta' is currently unsupported/ },
  },
  {
    name: 'ld-veramo',
    entry: 'src/entry.ld-veramo.import-meta.ts',
    metroConfig: 'metro.import-meta.config.cjs',
    hoops: [HOOP.textEncoding, HOOP.getRandomValues, HOOP.subtleDigest, HOOP.importMeta],
    expect: { pass: LD_TEST_COUNT },
  },
]
const only = process.argv.slice(2)
for (const name of only)
  if (!MODES.some((m) => m.name === name)) {
    console.error(`rn-harness: unknown mode ${name}; modes: ${MODES.map((m) => m.name).join(', ')}`)
    process.exit(2)
  }
const modes = only.length ? MODES.filter((m) => only.includes(m.name)) : MODES
const hostArgs = (mode) => mode.hoops.flatMap((h) => (h.hostArg ? [h.hostArg] : []))

const log = (m) => console.log(m)
const fail = (m) => {
  console.error('rn-harness: FAIL: ' + m)
  process.exit(1)
}
function sh(cmd, args, timeoutSec, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: timeoutSec * 1000, ...opts })
  if (r.error || r.status !== 0) {
    fail(`${cmd} ${args.join(' ')} -> ${r.error?.message ?? 'exit ' + r.status}\n${r.stderr ?? ''}`)
  }
  return r.stdout
}
const withTimeout = (p, sec, label) =>
  Promise.race([
    p,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`${label} timed out (${sec}s)`)), sec * 1000).unref(),
    ),
  ])

if (process.platform !== 'darwin') {
  fail(
    'macOS only: the host links the macOS slice of hermesvm.framework. On Linux, build Hermes from source at tag hermes-v<V> (see README.md).',
  )
}

// 1. Hermes VM: the version react-native pins, from Maven, checked against HERMES_SHA256.
const rnDir = dirname(req.resolve('react-native/package.json'))
const V = readFileSync(join(rnDir, 'sdks/hermes-engine/version.properties'), 'utf8').match(
  /HERMES_VERSION_NAME=(\S+)/,
)[1]
const hermesDir = join(cacheDir, `hermes-ios-${V}`)
const include = join(hermesDir, 'destroot/include')
const frameworks = join(hermesDir, 'destroot/Library/Frameworks/macosx')
const url = `https://repo1.maven.org/maven2/com/facebook/hermes/hermes-ios/${V}/hermes-ios-${V}-hermes-ios-release.tar.gz`
const pinned = HERMES_SHA256[V]
if (!pinned) {
  const published = sh('curl', ['-fsSL', '--max-time', '60', url + '.sha256'], 70)
    .trim()
    .split(/\s+/)[0]
  fail(
    `Hermes ${V} has no pinned sha256. Published ${url}.sha256 is ${published}; review it and add it to HERMES_SHA256 in scripts/run.mjs.`,
  )
}
if (!existsSync(join(include, 'jsi/jsi.h'))) {
  const tgz = join(cacheDir, `hermes-ios-${V}.tar.gz`)
  mkdirSync(hermesDir, { recursive: true })
  log(`[hermes] downloading ${url}`)
  sh('curl', ['-fsSL', '--max-time', '600', '-o', tgz, url], 620)
  const got = createHash('sha256').update(readFileSync(tgz)).digest('hex')
  if (got !== pinned) fail(`sha256 mismatch for ${tgz}: pinned ${pinned}, got ${got}`)
  log(`[hermes] sha256 matches pinned value ${pinned}`)
  sh('tar', ['-xzf', tgz, '-C', hermesDir], 120)
}
log(
  `[hermes] react-native ${req('react-native/package.json').version} -> Hermes ${V} (cached in ${hermesDir})`,
)

// 2. JSI host, cached under a hash of host.cpp + compiler flags.
const hostSrc = join(pkgDir, 'host/host.cpp')
const flags = [
  '-std=c++20',
  '-O1',
  '-I',
  include,
  '-F',
  frameworks,
  '-framework',
  'hermesvm',
  '-Wl,-rpath,' + frameworks,
]
const hostKey = createHash('sha256').update(readFileSync(hostSrc)).update(JSON.stringify(flags)).digest('hex')
const hostBin = join(cacheDir, `host-${V}-${hostKey.slice(0, 12)}`)
if (!existsSync(hostBin)) {
  log('[host] compiling host.cpp')
  sh('clang++', [...flags, '-o', hostBin, hostSrc], 300)
}

// 3. Metro bundles (Metro's JS API; config = the mode's metro config). A
// bundle failure is recorded on the mode, not thrown: it may be the expectation.
const Metro = req(req.resolve('metro'))
log(`[metro] metro ${req('metro/package.json').version}, platform ios, dev=false`)
const configs = {}
mkdirSync(join(cacheDir, 'bundles'), { recursive: true })
for (const mode of modes) {
  const configFile = mode.metroConfig ?? 'metro.config.cjs'
  configs[configFile] ??= await Metro.loadConfig({ config: join(pkgDir, configFile), cwd: pkgDir })
  mode.bundle = join(cacheDir, 'bundles', `${mode.name}.ios.js`)
  let built
  try {
    built = await withTimeout(
      Metro.runBuild(configs[configFile], {
        entry: mode.entry,
        platform: 'ios',
        dev: false,
        minify: false,
        // an external (not inline) map: its `sources` feed the LEAKED check
        sourceMap: true,
        sourceMapUrl: `${mode.name}.ios.js.map`,
      }),
      600,
      `metro ${mode.entry}`,
    )
  } catch (e) {
    mode.bundleError = String(e?.message ?? e).split('\n')[0]
    log(`[metro] ${mode.entry}: bundle FAILED: ${mode.bundleError}`)
    continue
  }
  writeFileSync(mode.bundle, built.code)
  log(`[metro] ${mode.entry} -> ${mode.bundle} (${(built.code.length / 1024).toFixed(0)} KiB)`)
  const sources = JSON.parse(built.map).sections.flatMap((section) => section.map.sources)
  mode.leaked = sources.filter((f) => LEAKED.test(f))
}

// 4. Run each bundle on Hermes.
function run(mode) {
  const r = spawnSync(hostBin, [mode.bundle, ...hostArgs(mode)], {
    encoding: 'utf8',
    timeout: 120_000,
  })
  const out = (r.stdout ?? '') + (r.stderr ?? '')
  const line = out.split('\n').find((l) => l.startsWith('RN_HARNESS_RESULT '))
  const result = line ? JSON.parse(line.slice('RN_HARNESS_RESULT '.length)) : null
  const hostError = out
    .split('\n')
    .find((l) => /^(EVAL_ERROR|UNCAUGHT_ERROR|UNHANDLED_REJECTION|HOST_ERROR)/.test(l))
  const firstError = hostError ?? result?.failures[0]?.error ?? (r.error ? r.error.message : null)
  const crash = r.error
    ? `host did not complete: ${r.error.message}`
    : r.signal || !HOST_EXIT_OK.includes(r.status)
      ? `host crashed: ${r.signal ? 'signal ' + r.signal : 'exit ' + r.status}`
      : null
  // ran to the end: clean exit, no host-level error, a result line
  const clean = r.status === 0 && !hostError && result !== null
  const passed = clean && mode.expect.pass !== undefined && isPass(result, mode.expect.pass)
  return { out, result, firstError, crash, clean, passed }
}

// Returns null when the mode met its expectation, else the reason it did not.
function judge(mode) {
  const { expect } = mode
  const failedAs = (stage, error) =>
    expect.stage === stage && expect.error.test(error ?? '')
      ? (log(`${mode.name}: failed as expected at ${stage} (${expect.error}): ${error}`), null)
      : `${stage} failure ${expect.error ? 'CHANGED' : 'unexpected'} (expected ${
          expect.error ? expect.stage + ' ' + expect.error : 'a pass'
        }): ${error}`
  if (mode.bundleError) return failedAs('bundle', mode.bundleError)
  if (mode.leaked.length)
    return `bundle contains Node-stdlib shims hoisted from a sibling package: ${mode.leaked.join(', ')}`
  const r = run(mode)
  log(r.out.trimEnd().replace(/^/gm, '  | '))
  if (r.crash) return r.crash
  if (expect.pass !== undefined) {
    const summary = r.result ? `passed=${r.result.passed} failed=${r.result.failed}` : 'no result line'
    if (r.passed) return (log(`${mode.name}: PASS (${summary}, expected=${expect.pass})`), null)
    return `FAIL (${summary}, expected=${expect.pass}) first error: ${r.firstError}`
  }
  if (r.clean && r.result.failed === 0)
    return `UNEXPECTED PASS: a library improved; update this mode's expectation and README.md`
  return failedAs('run', r.firstError)
}

let ok = true
for (const mode of modes) {
  log(
    `\n== ${mode.name} ==  active hoops: ${mode.hoops.length ? '\n  - ' + mode.hoops.map((h) => h.label).join('\n  - ') : 'none'}`,
  )
  const problem = judge(mode)
  if (problem) {
    log(`${mode.name}: FAIL: ${problem}`)
    ok = false
  }
}
log(ok ? '\nrn-harness: GREEN' : '')
if (!ok) fail('see above')
process.exit(0)
