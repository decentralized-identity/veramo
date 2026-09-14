import path from 'node:path'
import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { browserGlobalsDefine, buildStdlibAliases, createNamespaceCallInteropVitePlugin } from './vite.shared'

// Dev server / build config for the React app (port 4269). The app mounts the
// full Veramo agent (see src/veramo/setup.ts), which bundles ganache for the
// browser — hence the same polyfill plumbing as the test runner (vite.shared.ts).
const stdlibAliases = buildStdlibAliases()

// @transmute/ed25519-key-pair@0.7.0-unstable.2 imports `tslib` without
// declaring it (packaging bug), so rolldown cannot resolve it under pnpm's
// strict layout. tslib is a devDependency of this package purely to give the
// alias below a legitimate resolution anchor.
const require = createRequire(import.meta.url)
const tslibAlias = { tslib: path.dirname(require.resolve('tslib/package.json')) }

export default defineConfig({
  plugins: [react(), createNamespaceCallInteropVitePlugin('veramo-browser-test-rewrites')],
  resolve: {
    alias: { ...stdlibAliases, ...tslibAlias },
  },
  define: browserGlobalsDefine,
  server: {
    port: 4269,
    fs: {
      // Workspace @veramo packages are consumed from source TypeScript
      // (<repo-root>/packages/*/src), which is outside this package's Vite
      // root, so allow the whole repo.
      allow: ['../..'],
    },
  },
  optimizeDeps: {
    // Workspace @veramo packages are consumed from source TypeScript; excluding
    // them keeps Vite from pre-bundling their build/ output.
    exclude: ['@veramo/*'],
    // Pre-declaring the deps resolvable from this package keeps the optimizer
    // stable (same rationale as vitest.config.ts: avoid the one-time
    // "optimized dependencies changed. reloading" race on a cold .vite cache).
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
      plugins: [createNamespaceCallInteropVitePlugin('veramo-namespace-call-interop-optimizer')],
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
})
