# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.0.0](https://github.com/decentralized-identity/veramo/compare/v5.6.0...v6.0.0) (2024-04-02)


### Bug Fixes

* **did-provider-key:** align did:key resolver to spec ([#1332](https://github.com/decentralized-identity/veramo/issues/1332)) ([8e3b94c](https://github.com/decentralized-identity/veramo/commit/8e3b94cf997619d7adcb5cb8827e0f55ff88cdb5)), closes [#1330](https://github.com/decentralized-identity/veramo/issues/1330)


### Features

* add Multikey support ([#1316](https://github.com/decentralized-identity/veramo/issues/1316)) ([165de35](https://github.com/decentralized-identity/veramo/commit/165de3549ccfd3d7c84514608ac3ea9e56a7b807))
* **cli:** add support for did:jwk and did:peer to CLI ([#1320](https://github.com/decentralized-identity/veramo/issues/1320)) ([3ac343e](https://github.com/decentralized-identity/veramo/commit/3ac343e52dbd744c137bbe610cba9f5409a6100c))
* **did-comm:** Improve DIDComm Service compatibility ([#1340](https://github.com/decentralized-identity/veramo/issues/1340)) ([6df704c](https://github.com/decentralized-identity/veramo/commit/6df704c769d49fb399f515f102a41736a678070d))


### BREAKING CHANGES

* **did-comm:** the DIDComm Message structure has changed. The message can now specify multiple recipients in the `to` property.





# [5.6.0](https://github.com/decentralized-identity/veramo/compare/v5.5.3...v5.6.0) (2024-01-16)


### Features

* **remote-client:** allow dynamic headers param for AgentRestClient constructor ([#1314](https://github.com/decentralized-identity/veramo/issues/1314)) ([1b8a0a2](https://github.com/decentralized-identity/veramo/commit/1b8a0a2718dd63492ad3a312a6ebe5f6e7849935)), closes [#1313](https://github.com/decentralized-identity/veramo/issues/1313)





## [5.5.3](https://github.com/decentralized-identity/veramo/compare/v5.5.2...v5.5.3) (2023-10-09)


### Bug Fixes

* use DIF URLs in packages ([#1271](https://github.com/decentralized-identity/veramo/issues/1271)) ([3dfc601](https://github.com/decentralized-identity/veramo/commit/3dfc6014cdee7902c59d8db76b4c8507b870f227))





# [5.5.0](https://github.com/uport-project/veramo/compare/v5.4.1...v5.5.0) (2023-09-19)


### Bug Fixes

* **did-provider-key:** use compressed keys for creating Secp256k1 did:key ([#1217](https://github.com/uport-project/veramo/issues/1217)) ([ba8f6f5](https://github.com/uport-project/veramo/commit/ba8f6f5b9b701e57af86491504ecd209ca0c1c1d)), closes [#1213](https://github.com/uport-project/veramo/issues/1213)





## [5.4.1](https://github.com/uport-project/veramo/compare/v5.4.0...v5.4.1) (2023-08-04)


### Bug Fixes

* **ci:** benign change meant to tag all packages for another patch release ([#1211](https://github.com/uport-project/veramo/issues/1211)) ([41b5c90](https://github.com/uport-project/veramo/commit/41b5c90277171b7b38c5cf49ca01db5cf75b6300))
* **deps:** Update did-vc-libraries to v6 ([3cadd56](https://github.com/uport-project/veramo/commit/3cadd56356a23463acc04f9a8a58239a9475b1c1))





# [5.4.0](https://github.com/uport-project/veramo/compare/v5.3.0...v5.4.0) (2023-08-01)


### Bug Fixes

* **deps:** Update dependency @aviarytech/did-peer to ^0.0.21 ([1f84ae7](https://github.com/uport-project/veramo/commit/1f84ae7140d3e58e9117ec6969ad118ad2f1d9e5))





# [5.3.0](https://github.com/uport-project/veramo/compare/v5.2.0...v5.3.0) (2023-07-27)


### Bug Fixes

* **deps:** update dependency multiformats to v12 ([11fa7c3](https://github.com/uport-project/veramo/commit/11fa7c340da78101ea5e974e8ae0f90193933976))





# [5.2.0](https://github.com/uport-project/veramo/compare/v5.1.4...v5.2.0) (2023-05-02)


### Features

* add did-peer provider and resolver ([#1156](https://github.com/uport-project/veramo/issues/1156)) ([9502063](https://github.com/uport-project/veramo/commit/95020632f741bd4640b3496b7b1bf19f5e6641d0))
