# @veramo/test-rn-app: React Native harness

Checks that Veramo works in a React Native app on Hermes, without a device or simulator. For each mode,
`scripts/run.mjs`:

1. **bundles** the entry with Metro, using the RN app template's config (real RN module resolution: `react-native`
   and `browser` fields, `exports` conditions);
2. **compiles** the bundle with `hermesc`, the Hermes compiler react-native ships (npm package `hermes-compiler`),
   which rejects syntax Hermes cannot parse, such as `import.meta`;
3. **runs** the bundle in a `node:vm` context that holds only what React Native on Hermes provides, and requires a
   fixed number of tests to pass.

## Run

```sh
pnpm test:rn     # from the repo root: builds the @veramo/* deps, then runs scripts/run.mjs
```

| Mode | Entry | What it covers | Tests |
|---|---|---|---|
| `safe-set` | `src/entry.safe-set.ts` | an agent without JSON-LD: keys, signing, `did:fake` DIDs and resolution | 8 |
| `ld` | `src/entry.ld.ts` | `@veramo/credential-ld`'s golden fixtures, all four suites: verify, then re-issue byte-for-byte | 12 |

## What an RN app needs (what the entries install)

- A `TextDecoder` polyfill (`fast-text-encoding`; Expo ships one): Hermes has no `TextDecoder`, and did-jwt's
  multiformats needs it at module load. Every mode.
- `crypto.getRandomValues` (`react-native-get-random-values`, a native module): key generation and `uuid`. The runner
  provides it for `safe-set` only; credential-ld does not need it.

## The runtime

The vm context starts from V8's built-ins, adjusted to the Hermes VM react-native 0.87.1 ships (`run.mjs`,
`HERMES_ONLY` / `V8_ONLY`, measured by listing both engines' globals and built-in properties): it adds `TextEncoder`,
`atob` and `btoa`, and removes the newer V8 built-ins Hermes lacks (`Iterator`, `Object.groupBy`, `Intl.Segmenter`,
...). On that it installs RN's native globals (`nativeLoggingHook`, timers, `queueMicrotask`, `setImmediate`,
`RN$Bridgeless`, an empty `nativeModuleProxy`). The entries then run RN's own JS setup (`src/rn-runtime.js`:
`setUpGlobals`, `setUpXHR`), so `URL`, `self` and friends are React Native's, as in an app. `fetch`, XHR and `Blob`
need native modules, so they throw if used.

When react-native is upgraded, re-measure the lists if a library starts failing on a built-in the new Hermes has.

## Metro config

`babel.config.cjs` is the RN template's. `metro.config.cjs` is the template's plus two pnpm/monorepo options that an
app consuming published `@veramo/*` does not need: `watchFolders: [repoRoot]` (the workspace symlinks point outside
this package) and `resolver.nodeModulesPaths` (so `packages/*/build` files find this package's `@babel/runtime`). The
runner fails a bundle that contains a Node stdlib shim (`crypto-browserify`, `buffer`, ...): pnpm hoists store packages
where Metro can find them for any package, which a real app would not get.

## Limitations

- V8, not Hermes, executes the code: differences in built-in behaviour (as opposed to presence) are not covered.
- No native modules: `fetch` and remote context loading are not exercised (the JSON-LD tests use static contexts).
- Only `ios` bundles; `android` resolution is not checked.
