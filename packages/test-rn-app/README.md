# @veramo/test-rn-app: React Native harness

Checks that Veramo works in a React Native app on Hermes, without a device or simulator.

```sh
pnpm test:rn                              # from the repo root: builds the @veramo/* deps, then runs the harness
pnpm --filter @veramo/test-rn-app test    # deps already built
```

## Layout

| Path | What it is |
|---|---|
| `tests/*.test.ts` | **the tests**: plain vitest files (`describe` / `it` / `expect` from `vitest`) |
| `harness/app.ts` | the harness app's `index.js`: RN's JS setup, then the test files |
| `harness/rn-runtime.js` | RN's own JS setup steps (`setUpGlobals`, `Event`/`EventTarget`, `setUpPerformance`, `setUpXHR`) |
| `harness/vitest.ts` | what `vitest` is in the bundle: vitest's own `expect` (`@vitest/expect`), and a minimal `describe` / `it` / `beforeAll` |
| `harness/run.mjs` | the runner: bundle, compile, run (below) |
| `harness/probe-builtins.js` | lists an engine's built-ins, for re-measuring Hermes on upgrades (below) |
| `metro.config.cjs`, `babel.config.cjs` | the RN app template's, plus the deltas below |

To add tests, add a vitest file to `tests/` and import it in `harness/app.ts`. Only `describe`, `it` / `test`,
`beforeAll`, `expect`, and `describe.each` / `it.each` over a list of objects (names with `$property`) are available;
tests in a file run in order.

| Test file | What it covers |
|---|---|
| `tests/agent.test.ts` | an agent without JSON-LD: keys, signing, `did:fake` DIDs and resolution |
| `tests/credential-ld.test.ts` | `@veramo/credential-ld`'s golden fixtures, all four suites: verify, then re-issue byte-for-byte. Also runs in Chromium without polyfills (`packages/test-react-app/vitest.no-polyfills.config.ts`) |

## How it runs

`harness/run.mjs`:

1. **bundles** `harness/app.ts` with Metro, using the RN app template's config (real RN module resolution:
   `react-native` and `browser` fields, `exports` conditions);
2. **compiles** the bundle with `hermesc`, the Hermes compiler react-native ships (npm package `hermes-compiler`),
   which rejects syntax Hermes cannot parse, such as `import.meta`;
3. **runs** the bundle in a `node:vm` context that holds only what React Native on Hermes provides, and fails unless
   every registered test passes.

## What an RN app needs

- `crypto.getRandomValues` (`react-native-get-random-values`, a native module): key generation and `uuid`. The runner
  provides it, standing in for the native module.
- On react-native 0.87 and older, also a `TextDecoder` polyfill (e.g. `fast-text-encoding`; Expo ships one): did-jwt's
  multiformats needs it at module load, and Hermes has its own only since react-native 0.88.

## The runtime

The vm context starts from V8's built-ins, adjusted to the Hermes VM react-native 0.88.1 ships (`run.mjs`,
`HERMES_ONLY` / `V8_ONLY`, measured with `harness/probe-builtins.js`): it adds `TextEncoder`, `TextDecoder`, `atob`
and `btoa`, and removes the newer V8 built-ins Hermes lacks (`Array.prototype.toSorted`, `Intl.Segmenter`, ...). On
that it installs RN's native globals (`nativeLoggingHook`, timers, `queueMicrotask`, `setImmediate`, `RN$Bridgeless`,
and a `nativeModuleProxy` holding only `NativePerformanceCxx.now`, which RN's `performance` is built on).
`harness/rn-runtime.js` then runs RN's own JS setup, so `URL`, `EventTarget`, `performance`, `self` and friends are
React Native's, as in an app. `fetch`, XHR and `Blob` need native modules, so they throw if used.

## Upgrading react-native

1. Bump `react-native`, `react` (to react-native's peer range), `@react-native/babel-preset` and
   `@react-native/metro-config` in `package.json` (`metro` to what `@react-native/metro-config` depends on), then
   `pnpm install`. `hermes-compiler` follows `react-native`.
2. Run `pnpm test:rn` and fix what fails.
3. Diff react-native's `src/private/setup/setUpDefaultReactNativeEnvironment.js` (and `setUpDOM.js`) between the two
   versions, and mirror new or moved setup steps in `harness/rn-runtime.js`.
4. Re-measure Hermes: run `harness/probe-builtins.js` on the new Hermes VM and in a `node:vm` context, diff the two
   lists, and update `HERMES_ONLY` / `V8_ONLY` in `run.mjs`. To run it on Hermes without a device, build the JSI host
   from git history (`git show 00896a92:packages/test-rn-app/host/host.cpp`) against
   `com.facebook.hermes:hermes-ios:<HERMES_VERSION_NAME>` from Maven (macOS; compile flags in that commit's
   `scripts/run.mjs`), and run `host harness/probe-builtins.js`. Not part of the harness; only needed here.

## Metro config

`babel.config.cjs` is the RN template's. `metro.config.cjs` is the template's plus two pnpm/monorepo options that an
app consuming published `@veramo/*` does not need: `watchFolders: [repoRoot]` (the workspace symlinks point outside
this package) and `resolver.nodeModulesPaths` (so `packages/*/build` files find this package's `@babel/runtime`). Its
`resolver.resolveRequest` applies only to imports from `harness/` and `tests/`: `vitest` resolves to
`harness/vitest.ts`, and `./x.js` to a sibling `./x.ts` (the repo's import style, which Metro does not resolve).
Dependencies resolve unchanged. The runner fails a bundle that contains a Node stdlib shim (`crypto-browserify`,
`buffer`, ...): pnpm hoists store packages where Metro can find them for any package, which a real app would not get.

## Limitations

- V8, not Hermes, executes the code: differences in built-in behaviour (as opposed to presence) are not covered.
- No native modules: `fetch` and remote context loading are not exercised (the JSON-LD tests use static contexts).
- Only `ios` bundles; `android` resolution is not checked.
