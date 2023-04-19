import { defaults } from 'jest-config'

const config = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts'],
  collectCoverage: false,
  collectCoverageFrom: [
    "packages/**/src/**/*.ts",
    "!**/examples/**",
    "!packages/cli/**",
    "!**/types/**",
    "!**/build/**",
    "!**/node_modules/**"
  ],
  coverageReporters: [
    "text",
    "lcov",
    "json"
  ],
  coverageDirectory: "./coverage",
  coverageProvider: 'v8',
  testMatch: ['**/__tests__/**/*.test.ts'],
  automock: false,
  // // typescript 5 removes the need to specify relative imports as .js, so we should no longer need this workaround
  // // but webpack still requires .js specifiers, so we are keeping it for now
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.m?tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: "./packages/tsconfig.settings.json"
      }
    ]
  },
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: 'node',
}

export default config
