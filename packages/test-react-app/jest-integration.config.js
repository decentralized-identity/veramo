module.exports = {
  preset: 'jest-puppeteer',
  rootDir: 'headless-tests',
  testRegex: './*\\.browser-test\\.(ts|tsx?)$',
  transform: {"\\.ts$": ['ts-jest']},
  testTimeout: 3 * 60 * 1000,
  testRunner: 'jest-jasmine2',
  moduleNameMapper: {
    // jest 28 loads modules differently. See https://jestjs.io/docs/upgrading-to-jest28#packagejson-exports
    '^uuid$': require.resolve('uuid'),
  }
}
