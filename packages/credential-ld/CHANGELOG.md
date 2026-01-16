# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.2](https://github.com/decentralized-identity/veramo/compare/v6.0.1...v6.0.2) (2026-01-16)

**Note:** Version bump only for package @veramo/credential-ld





## [6.0.1](https://github.com/decentralized-identity/veramo/compare/v6.0.0...v6.0.1) (2026-01-16)

**Note:** Version bump only for package @veramo/credential-ld





# [6.0.0](https://github.com/decentralized-identity/veramo/compare/v5.6.0...v6.0.0) (2024-04-02)


### Bug Fixes

* **credential-ld:** let verifiers use all supported verification methods ([#1331](https://github.com/decentralized-identity/veramo/issues/1331)) ([aa95af0](https://github.com/decentralized-identity/veramo/commit/aa95af00ce755ae0022b4b17ae8c996e0b970842)), closes [#1329](https://github.com/decentralized-identity/veramo/issues/1329)
* **credential-w3c:** forward DID resolution options to the resolver ([#1344](https://github.com/decentralized-identity/veramo/issues/1344)) ([0c22cc6](https://github.com/decentralized-identity/veramo/commit/0c22cc6a79e974214500e4440b0ea2977012377d)), closes [#1343](https://github.com/decentralized-identity/veramo/issues/1343)
* **deps:** Update did-vc-libraries ([ba966d5](https://github.com/decentralized-identity/veramo/commit/ba966d5fe450145f51e9c9b46f8aa53f74b117d2))
* export const plugin schemas instead of defaults ([#1327](https://github.com/decentralized-identity/veramo/issues/1327)) ([7896cea](https://github.com/decentralized-identity/veramo/commit/7896ceaf2c79993eee44e46950814bea74bfe647)), closes [#1318](https://github.com/decentralized-identity/veramo/issues/1318) [#1317](https://github.com/decentralized-identity/veramo/issues/1317) [#1315](https://github.com/decentralized-identity/veramo/issues/1315)


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

* **deps:** update dependency cross-fetch to v4 ([1c14d34](https://github.com/uport-project/veramo/commit/1c14d34f48a51bef373541e84ed89f2f44711406))
* **did-provider-key:** use compressed keys for creating Secp256k1 did:key ([#1217](https://github.com/uport-project/veramo/issues/1217)) ([ba8f6f5](https://github.com/uport-project/veramo/commit/ba8f6f5b9b701e57af86491504ecd209ca0c1c1d)), closes [#1213](https://github.com/uport-project/veramo/issues/1213)





## [5.4.1](https://github.com/uport-project/veramo/compare/v5.4.0...v5.4.1) (2023-08-04)


### Bug Fixes

* **ci:** benign change meant to tag all packages for another patch release ([#1211](https://github.com/uport-project/veramo/issues/1211)) ([41b5c90](https://github.com/uport-project/veramo/commit/41b5c90277171b7b38c5cf49ca01db5cf75b6300))
* **deps:** Update did-vc-libraries to v6 ([3cadd56](https://github.com/uport-project/veramo/commit/3cadd56356a23463acc04f9a8a58239a9475b1c1))





# [5.4.0](https://github.com/uport-project/veramo/compare/v5.3.0...v5.4.0) (2023-08-01)


### Features

* **credential-w3c:** allow issuers with query parameters for credentials and presentations ([#1207](https://github.com/uport-project/veramo/issues/1207)) ([688f59d](https://github.com/uport-project/veramo/commit/688f59d6b492bc25bc51bbe73be969d6c30a958d)), closes [#1201](https://github.com/uport-project/veramo/issues/1201)
* **did-comm:** add support for the AES based content and key encryption algorithms ([#1180](https://github.com/uport-project/veramo/issues/1180)) ([5294a81](https://github.com/uport-project/veramo/commit/5294a812ee578c0712b54f216416c3ef78c848da))





# [5.3.0](https://github.com/uport-project/veramo/compare/v5.2.0...v5.3.0) (2023-07-27)

**Note:** Version bump only for package @veramo/credential-ld





# [5.2.0](https://github.com/uport-project/veramo/compare/v5.1.4...v5.2.0) (2023-05-02)


### Bug Fixes

* **credential-ld:** external context handling with the `fetchRemoteContexts` option ([#1149](https://github.com/uport-project/veramo/issues/1149)) ([4a63f40](https://github.com/uport-project/veramo/commit/4a63f4009bea31c9111de8b5298b34b70e53fa37))
* **credential-ld:** fix Ed25519Signature2020 verification ([#1166](https://github.com/uport-project/veramo/issues/1166)) ([c965fd5](https://github.com/uport-project/veramo/commit/c965fd502f652c9929ae4753c56ebbe351447733))





## [5.1.2](https://github.com/uport-project/veramo/compare/v5.1.1...v5.1.2) (2023-02-25)

**Note:** Version bump only for package @veramo/credential-ld





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


### Bug Fixes

* **credential-ld:** fix defaultContexts file extensions ([#1086](https://github.com/uport-project/veramo/issues/1086)) ([2f57cb1](https://github.com/uport-project/veramo/commit/2f57cb1bef265a5930ceaeff6a8e9af987c3958e))





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **credential-ld:** simplify signature suite use of Uint8Array ([49a10ec](https://github.com/uport-project/veramo/commit/49a10ecc29d56118ac09c5df73fed885fe6988c1))
* **deps:** bump dependencies ([701b8ed](https://github.com/uport-project/veramo/commit/701b8edf981ea11c7ddb6a81d2817dbbdbb022f3))
* **deps:** Update dependency @digitalcredentials/vc to v5 ([1bdc802](https://github.com/uport-project/veramo/commit/1bdc80240578aff13240dfe45b9a12b0720d1d4d))


### Features

* **credential-ld:** add `Ed25519Signature2020` & `JsonWebSignature2020` experimental support ([#1030](https://github.com/uport-project/veramo/issues/1030)) ([fbf7d48](https://github.com/uport-project/veramo/commit/fbf7d483c3549ec45df84472824395903128d66e)), closes [#1003](https://github.com/uport-project/veramo/issues/1003)
* **did-provider-pkh:** implement did:pkh support. ([#1052](https://github.com/uport-project/veramo/issues/1052)) ([5ad0bfb](https://github.com/uport-project/veramo/commit/5ad0bfb713dca8fd24b99ddf053335340a39e7b3)), closes [#1024](https://github.com/uport-project/veramo/issues/1024)





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/credential-ld





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)


### Bug Fixes

* **deps:** Update dependency ethr-did-resolver to v7 ([#1038](https://github.com/uport-project/veramo/issues/1038)) ([d421c0f](https://github.com/uport-project/veramo/commit/d421c0f9f5934829df2930e58e98bcfce813ce84))





## [4.0.2](https://github.com/uport-project/veramo/compare/v4.0.1...v4.0.2) (2022-10-04)

**Note:** Version bump only for package @veramo/credential-ld





# [4.0.0](https://github.com/uport-project/veramo/compare/v3.1.5...v4.0.0) (2022-09-22)


### Bug Fixes

* **credential-ld:** fix EcdsaSecp256k1RecoverySignature2020 suite context ([#909](https://github.com/uport-project/veramo/issues/909)) ([48fbee3](https://github.com/uport-project/veramo/commit/48fbee3e62eab3df4225ae0bdb3a92f5665eb171))
* **credential-ld:** include credential context and fix context loader Map ([ef7797d](https://github.com/uport-project/veramo/commit/ef7797d4c5f20b22e4e39a5ad60a851fa1c4f2ed))
* **credential-ld:** include LDDefaultContexts in npm bundle ([3e2cf29](https://github.com/uport-project/veramo/commit/3e2cf29ecc7aecf0a3750beec7490306ceb79dab))
* **credential-ld:** remove fs dependency for JSON LD default contexts ([#868](https://github.com/uport-project/veramo/issues/868)) ([2f75935](https://github.com/uport-project/veramo/commit/2f75935f049e4545ba77b0038c74668147e5e6de)), closes [#837](https://github.com/uport-project/veramo/issues/837)
* **credential-status:** check credential status for all credential types ([#949](https://github.com/uport-project/veramo/issues/949)) ([877c513](https://github.com/uport-project/veramo/commit/877c513a5bc253ed30c74ace00ce988197d12a2d)), closes [#934](https://github.com/uport-project/veramo/issues/934)
* **deps:** replace @transmute/lds-ecdsa-secp256k1-recovery2020 with fork ([#953](https://github.com/uport-project/veramo/issues/953)) ([573a0ef](https://github.com/uport-project/veramo/commit/573a0efe8d28653bd0389e401c25a2dd9c361a96)), closes [#952](https://github.com/uport-project/veramo/issues/952)
* **deps:** Update dependency @digitalcredentials/vc to v4 ([9ea90d3](https://github.com/uport-project/veramo/commit/9ea90d38137631d186c042de1fcf855be50f2144))
* **deps:** update did-libraries ([219cde2](https://github.com/uport-project/veramo/commit/219cde250e8d4f06d7978afcc38a04471342fd21))
* **deps:** use did-jwt v6 and ethr-did-resolver v6 ([#925](https://github.com/uport-project/veramo/issues/925)) ([0c77d03](https://github.com/uport-project/veramo/commit/0c77d03ec5ec9e2091de3f74f67ab86a22cde197)), closes [#923](https://github.com/uport-project/veramo/issues/923) [#848](https://github.com/uport-project/veramo/issues/848)
* **did-resolver:** use interface `Resolvable` instead of the `Resolver` class ([9c2e59f](https://github.com/uport-project/veramo/commit/9c2e59f3f23f808511c6c0e8e440b4d53ba5cb00))
* **docs:** fix relevant errors and warnings in TSDoc to enable proper docs generation on `[@next](https://github.com/next)` branch ([79c3872](https://github.com/uport-project/veramo/commit/79c387230219c92c1951d19b8ddf716308a46c5b))
* update and fix inline documentation of all exported types ([#921](https://github.com/uport-project/veramo/issues/921)) ([63e64e0](https://github.com/uport-project/veramo/commit/63e64e0e2693808c4704dca8cc511dc0bab3f3b1))


### Features

* add support for serviceEndpoint property as defined in latest DID Spec ([#988](https://github.com/uport-project/veramo/issues/988)) ([9bed70b](https://github.com/uport-project/veramo/commit/9bed70ba658aed34a97944e0dee27bca6c81d700))
* **credential-ld:** add option to fetch remote contexts ([60226a1](https://github.com/uport-project/veramo/commit/60226a1a64d7f06e3869ff0087f4773376b4160e))
* **credential-ld:** add support for browser environments ([#916](https://github.com/uport-project/veramo/issues/916)) ([435e4d2](https://github.com/uport-project/veramo/commit/435e4d260b1774f96b182c1a75ab2f1c993f2291))
* **credential-status:** add credential status check plugin for Veramo ([#874](https://github.com/uport-project/veramo/issues/874)) ([cf62dfe](https://github.com/uport-project/veramo/commit/cf62dfe21ebc76bc95e98fc55bfe1113e80c138b))
* **credential-status:** expect revoked boolean property from StatusMethods ([e00daa4](https://github.com/uport-project/veramo/commit/e00daa47865ea42d7bd8667f37c6e12fc21fd4b9))
* **credential-w3c:** add ICredentialPlugin interface in core package ([#1001](https://github.com/uport-project/veramo/issues/1001)) ([7b6d195](https://github.com/uport-project/veramo/commit/7b6d1950364c8b741dd958d29e506b95fa5b1cec)), closes [#941](https://github.com/uport-project/veramo/issues/941)
* **credential-w3c:** align verification API between formats ([#996](https://github.com/uport-project/veramo/issues/996)) ([b987fc0](https://github.com/uport-project/veramo/commit/b987fc0903a31d3bbffb43fef872be4d6c62c2ad)), closes [#935](https://github.com/uport-project/veramo/issues/935) [#954](https://github.com/uport-project/veramo/issues/954) [#375](https://github.com/uport-project/veramo/issues/375) [#989](https://github.com/uport-project/veramo/issues/989)
* **date-store-json:** add JSON object storage implementation ([#819](https://github.com/uport-project/veramo/issues/819)) ([934b34a](https://github.com/uport-project/veramo/commit/934b34a18b194928f90e7797289cc6f2243789ec))
* **did-provider-ethr:** use multiple networks per EthrDIDProvider ([#969](https://github.com/uport-project/veramo/issues/969)) ([0a88058](https://github.com/uport-project/veramo/commit/0a88058a5efddfe09f9f35510cc1bbc21149bf18)), closes [#968](https://github.com/uport-project/veramo/issues/968) [#893](https://github.com/uport-project/veramo/issues/893)


### BREAKING CHANGES

* the `did-resolver` and connected libraries change the data-type for `ServiceEndpoint` to `Service` and the previous semantic has changed. Services can have multiple endpoints, not just a single string.





# [3.1.0](https://github.com/uport-project/veramo/compare/v3.0.0...v3.1.0) (2021-11-12)


### Bug Fixes

* **deps:** update did-libraries ([0ea73fc](https://github.com/uport-project/veramo/commit/0ea73fc1dba02c3d4c4df5befef265f7f573b2d1))
* **deps:** update did-libraries ([417dc5d](https://github.com/uport-project/veramo/commit/417dc5dd157ee259b6f89f4987f1ecca444fb1d4))





# [3.0.0](https://github.com/uport-project/veramo/compare/v2.1.3...v3.0.0) (2021-09-20)


### Bug Fixes

* **deps:** update all non-major dependencies ([8fc5312](https://github.com/uport-project/veramo/commit/8fc53120498ce2982e8ec640e00bbb03f6f4204e))





# [2.1.0](https://github.com/uport-project/veramo/compare/v2.0.1...v2.1.0) (2021-08-11)


### Bug Fixes

* **credentials-w3c:** accept Presentations without Credentials ([#616](https://github.com/uport-project/veramo/issues/616)) ([2389cd0](https://github.com/uport-project/veramo/commit/2389cd0df080e968ee320d66fabf2e8a7b51ba47))





# [2.0.0](https://github.com/uport-project/veramo/compare/v1.2.2...v2.0.0) (2021-07-14)


### Bug Fixes

* **credential-w3c:** fixed handling of Ed25519 keys when creating VPs ([#534](https://github.com/uport-project/veramo/issues/534))([#516](https://github.com/uport-project/veramo/issues/516)) ([988c76c](https://github.com/uport-project/veramo/commit/988c76c46d391f3b76499ff141bdefe21e729c4a))
* **deps:** bump did-jwt to 5.4.0 ([#528](https://github.com/uport-project/veramo/issues/528)) ([65f22cf](https://github.com/uport-project/veramo/commit/65f22cf6dcca48b5bb35331894536a2a567a1189))


### Features

* implement didcomm v2 packing/unpacking ([#575](https://github.com/uport-project/veramo/issues/575)) ([249b07e](https://github.com/uport-project/veramo/commit/249b07eca8d2de9eb5252d71683d5f1fba319d60)), closes [#559](https://github.com/uport-project/veramo/issues/559) [#558](https://github.com/uport-project/veramo/issues/558)
* **key-manager:** add generic signing capabilities ([#529](https://github.com/uport-project/veramo/issues/529)) ([5f10a1b](https://github.com/uport-project/veramo/commit/5f10a1bcea214cb593de12fa6ec3a91b3cb712bb)), closes [#522](https://github.com/uport-project/veramo/issues/522)





# [1.2.0](https://github.com/uport-project/veramo/compare/v1.1.2...v1.2.0) (2021-04-27)


### Features

* adapt to did core spec ([#430](https://github.com/uport-project/veramo/issues/430)) ([9712db0](https://github.com/uport-project/veramo/commit/9712db0eea1a3f48cf0665d66ae715ea0c23cd4a)), closes [#418](https://github.com/uport-project/veramo/issues/418) [#428](https://github.com/uport-project/veramo/issues/428) [#417](https://github.com/uport-project/veramo/issues/417) [#416](https://github.com/uport-project/veramo/issues/416) [#412](https://github.com/uport-project/veramo/issues/412) [#397](https://github.com/uport-project/veramo/issues/397) [#384](https://github.com/uport-project/veramo/issues/384) [#394](https://github.com/uport-project/veramo/issues/394)
* add option to keep payload fields when creating JWT VC/VP ([#431](https://github.com/uport-project/veramo/issues/431)) ([43923e1](https://github.com/uport-project/veramo/commit/43923e18b8e0b68c4552489d568ab16748156970)), closes [#394](https://github.com/uport-project/veramo/issues/394)
* **did-provider-key:** add did:key provider; fixes [#335](https://github.com/uport-project/veramo/issues/335) ([#351](https://github.com/uport-project/veramo/issues/351)) ([42cd2b0](https://github.com/uport-project/veramo/commit/42cd2b08a2fd21b5b5d7bdfa57dd00ccc7184dc7)), closes [decentralized-identity/did-jwt#78](https://github.com/decentralized-identity/did-jwt/issues/78)





# [1.1.0](https://github.com/uport-project/veramo/compare/v1.0.1...v1.1.0) (2021-01-26)

**Note:** Version bump only for package @veramo/credential-w3c





## 1.0.1 (2020-12-18)

**Note:** Version bump only for package @veramo/credential-w3c
