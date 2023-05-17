const { defaultsESM: tsJestPresetDefaultEsm } = require('ts-jest/presets')
const jestPuppeteerPreset = require('jest-puppeteer/jest-preset')

module.exports = Object.assign(jestPuppeteerPreset, tsJestPresetDefaultEsm)
