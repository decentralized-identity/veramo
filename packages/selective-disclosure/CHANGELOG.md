# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://github.com/uport-project/veramo/compare/v1.2.2...v2.0.0) (2021-07-14)


### Bug Fixes

* **deps:** bump did-jwt to 5.4.0 ([#528](https://github.com/uport-project/veramo/issues/528)) ([65f22cf](https://github.com/uport-project/veramo/commit/65f22cf6dcca48b5bb35331894536a2a567a1189))
* **deps:** update all non-major dependencies ([9f40f7d](https://github.com/uport-project/veramo/commit/9f40f7d8b2a67e112b7ef2322ba887ee9033646c))
* **deps:** update dependency did-jwt to v5.5.2 ([ae0661f](https://github.com/uport-project/veramo/commit/ae0661fc5b225f80ebb102db60d55822b4786bce))
* use optional chaining in SDR message handler ([#561](https://github.com/uport-project/veramo/issues/561)) ([ab24877](https://github.com/uport-project/veramo/commit/ab24877f941c37f1042fdc23683b1292b7f5bdc7)), closes [#560](https://github.com/uport-project/veramo/issues/560)


### Features

* **key-manager:** add generic signing capabilities ([#529](https://github.com/uport-project/veramo/issues/529)) ([5f10a1b](https://github.com/uport-project/veramo/commit/5f10a1bcea214cb593de12fa6ec3a91b3cb712bb)), closes [#522](https://github.com/uport-project/veramo/issues/522)
* **sdr:** return UniqueVerifiableCredential for selective-disclosure ([#593](https://github.com/uport-project/veramo/issues/593)) ([9c6c090](https://github.com/uport-project/veramo/commit/9c6c0906607bc8f415042d3a855a2dd23a097725)), closes [#496](https://github.com/uport-project/veramo/issues/496)


### BREAKING CHANGES

* **sdr:** `getVerifiableCredentialsForSdr` and `validatePresentationAgainstSdr` now returns { hash: string, verifiableCredential: VerifiableCredential} instead of `VerifiableCredential`





# [1.2.0](https://github.com/uport-project/veramo/compare/v1.1.2...v1.2.0) (2021-04-27)


### Features

* adapt to did core spec ([#430](https://github.com/uport-project/veramo/issues/430)) ([9712db0](https://github.com/uport-project/veramo/commit/9712db0eea1a3f48cf0665d66ae715ea0c23cd4a)), closes [#418](https://github.com/uport-project/veramo/issues/418) [#428](https://github.com/uport-project/veramo/issues/428) [#417](https://github.com/uport-project/veramo/issues/417) [#416](https://github.com/uport-project/veramo/issues/416) [#412](https://github.com/uport-project/veramo/issues/412) [#397](https://github.com/uport-project/veramo/issues/397) [#384](https://github.com/uport-project/veramo/issues/384) [#394](https://github.com/uport-project/veramo/issues/394)





## [1.1.2](https://github.com/uport-project/veramo/compare/v1.1.1...v1.1.2) (2021-04-26)

**Note:** Version bump only for package @veramo/selective-disclosure





# [1.1.0](https://github.com/uport-project/veramo/compare/v1.0.1...v1.1.0) (2021-01-26)

**Note:** Version bump only for package @veramo/selective-disclosure





## 1.0.1 (2020-12-18)

**Note:** Version bump only for package @veramo/selective-disclosure
