import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

// Browser runner WITHOUT the app's polyfill plumbing (see vite.shared.ts): no Node-stdlib aliases, no
// free-variable defines, no setup file. Only packages that need no polyfills belong here.
export default defineConfig({
  test: {
    include: ['headless-tests/no-polyfills/**/*.vite-test.ts'],
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
