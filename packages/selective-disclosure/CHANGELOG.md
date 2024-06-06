# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.0.0](https://github.com/decentralized-identity/veramo/compare/v5.6.0...v6.0.0) (2024-04-02)


### Bug Fixes

* export const plugin schemas instead of defaults ([#1327](https://github.com/decentralized-identity/veramo/issues/1327)) ([7896cea](https://github.com/decentralized-identity/veramo/commit/7896ceaf2c79993eee44e46950814bea74bfe647)), closes [#1318](https://github.com/decentralized-identity/veramo/issues/1318) [#1317](https://github.com/decentralized-identity/veramo/issues/1317) [#1315](https://github.com/decentralized-identity/veramo/issues/1315)
* **selective-disclosure:** deprecate the uPort SelectiveDisclosure plugin ([#1307](https://github.com/decentralized-identity/veramo/issues/1307)) ([71e313f](https://github.com/decentralized-identity/veramo/commit/71e313f894baaad08bf322f56b36d92d7c667ba9))


### Code Refactoring

* generate plugin schemas as TS instead of JSON ([#1315](https://github.com/decentralized-identity/veramo/issues/1315)) ([65c2d4b](https://github.com/decentralized-identity/veramo/commit/65c2d4bc814daa9a3a89f4f7b8e8c6973b8ce2f0)), closes [#1254](https://github.com/decentralized-identity/veramo/issues/1254)


### Features

* add Multikey support ([#1316](https://github.com/decentralized-identity/veramo/issues/1316)) ([165de35](https://github.com/decentralized-identity/veramo/commit/165de3549ccfd3d7c84514608ac3ea9e56a7b807))


### BREAKING CHANGES

* The `plugin.schema.json` files are now generated as `plugin.schema.ts`.





# [5.6.0](https://github.com/decentralized-identity/veramo/compare/v5.5.3...v5.6.0) (2024-01-16)


### Features

* **remote-client:** allow dynamic headers param for AgentRestClient constructor ([#1314](https://github.com/decentralized-identity/veramo/issues/1314)) ([1b8a0a2](https://github.com/decentralized-identity/veramo/commit/1b8a0a2718dd63492ad3a312a6ebe5f6e7849935)), closes [#1313](https://github.com/decentralized-identity/veramo/issues/1313)





## [5.5.3](https://github.com/decentralized-identity/veramo/compare/v5.5.2...v5.5.3) (2023-10-09)


### Bug Fixes

* use DIF URLs in packages ([#1271](https://github.com/decentralized-identity/veramo/issues/1271)) ([3dfc601](https://github.com/decentralized-identity/veramo/commit/3dfc6014cdee7902c59d8db76b4c8507b870f227))





# [5.5.0](https://github.com/uport-project/veramo/compare/v5.4.1...v5.5.0) (2023-09-19)


### Bug Fixes

* **did-provider-key:** use compressed keys for creating Secp256k1 did:key ([#1217](https://github.com/uport-project/veramo/issues/1217)) ([ba8f6f5](https://github.com/uport-project/veramo/commit/ba8f6f5b9b701e57af86491504ecd209ca0c1c1d)), closes [#1213](https://github.com/uport-project/veramo/issues/1213)


### Features

* **core-types:** export a basic mapping between key types and algorithms ([57b6c58](https://github.com/uport-project/veramo/commit/57b6c583138b0f8f283f4f00b27573529f394a7a))
* **selective-disclosure:** support multiple key types for generating requests ([3406a04](https://github.com/uport-project/veramo/commit/3406a04d0ee3c2b637abd774d3cd3fda78fd413d)), closes [#946](https://github.com/uport-project/veramo/issues/946)





## [5.4.1](https://github.com/uport-project/veramo/compare/v5.4.0...v5.4.1) (2023-08-04)


### Bug Fixes

* **ci:** benign change meant to tag all packages for another patch release ([#1211](https://github.com/uport-project/veramo/issues/1211)) ([41b5c90](https://github.com/uport-project/veramo/commit/41b5c90277171b7b38c5cf49ca01db5cf75b6300))





# [5.4.0](https://github.com/uport-project/veramo/compare/v5.3.0...v5.4.0) (2023-08-01)


### Features

* **credential-w3c:** allow issuers with query parameters for credentials and presentations ([#1207](https://github.com/uport-project/veramo/issues/1207)) ([688f59d](https://github.com/uport-project/veramo/commit/688f59d6b492bc25bc51bbe73be969d6c30a958d)), closes [#1201](https://github.com/uport-project/veramo/issues/1201)
* **did-comm:** add support for the AES based content and key encryption algorithms ([#1180](https://github.com/uport-project/veramo/issues/1180)) ([5294a81](https://github.com/uport-project/veramo/commit/5294a812ee578c0712b54f216416c3ef78c848da))





# [5.3.0](https://github.com/uport-project/veramo/compare/v5.2.0...v5.3.0) (2023-07-27)

**Note:** Version bump only for package @veramo/selective-disclosure





# [5.2.0](https://github.com/uport-project/veramo/compare/v5.1.4...v5.2.0) (2023-05-02)

**Note:** Version bump only for package @veramo/selective-disclosure





## [5.1.2](https://github.com/uport-project/veramo/compare/v5.1.1...v5.1.2) (2023-02-25)

**Note:** Version bump only for package @veramo/selective-disclosure





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

**Note:** Version bump only for package @veramo/selective-disclosure





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **deps:** bump dependencies ([701b8ed](https://github.com/uport-project/veramo/commit/701b8edf981ea11c7ddb6a81d2817dbbdbb022f3))





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/selective-disclosure





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)


### Bug Fixes

* **deps:** Update dependency ethr-did-resolver to v7 ([#1038](https://github.com/uport-project/veramo/issues/1038)) ([d421c0f](https://github.com/uport-project/veramo/commit/d421c0f9f5934829df2930e58e98bcfce813ce84))





## [4.0.2](https://github.com/uport-project/veramo/compare/v4.0.1...v4.0.2) (2022-10-04)


### Bug Fixes

* **data-store:** use looser typeorm version range to fix [#1013](https://github.com/uport-project/veramo/issues/1013) ([#1016](https://github.com/uport-project/veramo/issues/1016)) ([83807f3](https://github.com/uport-project/veramo/commit/83807f31f845c8a0116f0300c51735ec406d9dd4))
* **deps:** update dependency uuid to v9 ([4ff90a5](https://github.com/uport-project/veramo/commit/4ff90a58f5993880635f2b39c73edadaf3149066))





## [4.0.1](https://github.com/uport-project/veramo/compare/v4.0.0...v4.0.1) (2022-09-23)

**Note:** Version bump only for package @veramo/selective-disclosure





# [4.0.0](https://github.com/uport-project/veramo/compare/v3.1.5...v4.0.0) (2022-09-22)


### Bug Fixes

* **deps:** Bump `did-jwt`, `did-jwt-vc` as direct package deps ([#955](https://github.com/uport-project/veramo/issues/955)) ([e57edb3](https://github.com/uport-project/veramo/commit/e57edb34cfbaee6bba1d944497d688104f32c698))
* **deps:** update dependency did-jwt to v5.12.0 ([5b414d7](https://github.com/uport-project/veramo/commit/5b414d7d720e7c59cf3f56c35da5fe247e21bf26))
* **deps:** use did-jwt v6 and ethr-did-resolver v6 ([#925](https://github.com/uport-project/veramo/issues/925)) ([0c77d03](https://github.com/uport-project/veramo/commit/0c77d03ec5ec9e2091de3f74f67ab86a22cde197)), closes [#923](https://github.com/uport-project/veramo/issues/923) [#848](https://github.com/uport-project/veramo/issues/848)
* **did-resolver:** use interface `Resolvable` instead of the `Resolver` class ([9c2e59f](https://github.com/uport-project/veramo/commit/9c2e59f3f23f808511c6c0e8e440b4d53ba5cb00))
* **docs:** fix relevant errors and warnings in TSDoc to enable proper docs generation on `[@next](https://github.com/next)` branch ([79c3872](https://github.com/uport-project/veramo/commit/79c387230219c92c1951d19b8ddf716308a46c5b))
* update and fix inline documentation of all exported types ([#921](https://github.com/uport-project/veramo/issues/921)) ([63e64e0](https://github.com/uport-project/veramo/commit/63e64e0e2693808c4704dca8cc511dc0bab3f3b1))


### Features

* add support for serviceEndpoint property as defined in latest DID Spec ([#988](https://github.com/uport-project/veramo/issues/988)) ([9bed70b](https://github.com/uport-project/veramo/commit/9bed70ba658aed34a97944e0dee27bca6c81d700))
* **credential-status:** expect revoked boolean property from StatusMethods ([e00daa4](https://github.com/uport-project/veramo/commit/e00daa47865ea42d7bd8667f37c6e12fc21fd4b9))
* **credential-w3c:** add ICredentialPlugin interface in core package ([#1001](https://github.com/uport-project/veramo/issues/1001)) ([7b6d195](https://github.com/uport-project/veramo/commit/7b6d1950364c8b741dd958d29e506b95fa5b1cec)), closes [#941](https://github.com/uport-project/veramo/issues/941)
* **credential-w3c:** align verification API between formats ([#996](https://github.com/uport-project/veramo/issues/996)) ([b987fc0](https://github.com/uport-project/veramo/commit/b987fc0903a31d3bbffb43fef872be4d6c62c2ad)), closes [#935](https://github.com/uport-project/veramo/issues/935) [#954](https://github.com/uport-project/veramo/issues/954) [#375](https://github.com/uport-project/veramo/issues/375) [#989](https://github.com/uport-project/veramo/issues/989)
* **date-store-json:** add JSON object storage implementation ([#819](https://github.com/uport-project/veramo/issues/819)) ([934b34a](https://github.com/uport-project/veramo/commit/934b34a18b194928f90e7797289cc6f2243789ec))


### BREAKING CHANGES

* the `did-resolver` and connected libraries change the data-type for `ServiceEndpoint` to `Service` and the previous semantic has changed. Services can have multiple endpoints, not just a single string.





## [3.1.4](https://github.com/uport-project/veramo/compare/v3.1.3...v3.1.4) (2022-06-02)

**Note:** Version bump only for package @veramo/selective-disclosure





## [3.1.3](https://github.com/uport-project/veramo/compare/v3.1.2...v3.1.3) (2022-06-01)

**Note:** Version bump only for package @veramo/selective-disclosure





# [3.1.0](https://github.com/uport-project/veramo/compare/v3.0.0...v3.1.0) (2021-11-12)


### Bug Fixes

* **data-store:** add support for entityPrefix ([#725](https://github.com/uport-project/veramo/issues/725)) ([801bb95](https://github.com/uport-project/veramo/commit/801bb95ddd22abaa61c938b025834132d4e8d3be)), closes [#724](https://github.com/uport-project/veramo/issues/724)
* **deps:** update dependency did-jwt to v5.10.0 ([8424291](https://github.com/uport-project/veramo/commit/842429176b7e3a2433dcb0341cdadb5e5fcd71f0))
* **deps:** update dependency did-jwt to v5.9.0 ([b9af0af](https://github.com/uport-project/veramo/commit/b9af0af9034297316313ac8f5d41f08e06c5a1ab))
* **deps:** update did-libraries ([417dc5d](https://github.com/uport-project/veramo/commit/417dc5dd157ee259b6f89f4987f1ecca444fb1d4))


### Features

* **did-comm:** didcomm messaging using did:ethr ([#744](https://github.com/uport-project/veramo/issues/744)) ([1be5e04](https://github.com/uport-project/veramo/commit/1be5e04e09112c0823d776fe2d55117d71a7b448)), closes [#743](https://github.com/uport-project/veramo/issues/743)





# [3.0.0](https://github.com/uport-project/veramo/compare/v2.1.3...v3.0.0) (2021-09-20)


### Bug Fixes

* **deps:** update all non-major dependencies ([8fc5312](https://github.com/uport-project/veramo/commit/8fc53120498ce2982e8ec640e00bbb03f6f4204e))





# [2.1.0](https://github.com/uport-project/veramo/compare/v2.0.1...v2.1.0) (2021-08-11)


### Bug Fixes

* **credentials-w3c:** accept Presentations without Credentials ([#616](https://github.com/uport-project/veramo/issues/616)) ([2389cd0](https://github.com/uport-project/veramo/commit/2389cd0df080e968ee320d66fabf2e8a7b51ba47))





# [2.0.0](https://github.com/uport-project/veramo/compare/v1.2.2...v2.0.0) (2021-07-14)


### Bug Fixes

* **deps:** bump did-jwt to 5.4.0 ([#528](https://github.com/uport-project/veramo/issues/528)) ([65f22cf](https://github.com/uport-project/veramo/commit/65f22cf6dcca48b5bb35331894536a2a567a1189))
* **deps:** update all non-major dependencies ([9f40f7d](https://github.com/uport-project/veramo/commit/9f40f7d8b2a67e112b7ef2322ba887ee9033646c))
* **deps:** update dependency did-jwt to v5.5.2 ([ae0661f](https://github.com/uport-project/veramo/commit/ae0661fc5b225f80ebb102db60d55822b4786bce))
* use optional chaining in SDR message handler ([#561](https://github.com/uport-project/veramo/issues/561)) ([ab24877](https://github.com/uport-project/veramo/commit/ab24877f941c37f1042fdc23683b1292b7f5bdc7)), closes [#560](https://github.com/uport-project/veramo/issues/560)


### Features

* **key-manager:** add generic signing capabilities ([#529](https://github.com/uport-project/veramo/issues/529)) ([5f10a1b](https://github.com/uport-project/veramo/commit/5f10a1bcea214cb593de12fa6ec3a91b3cb712bb)), closes [#522](https://github.com/uport-project/veramo/issues/522)
* **sdr:** return UniqueVerifiableCredential for selective-disclosure ([#593](https://github.com/uport-project/veramo/issues/593)) ([9c6c090](https://github.com/uport-project/veramo/commit/9c6c0906607bc8f415042d3a855a2dd23a097725)), closes [#496](https://github.com/uport-project/veramo/issues/496)


### BREAKING CHANGES

* **sdr:** `getVerifiableCredentialsForSdr` and `validatePresentationAgainstSdr` now returns { hash: string, verifiableCredential: VerifiableCredential} instead of `VerifiableCredential`





# [1.2.0](https://github.com/uport-project/veramo/compare/v1.1.2...v1.2.0) (2021-04-27)


### Features

* adapt to did core spec ([#430](https://github.com/uport-project/veramo/issues/430)) ([9712db0](https://github.com/uport-project/veramo/commit/9712db0eea1a3f48cf0665d66ae715ea0c23cd4a)), closes [#418](https://github.com/uport-project/veramo/issues/418) [#428](https://github.com/uport-project/veramo/issues/428) [#417](https://github.com/uport-project/veramo/issues/417) [#416](https://github.com/uport-project/veramo/issues/416) [#412](https://github.com/uport-project/veramo/issues/412) [#397](https://github.com/uport-project/veramo/issues/397) [#384](https://github.com/uport-project/veramo/issues/384) [#394](https://github.com/uport-project/veramo/issues/394)





## [1.1.2](https://github.com/uport-project/veramo/compare/v1.1.1...v1.1.2) (2021-04-26)

**Note:** Version bump only for package @veramo/selective-disclosure





# [1.1.0](https://github.com/uport-project/veramo/compare/v1.0.1...v1.1.0) (2021-01-26)

**Note:** Version bump only for package @veramo/selective-disclosure





## 1.0.1 (2020-12-18)

**Note:** Version bump only for package @veramo/selective-disclosure
