# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
