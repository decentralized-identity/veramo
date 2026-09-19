import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { browserGlobalsDefine, buildStdlibAliases, createNamespaceCallInteropVitePlugin } from './vite.shared.js'

// ---------------------------------------------------------------------------
// Test-runner config. The app-polyfill plumbing (Node builtin aliases,
// free-variable globals, namespace-call interop) is shared with
// vite.config.ts via vite.shared.ts so the runner and the dev server run the
// app under the same contract.
// ---------------------------------------------------------------------------

const stdlibAliases = buildStdlibAliases()

const namespaceCallInteropVitePlugin = createNamespaceCallInteropVitePlugin('veramo-browser-test-rewrites')

const namespaceCallInteropOptimizerPlugin = createNamespaceCallInteropVitePlugin('veramo-namespace-call-interop-optimizer')

// Note: no test-source URL rewriting is needed anymore. verifiableDataLD.ts's
// mocked context (https://veramo.io/contexts/discord-kudos/v1) is served
// locally by the nock shim's fetch interceptor, so it never leaves the page and
// no CORS mirror URL is required. Other veramo.io context URLs come from
// LdDefaultContexts (preloaded locally, never fetched).

export default defineConfig({
  plugins: [namespaceCallInteropVitePlugin],
  resolve: {
    alias: stdlibAliases,
  },
  define: browserGlobalsDefine,
  optimizeDeps: {
    // Vitest browser mode discovered these deps on the first run and reloaded
    // the test file mid-import ("optimized dependencies changed. reloading"),
    // which failed the suite. Pre-declaring the deps resolvable from this
    // package keeps the optimizer stable. (Transitive deps — @noble/*,
    // @digitalcredentials/*, nock internals, ... — are discovered on import;
    // their one-time reload race only happens on a cold .vite cache.)
    include: [
      '@metamask/eth-sig-util',
      'caip',
      'did-jwt',
      'did-jwt-vc',
      'did-resolver',
      'ethers',
      'ethr-did-resolver',
      'ganache',
      'uint8arrays',
      'uint8arrays/from-string',
      'uuid',
      'web-did-resolver',
    ],
    rolldownOptions: {
      plugins: [namespaceCallInteropOptimizerPlugin],
      resolve: {
        alias: stdlibAliases,
      },
      transform: {
        define: {
          // browserify-style free variables inside optimized dep bundles
          // (e.g. ganache.min.js uses free `process`, randombytes uses `global`)
          ...browserGlobalsDefine,
        },
      },
    },
  },
  test: {
    // The shared suites use global describe/it/expect without imports (they
    // cannot be modified), so globals must be injected.
    globals: true,
    // Only pick up the "*.vite-test.ts" files; legacy "*.browser-test.ts" files
    // (from the removed browser-driven runner) are not picked up.
    include: ['headless-tests/**/*.vite-test.ts'],
    // Installs globalThis.process / globalThis.Buffer in the browser before
    // test modules (and their optimized deps) are evaluated.
    setupFiles: ['./headless-tests/setup.vite-globals.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  server: {
    fs: {
      // The shared test suites live in <repo-root>/__tests__/shared and import
      // workspace packages from <repo-root>/packages/*/src — both are outside this
      // package's Vite root, so allow the whole repo.
      allow: ['../..'],
    },
  },
})
