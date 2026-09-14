// Browser-side globals for Node-style dependencies (runs inside Chromium before
// any test module or optimized dependency is evaluated).
//
// The dependency graph of the shared suites contains browserify-style packages
// that reference `process` and `Buffer` as free variables (the ganache browser
// build uses `process.nextTick`/`process.argv`/..., and webpack-era deps use
// `Buffer`). The previous webpack-based build provided them via its
// ProvidePlugin; under Vite they are installed on globalThis here, and the
// config maps free identifiers to `globalThis.process` / `globalThis.Buffer`
// via `define`.
import processShim from 'process'
import { Buffer as bufferShim } from 'buffer'

// Activates the browser nock shim's globalThis.fetch interceptor (idempotent).
// This MUST happen here, in a setupFiles entry, before any test module or
// dependency is evaluated: cross-fetch (used by @veramo/credential-ld's
// document loader) captures globalThis.fetch at module-evaluation time, so a
// patch installed later (e.g. when the 'nock' alias is first imported by the
// shared suites) would be bypassed. See shims/nock.browser.ts.
import './shims/nock.browser'

if (typeof globalThis.process !== 'object' || globalThis.process === null) {
  globalThis.process = processShim
}
if (typeof globalThis.Buffer !== 'function') {
  // Targeted augmentation instead of `globalThis as any`: only `Buffer` is
  // being installed here, and the guard above keeps the assignment optional.
  const globalScope = globalThis as typeof globalThis & { Buffer?: unknown }
  globalScope.Buffer = bufferShim
}

export {}
