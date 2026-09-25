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
import { isPass, SAFE_SET_TEST_COUNT } from '../src/verdict.js'

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cacheDir = join(pkgDir, '.cache')
const req = createRequire(join(pkgDir, 'package.json'))
const BARE_EXPECTED = /Property 'TextDecoder' doesn't exist/
// Host exit codes: 0 all good, 4 bundle evaluation threw, 5 errors reported
// while running. Anything else (signal, crash, usage error) fails every mode.
const HOST_EXIT_OK = [0, 4, 5]
// sha256 of hermes-ios-<V>-hermes-ios-release.tar.gz, reviewed and pinned here.
const HERMES_SHA256 = {
  '250829098.0.17': '2967ee51b41bd433b3027dda875e96194354e2b4d715f9f186fd0c04ccef309d',
}
const MODES = [
  { name: 'bare', entry: 'src/entry.bare.ts', hoops: [], hostArgs: [] },
  {
    name: 'hoops',
    entry: 'src/entry.hoops.ts',
    hoops: [
      'text-encoding: fast-text-encoding@1.0.6 (pure JS, fills TextDecoder)',
      'get-random-values: react-native-get-random-values@2.0.0 emulated (host arc4random_buf + JS installer)',
    ],
    hostArgs: ['--hoop=get-random-values'],
  },
]

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

// 3. Metro bundles (Metro's JS API, config = metro.config.cjs).
const Metro = req(req.resolve('metro'))
log(`[metro] metro ${req('metro/package.json').version}, platform ios, dev=false`)
const config = await Metro.loadConfig({ config: join(pkgDir, 'metro.config.cjs'), cwd: pkgDir })
mkdirSync(join(cacheDir, 'bundles'), { recursive: true })
for (const mode of MODES) {
  mode.bundle = join(cacheDir, 'bundles', `${mode.name}.ios.js`)
  const { code } = await withTimeout(
    Metro.runBuild(config, { entry: mode.entry, platform: 'ios', dev: false, minify: false }),
    600,
    `metro ${mode.entry}`,
  )
  writeFileSync(mode.bundle, code)
  log(`[metro] ${mode.entry} -> ${mode.bundle} (${(code.length / 1024).toFixed(0)} KiB)`)
}

// 4. Run each bundle on Hermes.
function run(mode) {
  const r = spawnSync(hostBin, [mode.bundle, ...mode.hostArgs], { encoding: 'utf8', timeout: 120_000 })
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
  const passed = r.status === 0 && !hostError && isPass(result)
  return { out, result, firstError, crash, passed }
}

let ok = true
for (const mode of MODES) {
  log(
    `\n== ${mode.name} ==  active hoops: ${mode.hoops.length ? '\n  - ' + mode.hoops.join('\n  - ') : 'none'}`,
  )
  const r = run(mode)
  log(r.out.trimEnd().replace(/^/gm, '  | '))
  const summary = r.result
    ? `passed=${r.result.passed} failed=${r.result.failed} expected=${SAFE_SET_TEST_COUNT}`
    : 'no result line'
  if (r.crash) {
    log(`${mode.name}: FAIL (${r.crash})`)
    ok = false
  } else if (mode.name === 'bare') {
    if (r.passed) {
      log(`bare: UNEXPECTED PASS (${summary}) - a library improved; update BARE_EXPECTED and README.md`)
      ok = false
    } else if (BARE_EXPECTED.test(r.firstError ?? '')) {
      log(`bare: failed as expected (${BARE_EXPECTED}): ${r.firstError}`)
    } else {
      log(`bare: failure CHANGED (expected ${BARE_EXPECTED}), first error: ${r.firstError}`)
      ok = false
    }
  } else {
    log(
      `${mode.name}: ${r.passed ? 'PASS' : 'FAIL'} (${summary})${r.passed ? '' : ' first error: ' + r.firstError}`,
    )
    ok &&= r.passed
  }
}
log(ok ? '\nrn-harness: GREEN' : '')
if (!ok) fail('see above')
process.exit(0)
