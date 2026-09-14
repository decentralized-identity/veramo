import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import nodeStdlib from 'node-stdlib-browser'

// ---------------------------------------------------------------------------
// Node polyfills for the browser (mirrors what the former webpack config
// did: ProvidePlugin for `process` + npm: alias deps buffer/crypto/path/process/
// stream/util). Under Vite 8 (rolldown) we alias Node builtins to the
// node-stdlib-browser shims and define the free-variable globals
// (process/Buffer/global) that browserify-style deps use.
//
// Alias values are kept as DIRECTORY paths (package roots): rolldown
// prefix-matches alias keys (import 'buffer/index.js' hits key 'buffer' and
// appends '/index.js' to the value), so the value must be a folder.
// ---------------------------------------------------------------------------
const require = createRequire(import.meta.url)

function buildStdlibAliases(): Record<string, string> {
  const raw = nodeStdlib as Record<string, string>
  const aliases: Record<string, string> = {
    ...raw,
  }
  // Use the static process mock (nextTick/platform/argv/env) instead of the
  // node-stdlib-browser proxy module, which expects special bundler handling.
  const processMock = require.resolve('node-stdlib-browser/mock/process')
  aliases['process'] = processMock
  aliases['node:process'] = processMock
  // nock's real implementation requires Node's http module at module scope and
  // cannot even be evaluated in a browser. The shim intercepts globalThis.fetch
  // (installed via setupFiles) and serves the mocked discord-kudos JSON-LD
  // context locally; see headless-tests/shims/nock.browser.ts for the rationale.
  aliases['nock'] = new URL('./headless-tests/shims/nock.browser.ts', import.meta.url).pathname
  return aliases
}

const stdlibAliases = buildStdlibAliases()

// Some browserified deps do `import * as ns from 'cjs-pkg'` and then CALL the
// namespace (e.g. @digitalcredentials/ed25519-verification-key-2020's baseX.js
// does `import * as baseX from 'base-x'; baseX(BASE58)`). That worked under the
// former bundler/test-runner interop but not under native ESM namespace semantics. Rewrite
// such imports to default imports in the affected files.
function transformNamespaceCallInterop(code: string, id: string): string | null {
  if (!id.includes('@digitalcredentials/ed25519-verification-key-2020')) return null
  const from = "import * as baseX from 'base-x'"
  if (!code.includes(from)) return null
  return code.replace(from, "import baseX from 'base-x'")
}

// Note: no test-source URL rewriting is needed anymore. verifiableDataLD.ts's
// mocked context (https://veramo.io/contexts/discord-kudos/v1) is served
// locally by the nock shim's fetch interceptor, so it never leaves the page and
// no CORS mirror URL is required. Other veramo.io context URLs come from
// LdDefaultContexts (preloaded locally, never fetched).

const namespaceCallInteropVitePlugin = {
  name: 'veramo-browser-test-rewrites',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    return transformNamespaceCallInterop(code, id)
  },
}

const namespaceCallInteropOptimizerPlugin = {
  name: 'veramo-namespace-call-interop-optimizer',
  transform(code: string, id: string) {
    return transformNamespaceCallInterop(code, id)
  },
}

export default defineConfig({
  plugins: [namespaceCallInteropVitePlugin],
  resolve: {
    alias: stdlibAliases,
  },
  define: {
    // Free-variable globals used by browserified deps in source-transformed
    // modules. The dep optimizer gets the equivalent via
    // optimizeDeps.rolldownOptions below.
    global: 'globalThis',
    process: 'globalThis.process',
    Buffer: 'globalThis.Buffer',
  },
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
          global: 'globalThis',
          process: 'globalThis.process',
          Buffer: 'globalThis.Buffer',
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
