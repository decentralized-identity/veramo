# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.1.2](https://github.com/uport-project/veramo/compare/v5.1.1...v5.1.2) (2023-02-25)

**Note:** Version bump only for package @veramo/did-provider-pkh





# [5.1.0](https://github.com/uport-project/veramo/compare/v5.0.0...v5.1.0) (2023-02-24)


### Bug Fixes

* add missing `.js` file extension for ESM import ([#1123](https://github.com/uport-project/veramo/issues/1123)) ([6c850ac](https://github.com/uport-project/veramo/commit/6c850ac40f7dd0104c61851eee20551b1bb69ff6)), closes [#1122](https://github.com/uport-project/veramo/issues/1122)





# [5.0.0](https://github.com/uport-project/veramo/compare/v4.3.0...v5.0.0) (2023-02-09)


### Bug Fixes

* **did-provider-pkh:** add missing caip dependency ([#1112](https://github.com/uport-project/veramo/issues/1112)) ([60bc5fd](https://github.com/uport-project/veramo/commit/60bc5fd6f654236c072f7943494b3e27bd045ce8)), closes [#1111](https://github.com/uport-project/veramo/issues/1111)
* **did-provider-pkh:** refactor and simplify did:pkh plugin ([#1113](https://github.com/uport-project/veramo/issues/1113)) ([42be48f](https://github.com/uport-project/veramo/commit/42be48ffe2251510f7bd5e10b43362e816655eb9))


### Build System

* convert veramo modules to ESM instead of CommonJS ([#1103](https://github.com/uport-project/veramo/issues/1103)) ([b5cea3c](https://github.com/uport-project/veramo/commit/b5cea3c0d80d900a47bd1d9eea68f84b70a35e7b)), closes [#1099](https://github.com/uport-project/veramo/issues/1099)


### Features

* isolate `core-types` package from `core` ([#1116](https://github.com/uport-project/veramo/issues/1116)) ([ba7a303](https://github.com/uport-project/veramo/commit/ba7a303de91cf4cc568a3af1ddf8ca98ed022e9f))


### BREAKING CHANGES

* this is a breaking change as modules will have to be imported differently: 
* https://www.typescriptlang.org/docs/handbook/esm-node.html
* https://nodejs.org/api/esm.html
* https://caniuse.com/?search=modules

test(did-provider-ion): skip a couple of tests that fail with unreasonable errors
chore: use ubuntu-latest on CI
fix: temporarily remove puppeteer tests
fix: use craco for test-react-app to enable babel config
test: fix unit and integration tests (browser tests still broken)
fix: fix some build issues that prevented tests from working
fix: missing deps flagged by pnpm





# [4.3.0](https://github.com/uport-project/veramo/compare/v4.2.0...v4.3.0) (2023-01-27)

**Note:** Version bump only for package @veramo/did-provider-pkh





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Features

* **did-provider-pkh:** implement did:pkh support. ([#1052](https://github.com/uport-project/veramo/issues/1052)) ([5ad0bfb](https://github.com/uport-project/veramo/commit/5ad0bfb713dca8fd24b99ddf053335340a39e7b3)), closes [#1024](https://github.com/uport-project/veramo/issues/1024)
