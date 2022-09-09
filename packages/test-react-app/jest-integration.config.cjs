module.exports = {
  preset: 'ts-jest/presets/default-esm',
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "jsonld"],
  rootDir: 'headless-tests',
  testRegex: './*\\.browser-test\\.(ts|tsx?)$',
  transform: {},
  testTimeout: 10000,
  testRunner: 'jest-jasmine2',
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  globals: {
    "ts-jest": {
      "useESM": true,
      "tsconfig": "../tsconfig.settings.json"
    }
  },
}
