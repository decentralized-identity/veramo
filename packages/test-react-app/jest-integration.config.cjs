module.exports = {
  preset: 'ts-jest/presets/default-esm',
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "jsonld"],
  rootDir: 'headless-tests',
  testRegex: './*\\.browser-test\\.(ts|tsx?)$',
  "transform": {
    "./*\\node_modules/uuid\\**\\*.js": "../config/jest/babelTransform.cjs",
    "^.+\\.m?tsx?$": ["ts-jest", {"useESM": true}]
  },
  transformIgnorePatterns: [],
  testTimeout: 30000,
  // //https://github.com/smooth-code/jest-puppeteer/issues/503 prevents us from using puppeteer currently
  // testRunner: 'jest-jasmine2',
  // "globalSetup": "jest-environment-puppeteer/setup",
  // "globalTeardown": "jest-environment-puppeteer/teardown",
  // "testEnvironment": "jest-environment-puppeteer",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", '^uuid$': require.resolve('uuid')
  }
}
