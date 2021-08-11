# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
