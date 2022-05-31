# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.2](https://github.com/uport-project/veramo/compare/v3.1.1...v3.1.2) (2022-05-30)

**Note:** Version bump only for package @veramo/cli





## [3.1.1](https://github.com/uport-project/veramo/compare/v3.1.0...v3.1.1) (2022-01-13)

**Note:** Version bump only for package @veramo/cli





# [3.1.0](https://github.com/uport-project/veramo/compare/v3.0.0...v3.1.0) (2021-11-12)


### Bug Fixes

* **data-store:** add support for entityPrefix ([#725](https://github.com/uport-project/veramo/issues/725)) ([801bb95](https://github.com/uport-project/veramo/commit/801bb95ddd22abaa61c938b025834132d4e8d3be)), closes [#724](https://github.com/uport-project/veramo/issues/724)
* **deps:** update all non-major dependencies ([a6614e8](https://github.com/uport-project/veramo/commit/a6614e8ba9b34c6fdb7a9e3960b6fa20090ce44a))
* **deps:** update builders-and-testers ([5c4fa9e](https://github.com/uport-project/veramo/commit/5c4fa9e90def0beea9873e647a3bdd1410987e00))
* **deps:** update builders-and-testers ([828bfa2](https://github.com/uport-project/veramo/commit/828bfa20c6181c2e3a405ab13a06249f5112eb72))
* **deps:** update builders-and-testers ([e31a4be](https://github.com/uport-project/veramo/commit/e31a4beea645169e468824c26122d69cf5c4050f))
* **deps:** update builders-and-testers ([ba97cf1](https://github.com/uport-project/veramo/commit/ba97cf139e4379308edefee09f9b1dd7f36bb026))
* **deps:** update builders-and-testers ([2e4e6e5](https://github.com/uport-project/veramo/commit/2e4e6e56f1cde9213966ed95671d97b529c0f505))
* **deps:** update dependency commander to v8 ([#587](https://github.com/uport-project/veramo/issues/587)) ([9fc5c50](https://github.com/uport-project/veramo/commit/9fc5c509b6475b19c1f49fdf31cf7d5ed3fcc16a))
* **deps:** update dependency jsonpointer to v5 ([5c0ab9f](https://github.com/uport-project/veramo/commit/5c0ab9f2b0f377722abae6b3a175e22e7ad5471a))
* **deps:** update dependency passport to ^0.5.0 ([a4dae24](https://github.com/uport-project/veramo/commit/a4dae24c8e8b2bf9e061e182076c1b89b71df306))
* **deps:** update dependency ts-json-schema-generator to ^0.97.0 ([c20a409](https://github.com/uport-project/veramo/commit/c20a409d8bbc84bdd41809a722c1fd599707e46a))
* **deps:** update did-libraries ([0ea73fc](https://github.com/uport-project/veramo/commit/0ea73fc1dba02c3d4c4df5befef265f7f573b2d1))
* **deps:** update did-libraries ([417dc5d](https://github.com/uport-project/veramo/commit/417dc5dd157ee259b6f89f4987f1ecca444fb1d4))


### Features

* **cli:** add command to verify an agent configuration file ([#729](https://github.com/uport-project/veramo/issues/729)) ([2790ebc](https://github.com/uport-project/veramo/commit/2790ebcc2af72caa2a85f2068cdd832b548a2187))
* **did-comm:** didcomm messaging using did:ethr ([#744](https://github.com/uport-project/veramo/issues/744)) ([1be5e04](https://github.com/uport-project/veramo/commit/1be5e04e09112c0823d776fe2d55117d71a7b448)), closes [#743](https://github.com/uport-project/veramo/issues/743)





# [3.0.0](https://github.com/uport-project/veramo/compare/v2.1.3...v3.0.0) (2021-09-20)


### Bug Fixes

* **deps:** update builders-and-testers ([acef171](https://github.com/uport-project/veramo/commit/acef171a1845ed4b1022efc5a8cd7a893db4e73a))
* **deps:** update builders-and-testers ([ca746d2](https://github.com/uport-project/veramo/commit/ca746d2450ca0d08703a219e4f17f3f2966bd0db))
* **deps:** update dependency @microsoft/api-extractor to v7.18.6 ([80b8f67](https://github.com/uport-project/veramo/commit/80b8f673539c0fa62bc24490d9b09acecbd3e4d1))
* **deps:** update dependency @microsoft/api-extractor to v7.18.7 ([28d7cf0](https://github.com/uport-project/veramo/commit/28d7cf09afdef1b0905dfbe6520dc953a2da27cd))


### Features

* **data-store:** initialize DB using migrations ([#679](https://github.com/uport-project/veramo/issues/679)) ([41f6240](https://github.com/uport-project/veramo/commit/41f6240d68a79338772230cbfff768189ab031ed)), closes [#676](https://github.com/uport-project/veramo/issues/676)
* **key-manager:** move private key storage to kms-local ([#661](https://github.com/uport-project/veramo/issues/661)) ([6b1d135](https://github.com/uport-project/veramo/commit/6b1d135eedb1c58b715be8941d34312da39facb2)), closes [#539](https://github.com/uport-project/veramo/issues/539) [#540](https://github.com/uport-project/veramo/issues/540) [#680](https://github.com/uport-project/veramo/issues/680)


### BREAKING CHANGES

* **key-manager:** `keyManagetGet` no longer returns private key data
* **key-manager:** `KeyStore` no longer requires a `SecretBox`
* **key-manager:** `KeyManagementSystem` needs a `PrivateKeyStore`
* **key-manager:** @veramo/cli configuration version update to 3.0

If you're already working with Veramo and wish to upgrade existing agents to veramo 3.0, you'll have to make some changes to your configuration, depending on how you're using the framework.

It boils down to these 3 steps:

1. Update your database connection to use migrations
2. Remove the `SecretBox` parameter from `KeyManager`
3. Add a `PrivateKeyStore` parameter to `KeyManagementSystem` with a `SecretBox` that you were using before with `KeyManager` (and keep the same encryption key)

* feat(key-manager): move private key storage to kms-local
* **data-store:** database needs migrations for initialization. See #679 #676
The `@veramo/data-store` package relies on `typeorm` as a database abstraction.
Typeorm has a connection flag `synchonize` which bootstraps the database along with schema and relations based on a set of `Entities` (annotated typescript classes).
This is very handy for fast development iterations but it is **not recommended for production** use because there is too much ambiguity possible when the `Entities` change, and there is a risk of data loss.
The recommended way to do things is to use the `migrations` mechanism. It allows you to migrate to new database schemas when necessary, and even customize the database to your own needs.

**Going forward, this is the mechanism we will be recommending for connections.**





## [2.1.3](https://github.com/uport-project/veramo/compare/v2.1.2...v2.1.3) (2021-09-01)

**Note:** Version bump only for package @veramo/cli





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
