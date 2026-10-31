import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { browserGlobalsDefine, buildStdlibAliases } from './vite.shared.js'

// Dev server / build config for the React app (port 4269). The app mounts the
// full Veramo agent (see src/veramo/setup.ts), which bundles ganache for the
// browser — hence the same polyfill plumbing as the test runner (vite.shared.ts).
const stdlibAliases = buildStdlibAliases()

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: stdlibAliases,
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
