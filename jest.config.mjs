// import path from "path";
// import { createRequire } from 'module';
//
// const chalkPath = (await import.meta.resolve("chalk"))

export default {
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "jsonld"
  ],
  "collectCoverage": false,
  "collectCoverageFrom": [
    "packages/**/src/**/*.ts",
    "!**/examples/**",
    "!packages/cli/**",
    "!**/types/**",
    "!**/build/**",
    "!**/node_modules/**"
  ],
  "coverageReporters": [
    "text",
    "lcov",
    "json"
  ],
  "coverageProvider": "v8",
  "coverageDirectory": "./coverage",
  "extensionsToTreatAsEsm": [
    ".ts"
  ],
  "testMatch": [
    "**/__tests__/**/*.test.*"
  ],
  "testEnvironment": "node",
  "automock": false,
  "setupFiles": [
    "./setupJest.js"
  ],
  "moduleNameMapper": {
    "^(\\.{1,2}/.*)\\.js$": "$1",

    // // https://github.com/facebook/jest/issues/12270#issuecomment-1111533936
    // chalk: path.join(chalkPath.split("chalk/")[0], "chalk").substring(5),
    // "#ansi-styles": path.join(
    //   chalkPath.split("chalk/")[0],
    //   "chalk/source/vendor/ansi-styles/index.js",
    // ).substring(5),
    // "#supports-color": path.join(
    //   chalkPath.split("chalk/")[0],
    //   "chalk/source/vendor/supports-color/index.js",
    // ).substring(5),
  },
  "transform": {
    "^.+\\.m?tsx?$": [
      "ts-jest",
      {
        "useESM": true,
        "tsconfig": "./packages/tsconfig.settings.json"
      }
    ]
  }
}
