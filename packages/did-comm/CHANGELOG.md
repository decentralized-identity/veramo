# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
