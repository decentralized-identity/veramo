const { defaultsESM: tsJestPresetDefaultEsm } = require('ts-jest/presets')

/**
 * Jest configuration for Playwright integration
 *
 * This configuration provides Playwright browser testing capabilities while maintaining
 * ESM support and TypeScript compilation settings for browser testing.
 *
 * Environment variables:
 * - CI: Automatically detected in CI environments
 * - HEADED: Set to 'true' to run with a visible browser
 */
const config = {
  // Use ts-jest preset for ESM support
  ...tsJestPresetDefaultEsm,

  // Test environment for Playwright integration
  testEnvironment: 'node',

  // Test directory - matches Playwright configuration
  rootDir: 'headless-tests',

  // Module file extensions - maintain existing ESM support
  // moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts'],

  // Treat these extensions as ESM modules
  // extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts', '.mtsx'],

  // Test file patterns - matches Playwright testMatch patterns
  testRegex: './*\\.browser-test\\.(ts|tsx?)$',

  // Transform configuration for TypeScript with ESM support
  transform: {
    '^.+\\.m?tsx?$': [
      'ts-jest',
      {
        useESM: true,
        // Ensure TypeScript compilation works with Playwright
        tsconfig: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'node',
        },
      },
    ],
  },

  // Don't ignore any modules for transformation
  transformIgnorePatterns: [],

  // Test timeout - matches Playwright expected timeout
  testTimeout: 30000,

  // Coverage configuration
  collectCoverage: false,
  coverageProvider: 'v8',

  // Module name mapping for ESM compatibility
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // TypeScript configuration for Playwright types
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Disable cache for consistent test runs
  cache: false,

  // Setup files for Playwright integration
  setupFilesAfterEnv: ['<rootDir>/jest-playwright-setup.mjs'],

  // Force exit to prevent hanging after tests complete
  // This is necessary because the server process may leave some handles open
  forceExit: true,

  // No need for globals configuration - ts-jest config is in transform
}

module.exports = config
