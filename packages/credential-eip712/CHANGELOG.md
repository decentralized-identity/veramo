# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.1](https://github.com/decentralized-identity/veramo/compare/v6.0.0...v6.0.1) (2026-01-16)

**Note:** Version bump only for package @veramo/credential-eip712





# [6.0.0](https://github.com/decentralized-identity/veramo/compare/v5.6.0...v6.0.0) (2024-04-02)


### Bug Fixes

* **credential-w3c:** forward DID resolution options to the resolver ([#1344](https://github.com/decentralized-identity/veramo/issues/1344)) ([0c22cc6](https://github.com/decentralized-identity/veramo/commit/0c22cc6a79e974214500e4440b0ea2977012377d)), closes [#1343](https://github.com/decentralized-identity/veramo/issues/1343)
* **did-provider-key:** align did:key resolver to spec ([#1332](https://github.com/decentralized-identity/veramo/issues/1332)) ([8e3b94c](https://github.com/decentralized-identity/veramo/commit/8e3b94cf997619d7adcb5cb8827e0f55ff88cdb5)), closes [#1330](https://github.com/decentralized-identity/veramo/issues/1330)
* export const plugin schemas instead of defaults ([#1327](https://github.com/decentralized-identity/veramo/issues/1327)) ([7896cea](https://github.com/decentralized-identity/veramo/commit/7896ceaf2c79993eee44e46950814bea74bfe647)), closes [#1318](https://github.com/decentralized-identity/veramo/issues/1318) [#1317](https://github.com/decentralized-identity/veramo/issues/1317) [#1315](https://github.com/decentralized-identity/veramo/issues/1315)
* **utils:** get chainId for any did method ([#1334](https://github.com/decentralized-identity/veramo/issues/1334)) ([d5375bd](https://github.com/decentralized-identity/veramo/commit/d5375bd03e814a2d3fcd96274607f880db77fbe3))


### Code Refactoring

* generate plugin schemas as TS instead of JSON ([#1315](https://github.com/decentralized-identity/veramo/issues/1315)) ([65c2d4b](https://github.com/decentralized-identity/veramo/commit/65c2d4bc814daa9a3a89f4f7b8e8c6973b8ce2f0)), closes [#1254](https://github.com/decentralized-identity/veramo/issues/1254)


### BREAKING CHANGES

* **utils:** The `getChainIdForDidEthr` method has been renamed to `getChainId`
* The `plugin.schema.json` files are now generated as `plugin.schema.ts`.





# [5.6.0](https://github.com/decentralized-identity/veramo/compare/v5.5.3...v5.6.0) (2024-01-16)


### Features

* **remote-client:** allow dynamic headers param for AgentRestClient constructor ([#1314](https://github.com/decentralized-identity/veramo/issues/1314)) ([1b8a0a2](https://github.com/decentralized-identity/veramo/commit/1b8a0a2718dd63492ad3a312a6ebe5f6e7849935)), closes [#1313](https://github.com/decentralized-identity/veramo/issues/1313)





## [5.5.3](https://github.com/decentralized-identity/veramo/compare/v5.5.2...v5.5.3) (2023-10-09)


### Bug Fixes

* use DIF URLs in packages ([#1271](https://github.com/decentralized-identity/veramo/issues/1271)) ([3dfc601](https://github.com/decentralized-identity/veramo/commit/3dfc6014cdee7902c59d8db76b4c8507b870f227))





# [5.5.0](https://github.com/uport-project/veramo/compare/v5.4.1...v5.5.0) (2023-09-19)


### Bug Fixes

* **deps:** update dependency @metamask/eth-sig-util to v6 ([c60252c](https://github.com/uport-project/veramo/commit/c60252ce76318fc201580bc39db8775b71ee6d13))
* **did-provider-key:** use compressed keys for creating Secp256k1 did:key ([#1217](https://github.com/uport-project/veramo/issues/1217)) ([ba8f6f5](https://github.com/uport-project/veramo/commit/ba8f6f5b9b701e57af86491504ecd209ca0c1c1d)), closes [#1213](https://github.com/uport-project/veramo/issues/1213)





## [5.4.1](https://github.com/uport-project/veramo/compare/v5.4.0...v5.4.1) (2023-08-04)


### Bug Fixes

* **ci:** benign change meant to tag all packages for another patch release ([#1211](https://github.com/uport-project/veramo/issues/1211)) ([41b5c90](https://github.com/uport-project/veramo/commit/41b5c90277171b7b38c5cf49ca01db5cf75b6300))





# [5.4.0](https://github.com/uport-project/veramo/compare/v5.3.0...v5.4.0) (2023-08-01)


### Features

* **credential-w3c:** allow issuers with query parameters for credentials and presentations ([#1207](https://github.com/uport-project/veramo/issues/1207)) ([688f59d](https://github.com/uport-project/veramo/commit/688f59d6b492bc25bc51bbe73be969d6c30a958d)), closes [#1201](https://github.com/uport-project/veramo/issues/1201)





# [5.3.0](https://github.com/uport-project/veramo/compare/v5.2.0...v5.3.0) (2023-07-27)


### Bug Fixes

* **credential-eip712:** remove JSON.stringify for string credential ([#1176](https://github.com/uport-project/veramo/issues/1176)) ([469dcd9](https://github.com/uport-project/veramo/commit/469dcd9ba008dc73934335f55e9da80152c40371))





# [5.2.0](https://github.com/uport-project/veramo/compare/v5.1.4...v5.2.0) (2023-05-02)

**Note:** Version bump only for package @veramo/credential-eip712





## [5.1.2](https://github.com/uport-project/veramo/compare/v5.1.1...v5.1.2) (2023-02-25)

**Note:** Version bump only for package @veramo/credential-eip712





# [5.1.0](https://github.com/uport-project/veramo/compare/v5.0.0...v5.1.0) (2023-02-24)


### Bug Fixes

* **credential-eip712:** compatibility improvements for EthereumEIP712Signature2021 ([#1131](https://github.com/uport-project/veramo/issues/1131)) ([672f92b](https://github.com/uport-project/veramo/commit/672f92b1bd3850c369cbef646c8ece8a58fafc16))


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

**Note:** Version bump only for package @veramo/credential-eip712





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **deps:** bump dependencies ([701b8ed](https://github.com/uport-project/veramo/commit/701b8edf981ea11c7ddb6a81d2817dbbdbb022f3))





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/credential-eip712





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)

**Note:** Version bump only for package @veramo/credential-eip712





## [4.0.2](https://github.com/uport-project/veramo/compare/v4.0.1...v4.0.2) (2022-10-04)


### Bug Fixes

* **credential-eip712:** add support for all did methods that use secp256k ([#1011](https://github.com/uport-project/veramo/issues/1011)) ([9940068](https://github.com/uport-project/veramo/commit/99400689dec9ea00131cf914d1999357b716612c)), closes [#991](https://github.com/uport-project/veramo/issues/991)
* **deps:** update dependency @metamask/eth-sig-util to v5 ([bf3a406](https://github.com/uport-project/veramo/commit/bf3a406a19f1ab6d57819c1ff3df2b2f3b2f4d03))





# [4.0.0](https://github.com/uport-project/veramo/compare/v3.1.5...v4.0.0) (2022-09-22)


### Bug Fixes

* **credential-eip712:** update plugin schema ([#915](https://github.com/uport-project/veramo/issues/915)) ([3a0765e](https://github.com/uport-project/veramo/commit/3a0765ef632aae29701004cbfbeb38a2de7bc847))
* **credential-status:** check credential status for all credential types ([#949](https://github.com/uport-project/veramo/issues/949)) ([877c513](https://github.com/uport-project/veramo/commit/877c513a5bc253ed30c74ace00ce988197d12a2d)), closes [#934](https://github.com/uport-project/veramo/issues/934)
* update and fix inline documentation of all exported types ([#921](https://github.com/uport-project/veramo/issues/921)) ([63e64e0](https://github.com/uport-project/veramo/commit/63e64e0e2693808c4704dca8cc511dc0bab3f3b1))


### Features

* **credential-ld:** add support for browser environments ([#916](https://github.com/uport-project/veramo/issues/916)) ([435e4d2](https://github.com/uport-project/veramo/commit/435e4d260b1774f96b182c1a75ab2f1c993f2291))
* **credential-status:** expect revoked boolean property from StatusMethods ([e00daa4](https://github.com/uport-project/veramo/commit/e00daa47865ea42d7bd8667f37c6e12fc21fd4b9))
* **credential-w3c:** align verification API between formats ([#996](https://github.com/uport-project/veramo/issues/996)) ([b987fc0](https://github.com/uport-project/veramo/commit/b987fc0903a31d3bbffb43fef872be4d6c62c2ad)), closes [#935](https://github.com/uport-project/veramo/issues/935) [#954](https://github.com/uport-project/veramo/issues/954) [#375](https://github.com/uport-project/veramo/issues/375) [#989](https://github.com/uport-project/veramo/issues/989)
* CredentialIssuerEIP712 ([#899](https://github.com/uport-project/veramo/issues/899)) ([5d62c52](https://github.com/uport-project/veramo/commit/5d62c52e28a504470f8ba2c2cbd3c38eed7f435f))
* **kms-web3:** add a KMS implementation backed by a web3 provider ([#924](https://github.com/uport-project/veramo/issues/924)) ([14f71af](https://github.com/uport-project/veramo/commit/14f71afbb72dca8274790d3b20b518ddfe4f2585)), closes [#688](https://github.com/uport-project/veramo/issues/688)
