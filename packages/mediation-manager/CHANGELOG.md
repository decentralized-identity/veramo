# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [7.0.0](https://github.com/decentralized-identity/veramo/compare/v6.0.2...v7.0.0) (2026-02-11)


### Bug Fixes

* **deps:** update dependency uuid to v11 ([#1431](https://github.com/decentralized-identity/veramo/issues/1431)) ([6ad84d9](https://github.com/decentralized-identity/veramo/commit/6ad84d91f02794e741e4b770e29e1ee9a93edcfb))
* **deps:** update devdeps and bump typeorm to 0.3.20 ([#1272](https://github.com/decentralized-identity/veramo/issues/1272)) ([7d17f37](https://github.com/decentralized-identity/veramo/commit/7d17f37ea7cc4e73a8cdae028681ae1be5c4d11c))


### Features

* **credential-w3c:** remove hardcoded proof formats ([#1395](https://github.com/decentralized-identity/veramo/issues/1395)) ([5b7d3fa](https://github.com/decentralized-identity/veramo/commit/5b7d3fad7d2ada4954f8020a6474df13d9fe51dc))


### BREAKING CHANGES

* **credential-w3c:** The credential plugins specializing in JSON-LD / EIP712 are no longer top level veramo plugins but are now managed by the `@veramo/credential-w3c` plugin which will be able to use multiple proof formats and multiplex accordingly. The constructor for the `CredentialPlugin` has changed to accept different implementations of proof formats.





## [6.0.2](https://github.com/decentralized-identity/veramo/compare/v6.0.1...v6.0.2) (2026-01-16)

**Note:** Version bump only for package @veramo/mediation-manager





## [6.0.1](https://github.com/decentralized-identity/veramo/compare/v6.0.0...v6.0.1) (2026-01-16)

**Note:** Version bump only for package @veramo/mediation-manager





# [6.0.0](https://github.com/decentralized-identity/veramo/compare/v5.6.0...v6.0.0) (2024-04-02)


### Bug Fixes

* **did-provider-key:** align did:key resolver to spec ([#1332](https://github.com/decentralized-identity/veramo/issues/1332)) ([8e3b94c](https://github.com/decentralized-identity/veramo/commit/8e3b94cf997619d7adcb5cb8827e0f55ff88cdb5)), closes [#1330](https://github.com/decentralized-identity/veramo/issues/1330)





# [5.6.0](https://github.com/decentralized-identity/veramo/compare/v5.5.3...v5.6.0) (2024-01-16)


### Features

* **remote-client:** allow dynamic headers param for AgentRestClient constructor ([#1314](https://github.com/decentralized-identity/veramo/issues/1314)) ([1b8a0a2](https://github.com/decentralized-identity/veramo/commit/1b8a0a2718dd63492ad3a312a6ebe5f6e7849935)), closes [#1313](https://github.com/decentralized-identity/veramo/issues/1313)
