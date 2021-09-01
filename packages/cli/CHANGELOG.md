# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.2](https://github.com/uport-project/veramo/compare/v2.1.1...v2.1.2) (2021-09-01)

**Note:** Version bump only for package @veramo/cli





## [2.1.1](https://github.com/uport-project/veramo/compare/v2.1.0...v2.1.1) (2021-08-11)


### Bug Fixes

* include tx type in eth_signTransaction ([#660](https://github.com/uport-project/veramo/issues/660)) ([d45129e](https://github.com/uport-project/veramo/commit/d45129ec7106c7fdb0ddfafc22bfa498d4e95d9d)), closes [#641](https://github.com/uport-project/veramo/issues/641)





# [2.1.0](https://github.com/uport-project/veramo/compare/v2.0.1...v2.1.0) (2021-08-11)


### Bug Fixes

* **cli:** export recent methods from CLI local and remote ([44da085](https://github.com/uport-project/veramo/commit/44da0856bfdeb8f47ad85086e2d600d1e7e7f06a))
* **deps:** update dependency @microsoft/api-extractor to v7.18.4 ([ec64d56](https://github.com/uport-project/veramo/commit/ec64d56eadf23a01946ad5cec3c4fcbd116ec073))
* **deps:** update dependency ts-json-schema-generator to ^0.95.0 ([76e0133](https://github.com/uport-project/veramo/commit/76e0133ff818d805fe3ebbfb601073a568d1bd25))
* **deps:** update dependency ws to v8 ([#643](https://github.com/uport-project/veramo/issues/643)) ([40fae61](https://github.com/uport-project/veramo/commit/40fae6198f427283c0db4db29fde53360deec37b))





## [2.0.1](https://github.com/uport-project/veramo/compare/v2.0.0...v2.0.1) (2021-07-20)


### Bug Fixes

* **cli:** export recent methods from CLI local and remote ([#625](https://github.com/uport-project/veramo/issues/625)) ([36bce08](https://github.com/uport-project/veramo/commit/36bce08095104fe7a1cb97f506da857e18fb8dc2))





# [2.0.0](https://github.com/uport-project/veramo/compare/v1.2.2...v2.0.0) (2021-07-14)


### Bug Fixes

* **deps:** update dependency @microsoft/api-extractor to v7.18.1 ([502c4c7](https://github.com/uport-project/veramo/commit/502c4c7ee6f674984e04adddcd555444cf6b94db))
* **deps:** update dependency dotenv to v10 ([#530](https://github.com/uport-project/veramo/issues/530)) ([1bd2c3f](https://github.com/uport-project/veramo/commit/1bd2c3fc3b7ce0f6ea8fbee00990eb1f8e7cd39f))
* **deps:** update dependency dotenv to v9 ([#506](https://github.com/uport-project/veramo/issues/506)) ([4d1b720](https://github.com/uport-project/veramo/commit/4d1b720e1335cca7fc403bb17e6936909b1aaaf3))
* **deps:** update dependency openapi-types to v9 ([#517](https://github.com/uport-project/veramo/issues/517)) ([3c33265](https://github.com/uport-project/veramo/commit/3c33265d3ebf65d6bc64f1fccda5461a1109b25c))
* **deps:** update dependency ts-json-schema-generator to v0.92.0 ([a232e3a](https://github.com/uport-project/veramo/commit/a232e3a1481ab18682d96a8b4855f9824341aa12))
* improve subject selection and verification for SDR ([#512](https://github.com/uport-project/veramo/issues/512)) ([01cb44e](https://github.com/uport-project/veramo/commit/01cb44eee6753f7bd4f5c31c38c6f56a708ff94e)), closes [#415](https://github.com/uport-project/veramo/issues/415)


### Features

* **cli:** add DID discovery plugin to @veramo/cli ([#600](https://github.com/uport-project/veramo/issues/600)) ([a484f4c](https://github.com/uport-project/veramo/commit/a484f4c67e044d7c0299f128e15631cc8ae16f60))
* **cli:** export new agent methods and request LD DIDDocument by default ([#617](https://github.com/uport-project/veramo/issues/617)) ([26d088b](https://github.com/uport-project/veramo/commit/26d088b86ecfd66a00cdef7c7bb926148f46fbc9))
* implement didcomm v2 packing/unpacking ([#575](https://github.com/uport-project/veramo/issues/575)) ([249b07e](https://github.com/uport-project/veramo/commit/249b07eca8d2de9eb5252d71683d5f1fba319d60)), closes [#559](https://github.com/uport-project/veramo/issues/559) [#558](https://github.com/uport-project/veramo/issues/558)
* **key-manager:** add generic signing capabilities ([#529](https://github.com/uport-project/veramo/issues/529)) ([5f10a1b](https://github.com/uport-project/veramo/commit/5f10a1bcea214cb593de12fa6ec3a91b3cb712bb)), closes [#522](https://github.com/uport-project/veramo/issues/522)
* **sdr:** return UniqueVerifiableCredential for selective-disclosure ([#593](https://github.com/uport-project/veramo/issues/593)) ([9c6c090](https://github.com/uport-project/veramo/commit/9c6c0906607bc8f415042d3a855a2dd23a097725)), closes [#496](https://github.com/uport-project/veramo/issues/496)


### BREAKING CHANGES

* **sdr:** `getVerifiableCredentialsForSdr` and `validatePresentationAgainstSdr` now returns { hash: string, verifiableCredential: VerifiableCredential} instead of `VerifiableCredential`





## [1.2.2](https://github.com/uport-project/veramo/compare/v1.2.1...v1.2.2) (2021-05-18)


### Bug Fixes

* **cli:** print entire JSON tree resulting from DID resolution ([#524](https://github.com/uport-project/veramo/issues/524)) ([e83d33c](https://github.com/uport-project/veramo/commit/e83d33cc0687a100587a439bdc8b8ed1219b9c24)), closes [#523](https://github.com/uport-project/veramo/issues/523)





## [1.2.1](https://github.com/uport-project/veramo/compare/v1.2.0...v1.2.1) (2021-05-03)


### Bug Fixes

* integration tests and CLI config for did:key ([#498](https://github.com/uport-project/veramo/issues/498)) ([2ec0687](https://github.com/uport-project/veramo/commit/2ec068715d9fd4f2917c05f67755e226713cda1d))





# [1.2.0](https://github.com/uport-project/veramo/compare/v1.1.2...v1.2.0) (2021-04-27)


### Bug Fixes

* **deps:** update all non-major dependencies ([#462](https://github.com/uport-project/veramo/issues/462)) ([4a2b206](https://github.com/uport-project/veramo/commit/4a2b20633810b45a155bf2149cbff57d157bda3c))
* **deps:** update dependency inquirer to v8 ([#395](https://github.com/uport-project/veramo/issues/395)) ([96c2129](https://github.com/uport-project/veramo/commit/96c21295cbb7bddeb88711e77daadde77d4f1a4d))
* **deps:** update dependency ngrok to v4 ([#433](https://github.com/uport-project/veramo/issues/433)) ([176e221](https://github.com/uport-project/veramo/commit/176e22144403ab3e2c885dc575394bae42d67a80))
* **deps:** update dependency openapi-types to v8 ([#446](https://github.com/uport-project/veramo/issues/446)) ([7ab3737](https://github.com/uport-project/veramo/commit/7ab3737094beaf1312336b2ed31764121d59ccf1))
* **deps:** update dependency ts-json-schema-generator to v0.90.0 ([d806ab5](https://github.com/uport-project/veramo/commit/d806ab5e7e934573796b84ec7adc54791b23efa5))
* default CLI config OpenAPI schema ([#429](https://github.com/uport-project/veramo/issues/429)) ([c985d37](https://github.com/uport-project/veramo/commit/c985d37c63d5bfcc490f56ceead8c762c19142f0))
* **deps:** update dependency ts-json-schema-generator to v0.84.0 ([#369](https://github.com/uport-project/veramo/issues/369)) ([86ec9b3](https://github.com/uport-project/veramo/commit/86ec9b378248945cb364ec2224235359f3ac9d32))


### Features

* adapt to did core spec ([#430](https://github.com/uport-project/veramo/issues/430)) ([9712db0](https://github.com/uport-project/veramo/commit/9712db0eea1a3f48cf0665d66ae715ea0c23cd4a)), closes [#418](https://github.com/uport-project/veramo/issues/418) [#428](https://github.com/uport-project/veramo/issues/428) [#417](https://github.com/uport-project/veramo/issues/417) [#416](https://github.com/uport-project/veramo/issues/416) [#412](https://github.com/uport-project/veramo/issues/412) [#397](https://github.com/uport-project/veramo/issues/397) [#384](https://github.com/uport-project/veramo/issues/384) [#394](https://github.com/uport-project/veramo/issues/394)
* add native resolver for did:key ([#458](https://github.com/uport-project/veramo/issues/458)) ([a026f24](https://github.com/uport-project/veramo/commit/a026f247ad91dcb3a996e0e95b0fe253cf538f8b)), closes [#352](https://github.com/uport-project/veramo/issues/352)





## [1.1.2](https://github.com/uport-project/veramo/compare/v1.1.1...v1.1.2) (2021-04-26)

**Note:** Version bump only for package @veramo/cli





## [1.1.1](https://github.com/uport-project/veramo/compare/v1.1.0...v1.1.1) (2021-03-09)


### Bug Fixes

* **cli:** validate config file version number ([#413](https://github.com/uport-project/veramo/issues/413)) ([fb5668c](https://github.com/uport-project/veramo/commit/fb5668cb95cee2b26bb06e55b20d0007f57a6a02))





# [1.1.0](https://github.com/uport-project/veramo/compare/v1.0.1...v1.1.0) (2021-01-26)


### Bug Fixes

* **deps:** update dependency commander to v7 ([#330](https://github.com/uport-project/veramo/issues/330)) ([f8a7566](https://github.com/uport-project/veramo/commit/f8a75665f02bbee74c89554a67588a6a33968d85))





## 1.0.1 (2020-12-18)

**Note:** Version bump only for package @veramo/cli
