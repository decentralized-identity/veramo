# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.1.2](https://github.com/uport-project/veramo/compare/v5.1.1...v5.1.2) (2023-02-25)

**Note:** Version bump only for package @veramo/data-store-json





# [5.1.0](https://github.com/uport-project/veramo/compare/v5.0.0...v5.1.0) (2023-02-24)


### Bug Fixes

* P256 key parity corrections ([#1137](https://github.com/uport-project/veramo/issues/1137)) ([d0eca2b](https://github.com/uport-project/veramo/commit/d0eca2b3cd9ca6741f7f056e28bb9799910bc5ec)), closes [#1136](https://github.com/uport-project/veramo/issues/1136) [#1135](https://github.com/uport-project/veramo/issues/1135)





# [5.0.0](https://github.com/uport-project/veramo/compare/v4.3.0...v5.0.0) (2023-02-09)


### Bug Fixes

* **did-manager:** rename AbstractDIDStore methods for SES compatibility ([0287340](https://github.com/uport-project/veramo/commit/02873401508a8a7d8c999bc12dc1d107a4a5202f)), closes [#1090](https://github.com/uport-project/veramo/issues/1090)
* **key-manager:** rename Abstract[Private]KeyStore methods for SES compatibility ([91631b6](https://github.com/uport-project/veramo/commit/91631b6d2a09d46accff6509f44792d88209b801)), closes [#1090](https://github.com/uport-project/veramo/issues/1090)


### Build System

* convert veramo modules to ESM instead of CommonJS ([#1103](https://github.com/uport-project/veramo/issues/1103)) ([b5cea3c](https://github.com/uport-project/veramo/commit/b5cea3c0d80d900a47bd1d9eea68f84b70a35e7b)), closes [#1099](https://github.com/uport-project/veramo/issues/1099)


### Features

* isolate `core-types` package from `core` ([#1116](https://github.com/uport-project/veramo/issues/1116)) ([ba7a303](https://github.com/uport-project/veramo/commit/ba7a303de91cf4cc568a3af1ddf8ca98ed022e9f))


### BREAKING CHANGES

* **did-manager:** implementations of AbstractDIDStore need to rename their methods to conform to the new API. Functionality remains the same.
* **key-manager:** implementations of AbstractKeyStore and AbstractPrivateKeyStore need to rename their methods to conform to the new API. Functionality remains the same.
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

**Note:** Version bump only for package @veramo/data-store-json





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **deps:** bump dependencies ([701b8ed](https://github.com/uport-project/veramo/commit/701b8edf981ea11c7ddb6a81d2817dbbdbb022f3))





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/data-store-json





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)

**Note:** Version bump only for package @veramo/data-store-json





## [4.0.2](https://github.com/uport-project/veramo/compare/v4.0.1...v4.0.2) (2022-10-04)

**Note:** Version bump only for package @veramo/data-store-json





# [4.0.0](https://github.com/uport-project/veramo/compare/v3.1.5...v4.0.0) (2022-09-22)


### Bug Fixes

* **data-store-json:** structuredClone ([5369c28](https://github.com/uport-project/veramo/commit/5369c28517bd6539870fd2f4fafd9e3a357a6cf3))
* **data-store-json:** structuredClone ([#885](https://github.com/uport-project/veramo/issues/885)) ([cf14cae](https://github.com/uport-project/veramo/commit/cf14caecda1248af431e60841170611bc3d1e3b9)), closes [#857](https://github.com/uport-project/veramo/issues/857)
* **deps:** update dependency @ungap/structured-clone to v1 ([3d2a57b](https://github.com/uport-project/veramo/commit/3d2a57ba10d096af5dea19a59fc790c39fa94a5d))
* update and fix inline documentation of all exported types ([#921](https://github.com/uport-project/veramo/issues/921)) ([63e64e0](https://github.com/uport-project/veramo/commit/63e64e0e2693808c4704dca8cc511dc0bab3f3b1))


### Features

* **credential-ld:** add support for browser environments ([#916](https://github.com/uport-project/veramo/issues/916)) ([435e4d2](https://github.com/uport-project/veramo/commit/435e4d260b1774f96b182c1a75ab2f1c993f2291))
* **data-store-json:** BrowserLocalStorageStore ([#914](https://github.com/uport-project/veramo/issues/914)) ([7b520ab](https://github.com/uport-project/veramo/commit/7b520ab311bf55107bb0b4e6693695337b3fe200))
* **date-store-json:** add JSON object storage implementation ([#819](https://github.com/uport-project/veramo/issues/819)) ([934b34a](https://github.com/uport-project/veramo/commit/934b34a18b194928f90e7797289cc6f2243789ec))
