# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.3.0](https://github.com/uport-project/veramo/compare/v4.2.0...v4.3.0) (2023-01-27)

**Note:** Version bump only for package @veramo/data-store





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **credential-ld:** simplify signature suite use of Uint8Array ([49a10ec](https://github.com/uport-project/veramo/commit/49a10ecc29d56118ac09c5df73fed885fe6988c1))
* **deps:** bump dependencies ([701b8ed](https://github.com/uport-project/veramo/commit/701b8edf981ea11c7ddb6a81d2817dbbdbb022f3))





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/data-store





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)

**Note:** Version bump only for package @veramo/data-store





## [4.0.2](https://github.com/uport-project/veramo/compare/v4.0.1...v4.0.2) (2022-10-04)


### Bug Fixes

* **data-store:** use looser typeorm version range to fix [#1013](https://github.com/uport-project/veramo/issues/1013) ([#1016](https://github.com/uport-project/veramo/issues/1016)) ([83807f3](https://github.com/uport-project/veramo/commit/83807f31f845c8a0116f0300c51735ec406d9dd4))





# [4.0.0](https://github.com/uport-project/veramo/compare/v3.1.5...v4.0.0) (2022-09-22)


### Bug Fixes

* **deps:** update all non-major dependencies ([a7a5b5d](https://github.com/uport-project/veramo/commit/a7a5b5dc3a2d90670927f4367bef2055a6d39f3b))
* **deps:** update all non-major dependencies ([04c0053](https://github.com/uport-project/veramo/commit/04c00530963b1c4496374532bf74b73f3b22c825))
* **deps:** update all non-major dependencies ([d8aa16a](https://github.com/uport-project/veramo/commit/d8aa16a36d2e63c65177bbf281f8d15fcc9dcb5a))
* **deps:** update all non-major dependencies ([183b4bc](https://github.com/uport-project/veramo/commit/183b4bc5ca3dcf11dd111e7e1ae19636909ff4c7))
* **deps:** update dependency typeorm to v0.2.41 ([61a8103](https://github.com/uport-project/veramo/commit/61a8103c15849dfd8574dda69692a7d8f7fa534e))
* **did-resolver:** use interface `Resolvable` instead of the `Resolver` class ([9c2e59f](https://github.com/uport-project/veramo/commit/9c2e59f3f23f808511c6c0e8e440b4d53ba5cb00))
* **docs:** fix relevant errors and warnings in TSDoc to enable proper docs generation on `[@next](https://github.com/next)` branch ([79c3872](https://github.com/uport-project/veramo/commit/79c387230219c92c1951d19b8ddf716308a46c5b))
* update and fix inline documentation of all exported types ([#921](https://github.com/uport-project/veramo/issues/921)) ([63e64e0](https://github.com/uport-project/veramo/commit/63e64e0e2693808c4704dca8cc511dc0bab3f3b1))


### Features

* add partial match for dids and aliases in did discovery provider for data store ([92b793e](https://github.com/uport-project/veramo/commit/92b793e8b45f005b87717393419cf5f84a5ca0ec))
* add support for serviceEndpoint property as defined in latest DID Spec ([#988](https://github.com/uport-project/veramo/issues/988)) ([9bed70b](https://github.com/uport-project/veramo/commit/9bed70ba658aed34a97944e0dee27bca6c81d700))
* **credential-ld:** add support for browser environments ([#916](https://github.com/uport-project/veramo/issues/916)) ([435e4d2](https://github.com/uport-project/veramo/commit/435e4d260b1774f96b182c1a75ab2f1c993f2291))
* **credential-w3c:** add ICredentialPlugin interface in core package ([#1001](https://github.com/uport-project/veramo/issues/1001)) ([7b6d195](https://github.com/uport-project/veramo/commit/7b6d1950364c8b741dd958d29e506b95fa5b1cec)), closes [#941](https://github.com/uport-project/veramo/issues/941)
* **data-store:** use DataSource instead of Connection ([#970](https://github.com/uport-project/veramo/issues/970)) ([3377930](https://github.com/uport-project/veramo/commit/3377930189bcbd43dfd155992093d2bbeb883335)), closes [#947](https://github.com/uport-project/veramo/issues/947)
* **date-store-json:** add JSON object storage implementation ([#819](https://github.com/uport-project/veramo/issues/819)) ([934b34a](https://github.com/uport-project/veramo/commit/934b34a18b194928f90e7797289cc6f2243789ec))
* update did-discover-provider to search by DID likeness in addition to name ([3696a7a](https://github.com/uport-project/veramo/commit/3696a7aa275e97de0cd1048a7d32ead57abf9e7c))


### BREAKING CHANGES

* the `did-resolver` and connected libraries change the data-type for `ServiceEndpoint` to `Service` and the previous semantic has changed. Services can have multiple endpoints, not just a single string.





## [3.1.4](https://github.com/uport-project/veramo/compare/v3.1.3...v3.1.4) (2022-06-02)


### Bug Fixes

* **deps:** bump sqlite3 to 5.0.8 to enable build on apple M1 chips ([#911](https://github.com/uport-project/veramo/issues/911)) ([daeadb7](https://github.com/uport-project/veramo/commit/daeadb7ce5a86a5ef01e1b1d507133f11fb35d29))





## [3.1.3](https://github.com/uport-project/veramo/compare/v3.1.2...v3.1.3) (2022-06-01)

**Note:** Version bump only for package @veramo/data-store





# [3.1.0](https://github.com/uport-project/veramo/compare/v3.0.0...v3.1.0) (2021-11-12)


### Bug Fixes

* **data-store:** add support for entityPrefix ([#725](https://github.com/uport-project/veramo/issues/725)) ([801bb95](https://github.com/uport-project/veramo/commit/801bb95ddd22abaa61c938b025834132d4e8d3be)), closes [#724](https://github.com/uport-project/veramo/issues/724)
* **deps:** update all non-major dependencies ([a6614e8](https://github.com/uport-project/veramo/commit/a6614e8ba9b34c6fdb7a9e3960b6fa20090ce44a))


### Features

* **did-comm:** didcomm messaging using did:ethr ([#744](https://github.com/uport-project/veramo/issues/744)) ([1be5e04](https://github.com/uport-project/veramo/commit/1be5e04e09112c0823d776fe2d55117d71a7b448)), closes [#743](https://github.com/uport-project/veramo/issues/743)





# [3.0.0](https://github.com/uport-project/veramo/compare/v2.1.3...v3.0.0) (2021-09-20)


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





# [2.1.0](https://github.com/uport-project/veramo/compare/v2.0.1...v2.1.0) (2021-08-11)


### Bug Fixes

* **credentials-w3c:** accept Presentations without Credentials ([#616](https://github.com/uport-project/veramo/issues/616)) ([2389cd0](https://github.com/uport-project/veramo/commit/2389cd0df080e968ee320d66fabf2e8a7b51ba47))
* dataStoreDeleteVerifiableCredential ([#652](https://github.com/uport-project/veramo/issues/652)) ([840d89b](https://github.com/uport-project/veramo/commit/840d89ba097b89c061c9206057e05bd2e3d3a630)), closes [#649](https://github.com/uport-project/veramo/issues/649)


### Features

* **data-store:** delete verifiable credential ([#634](https://github.com/uport-project/veramo/issues/634)) ([c7b0131](https://github.com/uport-project/veramo/commit/c7b0131c94e21c5c6800990c5743418b6b135a30)), closes [#635](https://github.com/uport-project/veramo/issues/635)





# [2.0.0](https://github.com/uport-project/veramo/compare/v1.2.2...v2.0.0) (2021-07-14)


### Bug Fixes

* **kms-local:** replace buggy didcomm clone with did jwt implementation ([#548](https://github.com/uport-project/veramo/issues/548)) ([9dea353](https://github.com/uport-project/veramo/commit/9dea3533c1936d53c1d5674c358679b17d623af2)), closes [#538](https://github.com/uport-project/veramo/issues/538)


### Features

* **did-discovery:** implement a DID discovery plugin with simple providers ([#597](https://github.com/uport-project/veramo/issues/597)) ([6f01df3](https://github.com/uport-project/veramo/commit/6f01df38a732ba314d1e60728d65f511d26bfdcb))
* **key-manager:** add generic signing capabilities ([#529](https://github.com/uport-project/veramo/issues/529)) ([5f10a1b](https://github.com/uport-project/veramo/commit/5f10a1bcea214cb593de12fa6ec3a91b3cb712bb)), closes [#522](https://github.com/uport-project/veramo/issues/522)


### BREAKING CHANGES

* **kms-local:** `@veramo/kms-local-react-native` is no more. On react-native, please use `@veramo/kms-local` instead, combined with `@ethersproject/shims`





# [1.2.0](https://github.com/uport-project/veramo/compare/v1.1.2...v1.2.0) (2021-04-27)

**Note:** Version bump only for package @veramo/data-store





## [1.1.2](https://github.com/uport-project/veramo/compare/v1.1.1...v1.1.2) (2021-04-26)


### Bug Fixes

* add names to TypeORM entities ([#480](https://github.com/uport-project/veramo/issues/480)) ([750bfcf](https://github.com/uport-project/veramo/commit/750bfcf825b3d18080f7bf308b3a33a4da71a5eb))





# [1.1.0](https://github.com/uport-project/veramo/compare/v1.0.1...v1.1.0) (2021-01-26)


### Bug Fixes

* make privateKey property of Key entity nullable ([#342](https://github.com/uport-project/veramo/issues/342)) ([aa48ed9](https://github.com/uport-project/veramo/commit/aa48ed9930395c66aa8f952b8545c9b918e303ae))





## 1.0.1 (2020-12-18)

**Note:** Version bump only for package @veramo/data-store
