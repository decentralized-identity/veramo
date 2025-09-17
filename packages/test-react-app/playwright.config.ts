import { defineConfig, devices } from '@playwright/test'

const PORT = 3000

/**
 * Playwright configuration for Veramo test-react-app browser testing
 *
 * This configuration provides browser testing capabilities while maintaining
 * compatibility with existing tests.
 *
 * Note: This configuration is used by Jest through the jest-playwright-setup.mjs
 * file, not directly by Playwright's test runner. The Jest integration approach
 * allows us to maintain compatibility with existing shared test suites.
 *
 */
export default defineConfig({
  // Test directory - matches the current Jest configuration
  // Contains browser-specific test files (*.browser-test.ts)
  testDir: './headless-tests',

  // Disable parallel execution for browser tests
  fullyParallel: false,
  workers: 1,

  // Prevent focused tests (.only) in CI environments
  // Helps catch accidentally committed focused tests that would skip other tests
  forbidOnly: !!process.env.CI,

  // Retry configuration for handling flaky tests
  retries: process.env.CI ? 2 : 0,

  reporter: 'html',

  // Global timeout - matches current JEST_TIMEOUT (3 minutes)
  timeout: 180000, // 3 minutes = 180,000ms

  // Global test configuration
  use: {
    // Base URL for the React app
    baseURL: `http://localhost:${PORT}`,

    // Enable tracing on the first retry for debugging
    trace: 'on-first-retry',

    // Take screenshots on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',
  },

  // Browser projects configuration
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          // Browser arguments required for CI/sandbox environments
          // --no-sandbox: Disables Chrome's sandbox for Docker/CI environments
          // --disable-setuid-sandbox: Additional sandbox disabling for restricted environments
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: !process.env.HEADED,
        },
      },
    },
  ],

  // Web server configuration - replaces current Jest server setup
  webServer: {
    // Command to start the React development server
    // Uses pnpm to maintain consistency with project's package manager
    command: 'pnpm start',

    // Port where the React app will be served
    port: PORT,

    // Timeout for server startup
    timeout: 30000, // 30 seconds

    // Reuse existing server in development, start fresh in CI
    reuseExistingServer: !process.env.CI,

    // Environment variables passed to the server process
    env: {
      // Disable source map generation for faster builds in tests
      GENERATE_SOURCEMAP: 'false',
    },
  },

  // Test match patterns - matches current Jest testRegex
  testMatch: ['**/*.browser-test.ts', '**/*.browser-test.tsx'],

  // Assertion timeout configuration
  expect: {
    // Timeout for individual assertions
    timeout: 30000, // 30 seconds (matches current testTimeout)
  },
})
