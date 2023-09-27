# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.5.1](https://github.com/uport-project/veramo/compare/v5.5.0...v5.5.1) (2023-09-21)

**Note:** Version bump only for package @veramo/test-react-app





# [5.5.0](https://github.com/uport-project/veramo/compare/v5.4.1...v5.5.0) (2023-09-19)


### Bug Fixes

* **data-store:** order skip take in orm and json ([#1243](https://github.com/uport-project/veramo/issues/1243)) ([28c1224](https://github.com/uport-project/veramo/commit/28c12247c4e4b5c94e5e92b481e3ccc71b2c4ec6))
* **did-provider-key:** use compressed keys for creating Secp256k1 did:key ([#1217](https://github.com/uport-project/veramo/issues/1217)) ([ba8f6f5](https://github.com/uport-project/veramo/commit/ba8f6f5b9b701e57af86491504ecd209ca0c1c1d)), closes [#1213](https://github.com/uport-project/veramo/issues/1213)





## [5.4.1](https://github.com/uport-project/veramo/compare/v5.4.0...v5.4.1) (2023-08-04)

**Note:** Version bump only for package @veramo/test-react-app





# [5.4.0](https://github.com/uport-project/veramo/compare/v5.3.0...v5.4.0) (2023-08-01)


### Features

* **did-comm:** add support for the AES based content and key encryption algorithms ([#1180](https://github.com/uport-project/veramo/issues/1180)) ([5294a81](https://github.com/uport-project/veramo/commit/5294a812ee578c0712b54f216416c3ef78c848da))





# [5.3.0](https://github.com/uport-project/veramo/compare/v5.2.0...v5.3.0) (2023-07-27)

**Note:** Version bump only for package @veramo/test-react-app





# [5.2.0](https://github.com/uport-project/veramo/compare/v5.1.4...v5.2.0) (2023-05-02)

**Note:** Version bump only for package @veramo/test-react-app





## [5.1.4](https://github.com/uport-project/veramo/compare/v5.1.3...v5.1.4) (2023-03-16)

**Note:** Version bump only for package @veramo/test-react-app





## [5.1.3](https://github.com/uport-project/veramo/compare/v5.1.2...v5.1.3) (2023-03-16)


### Bug Fixes

* **cli:** load server config asynchronously ([#1145](https://github.com/uport-project/veramo/issues/1145)) ([2a0aef1](https://github.com/uport-project/veramo/commit/2a0aef1e1911ffba85c043a878f60d7bc672e86a)), closes [#1144](https://github.com/uport-project/veramo/issues/1144)





## [5.1.2](https://github.com/uport-project/veramo/compare/v5.1.1...v5.1.2) (2023-02-25)

**Note:** Version bump only for package @veramo/test-react-app





## [5.1.1](https://github.com/uport-project/veramo/compare/v5.1.0...v5.1.1) (2023-02-25)

**Note:** Version bump only for package @veramo/test-react-app





# [5.1.0](https://github.com/uport-project/veramo/compare/v5.0.0...v5.1.0) (2023-02-24)


### Bug Fixes

* P256 key parity corrections ([#1137](https://github.com/uport-project/veramo/issues/1137)) ([d0eca2b](https://github.com/uport-project/veramo/commit/d0eca2b3cd9ca6741f7f056e28bb9799910bc5ec)), closes [#1136](https://github.com/uport-project/veramo/issues/1136) [#1135](https://github.com/uport-project/veramo/issues/1135)


### Features

* **did-provider-jwk:** add did:jwk method support ([#1128](https://github.com/uport-project/veramo/issues/1128)) ([0a22d9c](https://github.com/uport-project/veramo/commit/0a22d9c2426c69c95263b2f0b36617794b59be62))





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

**Note:** Version bump only for package @veramo/test-react-app





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **credential-ld:** simplify signature suite use of Uint8Array ([49a10ec](https://github.com/uport-project/veramo/commit/49a10ecc29d56118ac09c5df73fed885fe6988c1))
* **deps:** bump dependencies ([701b8ed](https://github.com/uport-project/veramo/commit/701b8edf981ea11c7ddb6a81d2817dbbdbb022f3))
* **deps:** Update dependency ethr-did-resolver to v8 ([f475dbc](https://github.com/uport-project/veramo/commit/f475dbc1c2dbb4b7f6b3396c3e6947eac2931736))


### Features

* **credential-ld:** add `Ed25519Signature2020` & `JsonWebSignature2020` experimental support ([#1030](https://github.com/uport-project/veramo/issues/1030)) ([fbf7d48](https://github.com/uport-project/veramo/commit/fbf7d483c3549ec45df84472824395903128d66e)), closes [#1003](https://github.com/uport-project/veramo/issues/1003)
* **did-provider-pkh:** implement did:pkh support. ([#1052](https://github.com/uport-project/veramo/issues/1052)) ([5ad0bfb](https://github.com/uport-project/veramo/commit/5ad0bfb713dca8fd24b99ddf053335340a39e7b3)), closes [#1024](https://github.com/uport-project/veramo/issues/1024)





## [4.1.2](https://github.com/uport-project/veramo/compare/v4.1.1...v4.1.2) (2022-11-03)

**Note:** Version bump only for package @veramo/test-react-app





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/test-react-app





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)


### Bug Fixes

* **deps:** Update dependency ethr-did-resolver to v7 ([#1038](https://github.com/uport-project/veramo/issues/1038)) ([d421c0f](https://github.com/uport-project/veramo/commit/d421c0f9f5934829df2930e58e98bcfce813ce84))
* remove deprecated testnets ([#1028](https://github.com/uport-project/veramo/issues/1028)) ([2823738](https://github.com/uport-project/veramo/commit/28237383d0cc2eb20bcf8e10562221ea2ab32f94)), closes [#1025](https://github.com/uport-project/veramo/issues/1025)





## [4.0.2](https://github.com/uport-project/veramo/compare/v4.0.1...v4.0.2) (2022-10-04)


### Bug Fixes

* **data-store:** use looser typeorm version range to fix [#1013](https://github.com/uport-project/veramo/issues/1013) ([#1016](https://github.com/uport-project/veramo/issues/1016)) ([83807f3](https://github.com/uport-project/veramo/commit/83807f31f845c8a0116f0300c51735ec406d9dd4))





## [4.0.1](https://github.com/uport-project/veramo/compare/v4.0.0...v4.0.1) (2022-09-23)

**Note:** Version bump only for package @veramo/test-react-app





# [4.0.0](https://github.com/uport-project/veramo/compare/v3.1.5...v4.0.0) (2022-09-22)


### Bug Fixes

* **deps:** update did-libraries ([219cde2](https://github.com/uport-project/veramo/commit/219cde250e8d4f06d7978afcc38a04471342fd21))
* **deps:** use did-jwt v6 and ethr-did-resolver v6 ([#925](https://github.com/uport-project/veramo/issues/925)) ([0c77d03](https://github.com/uport-project/veramo/commit/0c77d03ec5ec9e2091de3f74f67ab86a22cde197)), closes [#923](https://github.com/uport-project/veramo/issues/923) [#848](https://github.com/uport-project/veramo/issues/848)
* update and fix inline documentation of all exported types ([#921](https://github.com/uport-project/veramo/issues/921)) ([63e64e0](https://github.com/uport-project/veramo/commit/63e64e0e2693808c4704dca8cc511dc0bab3f3b1))


### Features

* add support for serviceEndpoint property as defined in latest DID Spec ([#988](https://github.com/uport-project/veramo/issues/988)) ([9bed70b](https://github.com/uport-project/veramo/commit/9bed70ba658aed34a97944e0dee27bca6c81d700))
* **credential-ld:** add support for browser environments ([#916](https://github.com/uport-project/veramo/issues/916)) ([435e4d2](https://github.com/uport-project/veramo/commit/435e4d260b1774f96b182c1a75ab2f1c993f2291))
* **credential-w3c:** add ICredentialPlugin interface in core package ([#1001](https://github.com/uport-project/veramo/issues/1001)) ([7b6d195](https://github.com/uport-project/veramo/commit/7b6d1950364c8b741dd958d29e506b95fa5b1cec)), closes [#941](https://github.com/uport-project/veramo/issues/941)
* **did-provider-ethr:** use multiple networks per EthrDIDProvider ([#969](https://github.com/uport-project/veramo/issues/969)) ([0a88058](https://github.com/uport-project/veramo/commit/0a88058a5efddfe09f9f35510cc1bbc21149bf18)), closes [#968](https://github.com/uport-project/veramo/issues/968) [#893](https://github.com/uport-project/veramo/issues/893)
* **kms-web3:** add a KMS implementation backed by a web3 provider ([#924](https://github.com/uport-project/veramo/issues/924)) ([14f71af](https://github.com/uport-project/veramo/commit/14f71afbb72dca8274790d3b20b518ddfe4f2585)), closes [#688](https://github.com/uport-project/veramo/issues/688)


### BREAKING CHANGES

* the `did-resolver` and connected libraries change the data-type for `ServiceEndpoint` to `Service` and the previous semantic has changed. Services can have multiple endpoints, not just a single string.
