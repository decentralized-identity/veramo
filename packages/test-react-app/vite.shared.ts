// Shared Vite plumbing for this package's two Vite-based configs
// (vite.config.ts = dev server / buildz, vitest.config.ts = test runner).
// Extracted so both run the app under the same polyfill contract; keep the
// two in sync by changing it here only.
//
// Node polyfills for the browser (mirrors what the former CRA/webpack config
// did: ProvidePlugin for `process` + npm: alias deps buffer/crypto/path/
// process/stream/util). Under Vite 8 (rolldown) we alias Node builtins to the
// node-stdlib-browser shims and define the free-variable globals
// (process/Buffer/global) that browserify-style deps use.
//
// Alias values are kept as DIRECTORY paths (package roots): rolldown
// prefix-matches alias keys (import 'buffer/index.js' hits key 'buffer' and
// appends '/index.js' to the value), so the value must be a folder.
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export function buildStdlibAliases(): Record<string, string> {
  const raw = require('node-stdlib-browser') as Record<string, string>
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

// Free-variable globals used by browserified deps. The dep optimizer gets the
// equivalent via optimizeDeps.rolldownOptions.transform.define below.
export const browserGlobalsDefine = {
  global: 'globalThis',
  process: 'globalThis.process',
  Buffer: 'globalThis.Buffer',
}
