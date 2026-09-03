import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

// Vitest browser-mode runner, kept alongside the CRA/Jest integration runner
// (jest-integration.config.cjs). Do not touch the Jest config.
export default defineConfig({
  test: {
    // Only pick up the new "*.vite-test.ts" files; the legacy "*.browser-test.ts"
    // files in this directory still belong to jest-puppeteer.
    include: ['headless-tests/**/*.vite-test.ts'],
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
