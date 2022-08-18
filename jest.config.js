/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "jsonld"],
  "collectCoverage": false,
  "collectCoverageFrom": [
    "packages/**/src/**/*.ts",
    "!**/examples/**",
    "!packages/cli/**",
    "!**/types/**",
    "!**/build/**",
    "!**/node_modules/**"
  ],
  "coverageReporters": ["text", "lcov", "json"],
  "coverageDirectory": "./coverage",
  "testMatch": ["**/__tests__/**/*.test.ts"],
  "transform": {
    "\\.jsx?$": "babel-jest",
    "\\.tsx?$": "ts-jest"
  },
  "extensionsToTreatAsEsm": [".ts"],
  "globals": {
    'ts-jest': {
      "useESM": true,
    },
  },
  "moduleNameMapper": {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  "rootDir": "./",
  "roots": [
    "<rootDir>",
  ],
  "modulePaths": [
    "<rootDir>",
  ],
  "moduleDirectories": ['node_modules'],
  "automock": false,
  "setupFiles": ["./setupJest.js"]
}
