# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.5.0](https://github.com/uport-project/veramo/compare/v5.4.1...v5.5.0) (2023-09-19)


### Bug Fixes

* **deps:** update dependency cross-fetch to v4 ([1c14d34](https://github.com/uport-project/veramo/commit/1c14d34f48a51bef373541e84ed89f2f44711406))
* **did-provider-key:** use compressed keys for creating Secp256k1 did:key ([#1217](https://github.com/uport-project/veramo/issues/1217)) ([ba8f6f5](https://github.com/uport-project/veramo/commit/ba8f6f5b9b701e57af86491504ecd209ca0c1c1d)), closes [#1213](https://github.com/uport-project/veramo/issues/1213)


### Features

* **core-types:** export a basic mapping between key types and algorithms ([57b6c58](https://github.com/uport-project/veramo/commit/57b6c583138b0f8f283f4f00b27573529f394a7a))





## [5.4.1](https://github.com/uport-project/veramo/compare/v5.4.0...v5.4.1) (2023-08-04)


### Bug Fixes

* **ci:** benign change meant to tag all packages for another patch release ([#1211](https://github.com/uport-project/veramo/issues/1211)) ([41b5c90](https://github.com/uport-project/veramo/commit/41b5c90277171b7b38c5cf49ca01db5cf75b6300))





# [5.4.0](https://github.com/uport-project/veramo/compare/v5.3.0...v5.4.0) (2023-08-01)


### Features

* **credential-w3c:** allow issuers with query parameters for credentials and presentations ([#1207](https://github.com/uport-project/veramo/issues/1207)) ([688f59d](https://github.com/uport-project/veramo/commit/688f59d6b492bc25bc51bbe73be969d6c30a958d)), closes [#1201](https://github.com/uport-project/veramo/issues/1201)
* **did-comm:** add support for the AES based content and key encryption algorithms ([#1180](https://github.com/uport-project/veramo/issues/1180)) ([5294a81](https://github.com/uport-project/veramo/commit/5294a812ee578c0712b54f216416c3ef78c848da))





# [5.3.0](https://github.com/uport-project/veramo/compare/v5.2.0...v5.3.0) (2023-07-27)


### Bug Fixes

* **deps:** update dependency multiformats to v12 ([11fa7c3](https://github.com/uport-project/veramo/commit/11fa7c340da78101ea5e974e8ae0f90193933976))
* support publicKeyJwk when comparing blockchainAccountId ([#1194](https://github.com/uport-project/veramo/issues/1194)) ([9110688](https://github.com/uport-project/veramo/commit/9110688cc02707d0c5ac06fe52916b7910b2d99c))





# [5.2.0](https://github.com/uport-project/veramo/compare/v5.1.4...v5.2.0) (2023-05-02)


### Bug Fixes

* **credential-ld:** fix Ed25519Signature2020 verification ([#1166](https://github.com/uport-project/veramo/issues/1166)) ([c965fd5](https://github.com/uport-project/veramo/commit/c965fd502f652c9929ae4753c56ebbe351447733))


### Features

* add did-peer provider and resolver ([#1156](https://github.com/uport-project/veramo/issues/1156)) ([9502063](https://github.com/uport-project/veramo/commit/95020632f741bd4640b3496b7b1bf19f5e6641d0))





## [5.1.2](https://github.com/uport-project/veramo/compare/v5.1.1...v5.1.2) (2023-02-25)

**Note:** Version bump only for package @veramo/utils





# [5.1.0](https://github.com/uport-project/veramo/compare/v5.0.0...v5.1.0) (2023-02-24)


### Features

* **core-types:** allow inline [@context](https://github.com/context) for Credentials and Presentations ([#1119](https://github.com/uport-project/veramo/issues/1119)) ([44bb365](https://github.com/uport-project/veramo/commit/44bb36503b635ee1f5431cb4bf28c7a9ba111156)), closes [#1073](https://github.com/uport-project/veramo/issues/1073)





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


### Bug Fixes

* **utils:** convert JWK with curv `Ed25519` to `X25519` ([#1078](https://github.com/uport-project/veramo/issues/1078)) ([deb546b](https://github.com/uport-project/veramo/commit/deb546ba94fa1dc51662adddbe303d63a0e7ce12))


### Features

* **utils:** add publicKeyJwk as valid verificationMethod in getEthereumAddress ([#1096](https://github.com/uport-project/veramo/issues/1096)) ([a4209f5](https://github.com/uport-project/veramo/commit/a4209f5ffc95d9fde6bbdb9df6d16e8d961341f6))





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **utils:** correctly extract publicKeyHex from [Ed/X]25519 2020 keys ([#1076](https://github.com/uport-project/veramo/issues/1076)) ([c73002c](https://github.com/uport-project/veramo/commit/c73002c97d8c688e343aba65efd4c8e857a96522)), closes [#1067](https://github.com/uport-project/veramo/issues/1067)


### Features

* **credential-ld:** add `Ed25519Signature2020` & `JsonWebSignature2020` experimental support ([#1030](https://github.com/uport-project/veramo/issues/1030)) ([fbf7d48](https://github.com/uport-project/veramo/commit/fbf7d483c3549ec45df84472824395903128d66e)), closes [#1003](https://github.com/uport-project/veramo/issues/1003)





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/utils





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)


### Bug Fixes

* **deps:** Update dependency ethr-did-resolver to v7 ([#1038](https://github.com/uport-project/veramo/issues/1038)) ([d421c0f](https://github.com/uport-project/veramo/commit/d421c0f9f5934829df2930e58e98bcfce813ce84))
* remove deprecated testnets ([#1028](https://github.com/uport-project/veramo/issues/1028)) ([2823738](https://github.com/uport-project/veramo/commit/28237383d0cc2eb20bcf8e10562221ea2ab32f94)), closes [#1025](https://github.com/uport-project/veramo/issues/1025)





## [4.0.2](https://github.com/uport-project/veramo/compare/v4.0.1...v4.0.2) (2022-10-04)


### Bug Fixes

* **credential-eip712:** add support for all did methods that use secp256k ([#1011](https://github.com/uport-project/veramo/issues/1011)) ([9940068](https://github.com/uport-project/veramo/commit/99400689dec9ea00131cf914d1999357b716612c)), closes [#991](https://github.com/uport-project/veramo/issues/991)
* **deps:** update dependency uuid to v9 ([4ff90a5](https://github.com/uport-project/veramo/commit/4ff90a58f5993880635f2b39c73edadaf3149066))





# [4.0.0](https://github.com/uport-project/veramo/compare/v3.1.5...v4.0.0) (2022-09-22)


### Bug Fixes

* **credential-ld:** include credential context and fix context loader Map ([ef7797d](https://github.com/uport-project/veramo/commit/ef7797d4c5f20b22e4e39a5ad60a851fa1c4f2ed))
* **credential-status:** check credential status for all credential types ([#949](https://github.com/uport-project/veramo/issues/949)) ([877c513](https://github.com/uport-project/veramo/commit/877c513a5bc253ed30c74ace00ce988197d12a2d)), closes [#934](https://github.com/uport-project/veramo/issues/934)
* **deps:** Bump `did-jwt`, `did-jwt-vc` as direct package deps ([#955](https://github.com/uport-project/veramo/issues/955)) ([e57edb3](https://github.com/uport-project/veramo/commit/e57edb34cfbaee6bba1d944497d688104f32c698))
* **deps:** Update dependency did-jwt-vc to v3 ([014c1ab](https://github.com/uport-project/veramo/commit/014c1ab974647d44d7ef1de0f931625348c4c98b))
* **deps:** update did-libraries ([219cde2](https://github.com/uport-project/veramo/commit/219cde250e8d4f06d7978afcc38a04471342fd21))
* **deps:** use did-jwt v6 and ethr-did-resolver v6 ([#925](https://github.com/uport-project/veramo/issues/925)) ([0c77d03](https://github.com/uport-project/veramo/commit/0c77d03ec5ec9e2091de3f74f67ab86a22cde197)), closes [#923](https://github.com/uport-project/veramo/issues/923) [#848](https://github.com/uport-project/veramo/issues/848)
* **did-resolver:** use interface `Resolvable` instead of the `Resolver` class ([9c2e59f](https://github.com/uport-project/veramo/commit/9c2e59f3f23f808511c6c0e8e440b4d53ba5cb00))
* **docs:** fix relevant errors and warnings in TSDoc to enable proper docs generation on `[@next](https://github.com/next)` branch ([79c3872](https://github.com/uport-project/veramo/commit/79c387230219c92c1951d19b8ddf716308a46c5b))
* **kms-web3:** use ethers _signTypedData ([#939](https://github.com/uport-project/veramo/issues/939)) ([f198997](https://github.com/uport-project/veramo/commit/f198997d08f65b758bd9471bd4cf170ac8620e82)), closes [#938](https://github.com/uport-project/veramo/issues/938)
* update and fix inline documentation of all exported types ([#921](https://github.com/uport-project/veramo/issues/921)) ([63e64e0](https://github.com/uport-project/veramo/commit/63e64e0e2693808c4704dca8cc511dc0bab3f3b1))


### Features

* add support for serviceEndpoint property as defined in latest DID Spec ([#988](https://github.com/uport-project/veramo/issues/988)) ([9bed70b](https://github.com/uport-project/veramo/commit/9bed70ba658aed34a97944e0dee27bca6c81d700))
* **credential-ld:** add support for browser environments ([#916](https://github.com/uport-project/veramo/issues/916)) ([435e4d2](https://github.com/uport-project/veramo/commit/435e4d260b1774f96b182c1a75ab2f1c993f2291))
* **credential-w3c:** align verification API between formats ([#996](https://github.com/uport-project/veramo/issues/996)) ([b987fc0](https://github.com/uport-project/veramo/commit/b987fc0903a31d3bbffb43fef872be4d6c62c2ad)), closes [#935](https://github.com/uport-project/veramo/issues/935) [#954](https://github.com/uport-project/veramo/issues/954) [#375](https://github.com/uport-project/veramo/issues/375) [#989](https://github.com/uport-project/veramo/issues/989)
* **kms-web3:** add a KMS implementation backed by a web3 provider ([#924](https://github.com/uport-project/veramo/issues/924)) ([14f71af](https://github.com/uport-project/veramo/commit/14f71afbb72dca8274790d3b20b518ddfe4f2585)), closes [#688](https://github.com/uport-project/veramo/issues/688)
* **utils:** add 2 utility functions for inspecting ethr dids ([#842](https://github.com/uport-project/veramo/issues/842)) ([473e7fa](https://github.com/uport-project/veramo/commit/473e7fa08e33b3fb643bcc11cd1e3f6094099d7d))


### BREAKING CHANGES

* the `did-resolver` and connected libraries change the data-type for `ServiceEndpoint` to `Service` and the previous semantic has changed. Services can have multiple endpoints, not just a single string.
