// Browser-side globals for Node-style dependencies (runs inside Chromium before
// any test module or optimized dependency is evaluated).
//
// The dependency graph of the shared suites contains browserify-style packages
// that reference `process` and `Buffer` as free variables (the ganache browser
// build uses `process.nextTick`/`process.argv`/..., and webpack-era deps use
// `Buffer`). Under CRA/webpack these were provided by craco's ProvidePlugin;
// under Vite we install them on globalThis here, and the config maps free
// identifiers to `globalThis.process` / `globalThis.Buffer` via `define`.
import processShim from 'process'
import { Buffer as bufferShim } from 'buffer'

if (typeof globalThis.process !== 'object' || globalThis.process === null) {
  globalThis.process = processShim
}
if (typeof globalThis.Buffer !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).Buffer = bufferShim
}

export {}
