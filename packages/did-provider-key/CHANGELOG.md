# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.1.2](https://github.com/uport-project/veramo/compare/v5.1.1...v5.1.2) (2023-02-25)


### Bug Fixes

* **ci:** minor changes to trigger release alignment ([9db312f](https://github.com/uport-project/veramo/commit/9db312f8f049ec13ef394dc77fe6e2759143790d))





# [5.1.0](https://github.com/uport-project/veramo/compare/v5.0.0...v5.1.0) (2023-02-24)

**Note:** Version bump only for package @veramo/did-provider-key





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

**Note:** Version bump only for package @veramo/did-provider-key





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **deps:** bump dependencies ([701b8ed](https://github.com/uport-project/veramo/commit/701b8edf981ea11c7ddb6a81d2817dbbdbb022f3))





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/did-provider-key





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)

**Note:** Version bump only for package @veramo/did-provider-key





# [4.0.0](https://github.com/uport-project/veramo/compare/v3.1.5...v4.0.0) (2022-09-22)


### Bug Fixes

* **deps:** replace @transmute/lds-ecdsa-secp256k1-recovery2020 with fork ([#953](https://github.com/uport-project/veramo/issues/953)) ([573a0ef](https://github.com/uport-project/veramo/commit/573a0efe8d28653bd0389e401c25a2dd9c361a96)), closes [#952](https://github.com/uport-project/veramo/issues/952)
* **did-resolver:** use interface `Resolvable` instead of the `Resolver` class ([9c2e59f](https://github.com/uport-project/veramo/commit/9c2e59f3f23f808511c6c0e8e440b4d53ba5cb00))
* update and fix inline documentation of all exported types ([#921](https://github.com/uport-project/veramo/issues/921)) ([63e64e0](https://github.com/uport-project/veramo/commit/63e64e0e2693808c4704dca8cc511dc0bab3f3b1))


### Features

* **credential-ld:** add support for browser environments ([#916](https://github.com/uport-project/veramo/issues/916)) ([435e4d2](https://github.com/uport-project/veramo/commit/435e4d260b1774f96b182c1a75ab2f1c993f2291))
* **did-manager:** add`didManagerUpdate` method for full DID document updates ([#974](https://github.com/uport-project/veramo/issues/974)) ([5682b25](https://github.com/uport-project/veramo/commit/5682b2566b7c4f8f9bfda10e8d06a8d2624c2a1b)), closes [#971](https://github.com/uport-project/veramo/issues/971) [#960](https://github.com/uport-project/veramo/issues/960) [#948](https://github.com/uport-project/veramo/issues/948)





## [3.1.3](https://github.com/uport-project/veramo/compare/v3.1.2...v3.1.3) (2022-06-01)

**Note:** Version bump only for package @veramo/did-provider-key





# [3.1.0](https://github.com/uport-project/veramo/compare/v3.0.0...v3.1.0) (2021-11-12)

**Note:** Version bump only for package @veramo/did-provider-key





# [3.0.0](https://github.com/uport-project/veramo/compare/v2.1.3...v3.0.0) (2021-09-20)

**Note:** Version bump only for package @veramo/did-provider-key





# [2.1.0](https://github.com/uport-project/veramo/compare/v2.0.1...v2.1.0) (2021-08-11)

**Note:** Version bump only for package @veramo/did-provider-key





# [2.0.0](https://github.com/uport-project/veramo/compare/v1.2.2...v2.0.0) (2021-07-14)


### Features

* add fake did method usable in tests ([4fc587c](https://github.com/uport-project/veramo/commit/4fc587cf07a56b2065c7c6beec2345001f5a5f40))
* **cli:** export new agent methods and request LD DIDDocument by default ([#617](https://github.com/uport-project/veramo/issues/617)) ([26d088b](https://github.com/uport-project/veramo/commit/26d088b86ecfd66a00cdef7c7bb926148f46fbc9))





# [1.2.0](https://github.com/uport-project/veramo/compare/v1.1.2...v1.2.0) (2021-04-27)


### Bug Fixes

* **deps:** update all non-major dependencies ([#462](https://github.com/uport-project/veramo/issues/462)) ([4a2b206](https://github.com/uport-project/veramo/commit/4a2b20633810b45a155bf2149cbff57d157bda3c))
* **deps:** update dependency multibase to v4 ([#396](https://github.com/uport-project/veramo/issues/396)) ([7ea7a8d](https://github.com/uport-project/veramo/commit/7ea7a8d38b36be82f8eb9f025783fd95e9b51508))
* **deps:** update dependency multicodec to v3 ([#398](https://github.com/uport-project/veramo/issues/398)) ([9e23a10](https://github.com/uport-project/veramo/commit/9e23a102506792d199fed5820a01290de2474392))


### Features

* add native resolver for did:key ([#458](https://github.com/uport-project/veramo/issues/458)) ([a026f24](https://github.com/uport-project/veramo/commit/a026f247ad91dcb3a996e0e95b0fe253cf538f8b)), closes [#352](https://github.com/uport-project/veramo/issues/352)
* **did-provider-key:** add did:key provider; fixes [#335](https://github.com/uport-project/veramo/issues/335) ([#351](https://github.com/uport-project/veramo/issues/351)) ([42cd2b0](https://github.com/uport-project/veramo/commit/42cd2b08a2fd21b5b5d7bdfa57dd00ccc7184dc7)), closes [decentralized-identity/did-jwt#78](https://github.com/decentralized-identity/did-jwt/issues/78)
