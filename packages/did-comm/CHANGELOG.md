# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.0.0](https://github.com/decentralized-identity/veramo/compare/v5.6.0...v6.0.0) (2024-04-02)


### Bug Fixes

* **credential-w3c:** forward DID resolution options to the resolver ([#1344](https://github.com/decentralized-identity/veramo/issues/1344)) ([0c22cc6](https://github.com/decentralized-identity/veramo/commit/0c22cc6a79e974214500e4440b0ea2977012377d)), closes [#1343](https://github.com/decentralized-identity/veramo/issues/1343)
* export const plugin schemas instead of defaults ([#1327](https://github.com/decentralized-identity/veramo/issues/1327)) ([7896cea](https://github.com/decentralized-identity/veramo/commit/7896ceaf2c79993eee44e46950814bea74bfe647)), closes [#1318](https://github.com/decentralized-identity/veramo/issues/1318) [#1317](https://github.com/decentralized-identity/veramo/issues/1317) [#1315](https://github.com/decentralized-identity/veramo/issues/1315)
* **utils:** bump did-jwt to 7.4.1 and reuse key conversion code from it ([#1261](https://github.com/decentralized-identity/veramo/issues/1261)) ([fb192e7](https://github.com/decentralized-identity/veramo/commit/fb192e72a0bcd38d97b14e9d584c1770961d88df)), closes [#1248](https://github.com/decentralized-identity/veramo/issues/1248) [#1245](https://github.com/decentralized-identity/veramo/issues/1245)


### chore

* **deps:** bump ethers ([#1242](https://github.com/decentralized-identity/veramo/issues/1242)) ([fbf5c69](https://github.com/decentralized-identity/veramo/commit/fbf5c69b8f747f37e60e98329a0dd0a2ba0b262e))


### Code Refactoring

* generate plugin schemas as TS instead of JSON ([#1315](https://github.com/decentralized-identity/veramo/issues/1315)) ([65c2d4b](https://github.com/decentralized-identity/veramo/commit/65c2d4bc814daa9a3a89f4f7b8e8c6973b8ce2f0)), closes [#1254](https://github.com/decentralized-identity/veramo/issues/1254)


### Features

* add Multikey support ([#1316](https://github.com/decentralized-identity/veramo/issues/1316)) ([165de35](https://github.com/decentralized-identity/veramo/commit/165de3549ccfd3d7c84514608ac3ea9e56a7b807))
* **coordinate-mediation:** implement did-comm coordinate-mediation v3.0 ([#1282](https://github.com/decentralized-identity/veramo/issues/1282)) ([462735d](https://github.com/decentralized-identity/veramo/commit/462735d138bc4984c0fcf3f72ca7d49e3187ceb7))
* **did-comm:** Improve DIDComm Service compatibility ([#1340](https://github.com/decentralized-identity/veramo/issues/1340)) ([6df704c](https://github.com/decentralized-identity/veramo/commit/6df704c769d49fb399f515f102a41736a678070d))
* **did-comm:** returnMessage from sendDIDCommMessage() when available ([#1283](https://github.com/decentralized-identity/veramo/issues/1283)) ([f7a3851](https://github.com/decentralized-identity/veramo/commit/f7a385157415e194820c181cf9091243a3f6b131))


### BREAKING CHANGES

* **did-comm:** the DIDComm Message structure has changed. The message can now specify multiple recipients in the `to` property.
* The `plugin.schema.json` files are now generated as `plugin.schema.ts`.
* **did-comm:** the return type of `IDIDComm.sendDIDCommMessage()` has changed from a string representing the transport ID to an object that may include a `returnMessage` property along with a `transportId` property.
* **deps:** now using ethers v6 as a dependency which may need extra attention when merging. The output of `eth_signTransaction` algorithms may be slightly different as transactions are by default infered as type 1 (EIP1559)





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





# [5.4.0](https://github.com/uport-project/veramo/compare/v5.3.0...v5.4.0) (2023-08-01)


### Features

* **did-comm:** add support for the AES based content and key encryption algorithms ([#1180](https://github.com/uport-project/veramo/issues/1180)) ([5294a81](https://github.com/uport-project/veramo/commit/5294a812ee578c0712b54f216416c3ef78c848da))





# [5.3.0](https://github.com/uport-project/veramo/compare/v5.2.0...v5.3.0) (2023-07-27)


### Features

* export didcomm mediator utils ([#1181](https://github.com/uport-project/veramo/issues/1181)) ([264b6a7](https://github.com/uport-project/veramo/commit/264b6a71a8647f456daedcca99efa453f53ab8a1))





# [5.2.0](https://github.com/uport-project/veramo/compare/v5.1.4...v5.2.0) (2023-05-02)


### Bug Fixes

* **credential-ld:** fix Ed25519Signature2020 verification ([#1166](https://github.com/uport-project/veramo/issues/1166)) ([c965fd5](https://github.com/uport-project/veramo/commit/c965fd502f652c9929ae4753c56ebbe351447733))
* plugin schemas ([#1159](https://github.com/uport-project/veramo/issues/1159)) ([4b5f580](https://github.com/uport-project/veramo/commit/4b5f580e993857ae19541673b484b0af34f4e611))


### Features

* add did-peer provider and resolver ([#1156](https://github.com/uport-project/veramo/issues/1156)) ([9502063](https://github.com/uport-project/veramo/commit/95020632f741bd4640b3496b7b1bf19f5e6641d0))





## [5.1.2](https://github.com/uport-project/veramo/compare/v5.1.1...v5.1.2) (2023-02-25)

**Note:** Version bump only for package @veramo/did-comm





# [5.1.0](https://github.com/uport-project/veramo/compare/v5.0.0...v5.1.0) (2023-02-24)


### Bug Fixes

* correctly export PickupRecipientMessageHandler ([#1121](https://github.com/uport-project/veramo/issues/1121)) ([3a7a086](https://github.com/uport-project/veramo/commit/3a7a0864387f7b56f1bac4cd89a3fd7e6274e644))
* **did-comm:** correctly export PickupMediatorMessageHandler ([#1120](https://github.com/uport-project/veramo/issues/1120)) ([8de26b0](https://github.com/uport-project/veramo/commit/8de26b0740f68cd6976a7aa5f83ae95ee0dd3dce))
* P256 key parity corrections ([#1137](https://github.com/uport-project/veramo/issues/1137)) ([d0eca2b](https://github.com/uport-project/veramo/commit/d0eca2b3cd9ca6741f7f056e28bb9799910bc5ec)), closes [#1136](https://github.com/uport-project/veramo/issues/1136) [#1135](https://github.com/uport-project/veramo/issues/1135)


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

* **did-comm:** add trust ping protocol ([#1080](https://github.com/uport-project/veramo/issues/1080)) ([fb22e63](https://github.com/uport-project/veramo/commit/fb22e632ef6dcce6a7dfec9a229c7be4d6d5c894))
* **did-comm:** support DIDComm Messaging attachments ([#1087](https://github.com/uport-project/veramo/issues/1087)) ([6679574](https://github.com/uport-project/veramo/commit/66795742a01d5390ad083610efd28a8fe59fb3a3)), closes [#612](https://github.com/uport-project/veramo/issues/612)





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **deps:** bump dependencies ([701b8ed](https://github.com/uport-project/veramo/commit/701b8edf981ea11c7ddb6a81d2817dbbdbb022f3))
* didcomm message handler should attempt to pass message to other handlers ([#1064](https://github.com/uport-project/veramo/issues/1064)) ([5e18427](https://github.com/uport-project/veramo/commit/5e18427dc10e3724ca141efe923a789cd0f54688))
* **utils:** correctly extract publicKeyHex from [Ed/X]25519 2020 keys ([#1076](https://github.com/uport-project/veramo/issues/1076)) ([c73002c](https://github.com/uport-project/veramo/commit/c73002c97d8c688e343aba65efd4c8e857a96522)), closes [#1067](https://github.com/uport-project/veramo/issues/1067)





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/did-comm





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)


### Bug Fixes

* **deps:** Update dependency ethr-did-resolver to v7 ([#1038](https://github.com/uport-project/veramo/issues/1038)) ([d421c0f](https://github.com/uport-project/veramo/commit/d421c0f9f5934829df2930e58e98bcfce813ce84))





## [4.0.2](https://github.com/uport-project/veramo/compare/v4.0.1...v4.0.2) (2022-10-04)


### Bug Fixes

* **credential-eip712:** add support for all did methods that use secp256k ([#1011](https://github.com/uport-project/veramo/issues/1011)) ([9940068](https://github.com/uport-project/veramo/commit/99400689dec9ea00131cf914d1999357b716612c)), closes [#991](https://github.com/uport-project/veramo/issues/991)
* **deps:** update dependency uuid to v9 ([4ff90a5](https://github.com/uport-project/veramo/commit/4ff90a58f5993880635f2b39c73edadaf3149066))





# [4.0.0](https://github.com/uport-project/veramo/compare/v3.1.5...v4.0.0) (2022-09-22)


### Bug Fixes

* **deps:** Bump `did-jwt`, `did-jwt-vc` as direct package deps ([#955](https://github.com/uport-project/veramo/issues/955)) ([e57edb3](https://github.com/uport-project/veramo/commit/e57edb34cfbaee6bba1d944497d688104f32c698))
* **deps:** update dependency did-jwt to v5.12.0 ([5b414d7](https://github.com/uport-project/veramo/commit/5b414d7d720e7c59cf3f56c35da5fe247e21bf26))
* **deps:** update did-libraries ([219cde2](https://github.com/uport-project/veramo/commit/219cde250e8d4f06d7978afcc38a04471342fd21))
* **deps:** use did-jwt v6 and ethr-did-resolver v6 ([#925](https://github.com/uport-project/veramo/issues/925)) ([0c77d03](https://github.com/uport-project/veramo/commit/0c77d03ec5ec9e2091de3f74f67ab86a22cde197)), closes [#923](https://github.com/uport-project/veramo/issues/923) [#848](https://github.com/uport-project/veramo/issues/848)
* **did-resolver:** use interface `Resolvable` instead of the `Resolver` class ([9c2e59f](https://github.com/uport-project/veramo/commit/9c2e59f3f23f808511c6c0e8e440b4d53ba5cb00))
* update and fix inline documentation of all exported types ([#921](https://github.com/uport-project/veramo/issues/921)) ([63e64e0](https://github.com/uport-project/veramo/commit/63e64e0e2693808c4704dca8cc511dc0bab3f3b1))


### Features

* add support for serviceEndpoint property as defined in latest DID Spec ([#988](https://github.com/uport-project/veramo/issues/988)) ([9bed70b](https://github.com/uport-project/veramo/commit/9bed70ba658aed34a97944e0dee27bca6c81d700))
* create DIDComm JWE with multiple recipients ([#888](https://github.com/uport-project/veramo/issues/888)) ([06acacb](https://github.com/uport-project/veramo/commit/06acacb400264d0e7f83fe31935a8ff52593f21f))
* **credential-ld:** add support for browser environments ([#916](https://github.com/uport-project/veramo/issues/916)) ([435e4d2](https://github.com/uport-project/veramo/commit/435e4d260b1774f96b182c1a75ab2f1c993f2291))
* **credential-status:** expect revoked boolean property from StatusMethods ([e00daa4](https://github.com/uport-project/veramo/commit/e00daa47865ea42d7bd8667f37c6e12fc21fd4b9))
* **credential-w3c:** align verification API between formats ([#996](https://github.com/uport-project/veramo/issues/996)) ([b987fc0](https://github.com/uport-project/veramo/commit/b987fc0903a31d3bbffb43fef872be4d6c62c2ad)), closes [#935](https://github.com/uport-project/veramo/issues/935) [#954](https://github.com/uport-project/veramo/issues/954) [#375](https://github.com/uport-project/veramo/issues/375) [#989](https://github.com/uport-project/veramo/issues/989)


### BREAKING CHANGES

* the `did-resolver` and connected libraries change the data-type for `ServiceEndpoint` to `Service` and the previous semantic has changed. Services can have multiple endpoints, not just a single string.





## [3.1.3](https://github.com/uport-project/veramo/compare/v3.1.2...v3.1.3) (2022-06-01)

**Note:** Version bump only for package @veramo/did-comm





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
* **deps:** update dependency uint8arrays to v3 ([#669](https://github.com/uport-project/veramo/issues/669)) ([a5f5c42](https://github.com/uport-project/veramo/commit/a5f5c421d307b39d926f2d701ef3b9861c325dea))
* **did-resolver:** always include didResolutionMetadata in result ([#682](https://github.com/uport-project/veramo/issues/682)) ([aabddb4](https://github.com/uport-project/veramo/commit/aabddb436b8b4dd78378da4704ba00147d074cdb)), closes [#681](https://github.com/uport-project/veramo/issues/681)


### Features

* **data-store:** initialize DB using migrations ([#679](https://github.com/uport-project/veramo/issues/679)) ([41f6240](https://github.com/uport-project/veramo/commit/41f6240d68a79338772230cbfff768189ab031ed)), closes [#676](https://github.com/uport-project/veramo/issues/676)


### BREAKING CHANGES

* **data-store:** database needs migrations for initialization. See #679 #676
The `@veramo/data-store` package relies on `typeorm` as a database abstraction.
Typeorm has a connection flag `synchonize` which bootstraps the database along with schema and relations based on a set of `Entities` (annotated typescript classes).
This is very handy for fast development iterations but it is **not recommended for production** use because there is too much ambiguity possible when the `Entities` change, and there is a risk of data loss.
The recommended way to do things is to use the `migrations` mechanism. It allows you to migrate to new database schemas when necessary, and even customize the database to your own needs.

**Going forward, this is the mechanism we will be recommending for connections.**





## [2.1.3](https://github.com/uport-project/veramo/compare/v2.1.2...v2.1.3) (2021-09-01)

**Note:** Version bump only for package @veramo/did-comm





## [2.1.2](https://github.com/uport-project/veramo/compare/v2.1.1...v2.1.2) (2021-09-01)

**Note:** Version bump only for package @veramo/did-comm





# [2.1.0](https://github.com/uport-project/veramo/compare/v2.0.1...v2.1.0) (2021-08-11)


### Bug Fixes

* **credentials-w3c:** accept Presentations without Credentials ([#616](https://github.com/uport-project/veramo/issues/616)) ([2389cd0](https://github.com/uport-project/veramo/commit/2389cd0df080e968ee320d66fabf2e8a7b51ba47))





# [2.0.0](https://github.com/uport-project/veramo/compare/v1.2.2...v2.0.0) (2021-07-14)


### Bug Fixes

* **did-comm:** avoid double conversion for some keys while packing ([78321a9](https://github.com/uport-project/veramo/commit/78321a9f22abf2c4541a6a4c49898c6aacb5d81f))
* **did-comm:** fix potential null exception when unpacking message ([584766c](https://github.com/uport-project/veramo/commit/584766c2ed393b4540a4190681ca9c8461d0679d))


### Features

* add support for did-comm over simple HTTP-based transports ([#610](https://github.com/uport-project/veramo/issues/610)) ([78836a4](https://github.com/uport-project/veramo/commit/78836a46d3ce71b568acaa98558b64f9c2b98167)), closes [#552](https://github.com/uport-project/veramo/issues/552) [#469](https://github.com/uport-project/veramo/issues/469)
* implement didcomm v2 packing/unpacking ([#575](https://github.com/uport-project/veramo/issues/575)) ([249b07e](https://github.com/uport-project/veramo/commit/249b07eca8d2de9eb5252d71683d5f1fba319d60)), closes [#559](https://github.com/uport-project/veramo/issues/559) [#558](https://github.com/uport-project/veramo/issues/558)
* **key-manager:** add generic signing capabilities ([#529](https://github.com/uport-project/veramo/issues/529)) ([5f10a1b](https://github.com/uport-project/veramo/commit/5f10a1bcea214cb593de12fa6ec3a91b3cb712bb)), closes [#522](https://github.com/uport-project/veramo/issues/522)





# [1.2.0](https://github.com/uport-project/veramo/compare/v1.1.2...v1.2.0) (2021-04-27)


### Bug Fixes

* **deps:** update all non-major dependencies ([#462](https://github.com/uport-project/veramo/issues/462)) ([4a2b206](https://github.com/uport-project/veramo/commit/4a2b20633810b45a155bf2149cbff57d157bda3c))


### Features

* adapt to did core spec ([#430](https://github.com/uport-project/veramo/issues/430)) ([9712db0](https://github.com/uport-project/veramo/commit/9712db0eea1a3f48cf0665d66ae715ea0c23cd4a)), closes [#418](https://github.com/uport-project/veramo/issues/418) [#428](https://github.com/uport-project/veramo/issues/428) [#417](https://github.com/uport-project/veramo/issues/417) [#416](https://github.com/uport-project/veramo/issues/416) [#412](https://github.com/uport-project/veramo/issues/412) [#397](https://github.com/uport-project/veramo/issues/397) [#384](https://github.com/uport-project/veramo/issues/384) [#394](https://github.com/uport-project/veramo/issues/394)





# [1.1.0](https://github.com/uport-project/veramo/compare/v1.0.1...v1.1.0) (2021-01-26)

**Note:** Version bump only for package @veramo/did-comm





## 1.0.1 (2020-12-18)

**Note:** Version bump only for package @veramo/did-comm
