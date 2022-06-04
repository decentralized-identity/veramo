// .eslintrc.js
module.exports = {
  env: {
    jest: true,
  },
  globals: {
    page: true,
    browser: true,
    context: true,
    jestPuppeteer: true,
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020
  }
}
