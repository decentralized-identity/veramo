# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.3.0](https://github.com/uport-project/veramo/compare/v4.2.0...v4.3.0) (2023-01-27)

**Note:** Version bump only for package @veramo/did-manager





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **deps:** bump dependencies ([701b8ed](https://github.com/uport-project/veramo/commit/701b8edf981ea11c7ddb6a81d2817dbbdbb022f3))





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/did-manager





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)

**Note:** Version bump only for package @veramo/did-manager





# [4.0.0](https://github.com/uport-project/veramo/compare/v3.1.5...v4.0.0) (2022-09-22)


### Bug Fixes

* **did-resolver:** use interface `Resolvable` instead of the `Resolver` class ([9c2e59f](https://github.com/uport-project/veramo/commit/9c2e59f3f23f808511c6c0e8e440b4d53ba5cb00))
* update and fix inline documentation of all exported types ([#921](https://github.com/uport-project/veramo/issues/921)) ([63e64e0](https://github.com/uport-project/veramo/commit/63e64e0e2693808c4704dca8cc511dc0bab3f3b1))


### Features

* **credential-status:** rename plugin interfaces and methods ([a5adaba](https://github.com/uport-project/veramo/commit/a5adaba21a97f525bf69d156df991afc234896ab)), closes [#981](https://github.com/uport-project/veramo/issues/981)
* **did-manager:** add`didManagerUpdate` method for full DID document updates ([#974](https://github.com/uport-project/veramo/issues/974)) ([5682b25](https://github.com/uport-project/veramo/commit/5682b2566b7c4f8f9bfda10e8d06a8d2624c2a1b)), closes [#971](https://github.com/uport-project/veramo/issues/971) [#960](https://github.com/uport-project/veramo/issues/960) [#948](https://github.com/uport-project/veramo/issues/948)
* **did-provider-ethr:** use multiple networks per EthrDIDProvider ([#969](https://github.com/uport-project/veramo/issues/969)) ([0a88058](https://github.com/uport-project/veramo/commit/0a88058a5efddfe09f9f35510cc1bbc21149bf18)), closes [#968](https://github.com/uport-project/veramo/issues/968) [#893](https://github.com/uport-project/veramo/issues/893)





## [3.1.3](https://github.com/uport-project/veramo/compare/v3.1.2...v3.1.3) (2022-06-01)

**Note:** Version bump only for package @veramo/did-manager





# [3.1.0](https://github.com/uport-project/veramo/compare/v3.0.0...v3.1.0) (2021-11-12)

**Note:** Version bump only for package @veramo/did-manager





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

**Note:** Version bump only for package @veramo/did-manager





# [2.0.0](https://github.com/uport-project/veramo/compare/v1.2.2...v2.0.0) (2021-07-14)


### Features

* **did-discovery:** implement a DID discovery plugin with simple providers ([#597](https://github.com/uport-project/veramo/issues/597)) ([6f01df3](https://github.com/uport-project/veramo/commit/6f01df38a732ba314d1e60728d65f511d26bfdcb))





# [1.2.0](https://github.com/uport-project/veramo/compare/v1.1.2...v1.2.0) (2021-04-27)


### Features

* add MemoryDIDStore and MemoryKeyStore ([#447](https://github.com/uport-project/veramo/issues/447)) ([5ab1792](https://github.com/uport-project/veramo/commit/5ab1792f080cc319a9899e39dc9b634a05aa4f7c))





# [1.1.0](https://github.com/uport-project/veramo/compare/v1.0.1...v1.1.0) (2021-01-26)

**Note:** Version bump only for package @veramo/did-manager





## 1.0.1 (2020-12-18)

**Note:** Version bump only for package @veramo/did-manager
