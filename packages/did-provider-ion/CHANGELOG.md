# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.1.2](https://github.com/uport-project/veramo/compare/v5.1.1...v5.1.2) (2023-02-25)


### Bug Fixes

* **ci:** minor changes to trigger release alignment ([9db312f](https://github.com/uport-project/veramo/commit/9db312f8f049ec13ef394dc77fe6e2759143790d))





# [5.1.0](https://github.com/uport-project/veramo/compare/v5.0.0...v5.1.0) (2023-02-24)

**Note:** Version bump only for package @veramo/did-provider-ion





# [5.0.0](https://github.com/uport-project/veramo/compare/v4.3.0...v5.0.0) (2023-02-09)


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

**Note:** Version bump only for package @veramo/did-provider-ion





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **credential-w3c:** correct verification of credentials given as objects with jwt proofs ([#1071](https://github.com/uport-project/veramo/issues/1071)) ([b0d75e9](https://github.com/uport-project/veramo/commit/b0d75e9af7f28384ce2e5ef744dfbc3c302cd1a8))
* **deps:** bump dependencies ([701b8ed](https://github.com/uport-project/veramo/commit/701b8edf981ea11c7ddb6a81d2817dbbdbb022f3))
* **did-provider-ion:** await and update deps ([#1074](https://github.com/uport-project/veramo/issues/1074)) ([8cea4c0](https://github.com/uport-project/veramo/commit/8cea4c04746a3ef05e400df51a1b47168b46e45d))





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/did-provider-ion





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)


### Bug Fixes

* **deps:** Update dependency ethr-did-resolver to v7 ([#1038](https://github.com/uport-project/veramo/issues/1038)) ([d421c0f](https://github.com/uport-project/veramo/commit/d421c0f9f5934829df2930e58e98bcfce813ce84))
* **did-provider-ion:** delete new keys if addKey fails([#1045](https://github.com/uport-project/veramo/issues/1045)) ([db02742](https://github.com/uport-project/veramo/commit/db027423d709930dccfb7246738670726a33ab9f))


### Features

* add ION DID Provider implementation ([#987](https://github.com/uport-project/veramo/issues/987)) ([594571c](https://github.com/uport-project/veramo/commit/594571cf378ac59a91e2f93484c37285ec593999)), closes [#336](https://github.com/uport-project/veramo/issues/336) [#440](https://github.com/uport-project/veramo/issues/440)
