# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.0.42](https://github.com/uport-project/veramo/compare/v2.0.1...v0.0.42) (2021-07-20)

**Note:** Version bump only for package @veramo/core





# [2.0.0](https://github.com/uport-project/veramo/compare/v1.2.2...v2.0.0) (2021-07-14)


### Bug Fixes

* **deps:** bump did-jwt to 5.4.0 ([#528](https://github.com/uport-project/veramo/issues/528)) ([65f22cf](https://github.com/uport-project/veramo/commit/65f22cf6dcca48b5bb35331894536a2a567a1189))
* **kms-local:** replace buggy didcomm clone with did jwt implementation ([#548](https://github.com/uport-project/veramo/issues/548)) ([9dea353](https://github.com/uport-project/veramo/commit/9dea3533c1936d53c1d5674c358679b17d623af2)), closes [#538](https://github.com/uport-project/veramo/issues/538)


### Features

* **cli:** export new agent methods and request LD DIDDocument by default ([#617](https://github.com/uport-project/veramo/issues/617)) ([26d088b](https://github.com/uport-project/veramo/commit/26d088b86ecfd66a00cdef7c7bb926148f46fbc9))
* implement didcomm v2 packing/unpacking ([#575](https://github.com/uport-project/veramo/issues/575)) ([249b07e](https://github.com/uport-project/veramo/commit/249b07eca8d2de9eb5252d71683d5f1fba319d60)), closes [#559](https://github.com/uport-project/veramo/issues/559) [#558](https://github.com/uport-project/veramo/issues/558)
* **key-manager:** add generic signing capabilities ([#529](https://github.com/uport-project/veramo/issues/529)) ([5f10a1b](https://github.com/uport-project/veramo/commit/5f10a1bcea214cb593de12fa6ec3a91b3cb712bb)), closes [#522](https://github.com/uport-project/veramo/issues/522)
* **key-manager:** add method to compute a shared secret ([#555](https://github.com/uport-project/veramo/issues/555)) ([393c316](https://github.com/uport-project/veramo/commit/393c316e27fb31b3c7fa63aae039b8fc6ae963ce)), closes [#541](https://github.com/uport-project/veramo/issues/541)
* **key-manager:** implement JWE functionality directly in `key-manager` ([#557](https://github.com/uport-project/veramo/issues/557)) ([a030f0a](https://github.com/uport-project/veramo/commit/a030f0a9779e5158d9369d2f81107158fbaeac70)), closes [#556](https://github.com/uport-project/veramo/issues/556)


### BREAKING CHANGES

* **kms-local:** `@veramo/kms-local-react-native` is no more. On react-native, please use `@veramo/kms-local` instead, combined with `@ethersproject/shims`





# [1.2.0](https://github.com/uport-project/veramo/compare/v1.1.2...v1.2.0) (2021-04-27)


### Bug Fixes

* **deps:** update all non-major dependencies ([#462](https://github.com/uport-project/veramo/issues/462)) ([4a2b206](https://github.com/uport-project/veramo/commit/4a2b20633810b45a155bf2149cbff57d157bda3c))


### Features

* adapt to did core spec ([#430](https://github.com/uport-project/veramo/issues/430)) ([9712db0](https://github.com/uport-project/veramo/commit/9712db0eea1a3f48cf0665d66ae715ea0c23cd4a)), closes [#418](https://github.com/uport-project/veramo/issues/418) [#428](https://github.com/uport-project/veramo/issues/428) [#417](https://github.com/uport-project/veramo/issues/417) [#416](https://github.com/uport-project/veramo/issues/416) [#412](https://github.com/uport-project/veramo/issues/412) [#397](https://github.com/uport-project/veramo/issues/397) [#384](https://github.com/uport-project/veramo/issues/384) [#394](https://github.com/uport-project/veramo/issues/394)
* **core:** add ability to define the agent context type ([#350](https://github.com/uport-project/veramo/issues/350)) ([89255b9](https://github.com/uport-project/veramo/commit/89255b9a648c38656aea05131750e68497d04c27))
* **did-provider-key:** add did:key provider; fixes [#335](https://github.com/uport-project/veramo/issues/335) ([#351](https://github.com/uport-project/veramo/issues/351)) ([42cd2b0](https://github.com/uport-project/veramo/commit/42cd2b08a2fd21b5b5d7bdfa57dd00ccc7184dc7)), closes [decentralized-identity/did-jwt#78](https://github.com/decentralized-identity/did-jwt/issues/78)





# [1.1.0](https://github.com/uport-project/veramo/compare/v1.0.1...v1.1.0) (2021-01-26)


### Bug Fixes

* **deps:** update dependency z-schema to v5 ([#323](https://github.com/uport-project/veramo/issues/323)) ([9cadf37](https://github.com/uport-project/veramo/commit/9cadf378dba487b1a664a6277eafffd629c65600))


### Features

* **core:** make agent context public readonly ([#347](https://github.com/uport-project/veramo/issues/347)) ([802948e](https://github.com/uport-project/veramo/commit/802948ea72edf8b00c42115f73430720debabed9))





## 1.0.1 (2020-12-18)

**Note:** Version bump only for package @veramo/core
