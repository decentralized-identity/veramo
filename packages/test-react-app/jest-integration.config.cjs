const { defaults } = require('jest-config')

const config = {
  preset: 'ts-jest/presets/default-esm',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts'],
  rootDir: 'headless-tests',
  testRegex: './*\\.browser-test\\.(ts|tsx?)$',
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', { useESM: true }],
  },
  transformIgnorePatterns: [],
  testTimeout: 30000,
  // //https://github.com/smooth-code/jest-puppeteer/issues/503 prevents us from using puppeteer currently
  // testRunner: 'jest-jasmine2',
  // globalSetup: 'jest-environment-puppeteer/setup',
  // globalTeardown: 'jest-environment-puppeteer/teardown',
  // testEnvironment: 'jest-environment-puppeteer',
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
}

module.exports = config
