const { defaults } = require('jest-config')

/**
 * @type {import('jest-environment-puppeteer').JestPuppeteerConfig}
 */
const config = {
  // preset path is relative to the rootDir when that is set
  preset: '../jest-preset-puppeteer-esm/jest-preset.cjs',
  rootDir: 'headless-tests',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts'],
  testRegex: './*\\.browser-test\\.(ts|tsx?)$',
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', { useESM: true }],
  },
  transformIgnorePatterns: [],
  testTimeout: 30000,
  collectCoverage: false,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
}

module.exports = config
