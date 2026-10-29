import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

// Browser runner WITHOUT the app's polyfill plumbing (see vite.shared.ts): no Node-stdlib aliases, no
// free-variable defines, no setup file. Only packages that need no polyfills belong here.
export default defineConfig({
  test: {
    // the RN harness's credential-ld test file, a plain vitest file, runs here unchanged
    include: ['../test-rn-app/tests/credential-ld.test.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
    testTimeout: 60000,
  },
  server: {
    // the test imports workspace sources and the golden fixtures from outside this package
    fs: { allow: ['../..'] },
  },
})
