# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
