# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [7.0.0](https://github.com/decentralized-identity/veramo/compare/v6.0.2...v7.0.0) (2026-02-11)


### Bug Fixes

* **deps:** update devdeps and bump typeorm to 0.3.20 ([#1272](https://github.com/decentralized-identity/veramo/issues/1272)) ([7d17f37](https://github.com/decentralized-identity/veramo/commit/7d17f37ea7cc4e73a8cdae028681ae1be5c4d11c))


### Features

* **credential-w3c:** refactor the ICredentialProvider API ([#1488](https://github.com/decentralized-identity/veramo/issues/1488)) ([cbd848d](https://github.com/decentralized-identity/veramo/commit/cbd848d4ce2b52497d99d335f1c93bd8b005cdb2))
* **credential-w3c:** remove hardcoded proof formats ([#1395](https://github.com/decentralized-identity/veramo/issues/1395)) ([5b7d3fa](https://github.com/decentralized-identity/veramo/commit/5b7d3fad7d2ada4954f8020a6474df13d9fe51dc))


### BREAKING CHANGES

* **credential-w3c:** This changeset, along with the previous changes in #1395 modify the CredentialPlugin to support extensibility without modifications to the veramo repository. This plugin now acts as an orchestrator for other ICredentialProvider implementations that provide the actual support for various verifiable data formats. ICredentialProvider implementations can be implemented externally and used with this plugin.
* **credential-w3c:** The credential plugins specializing in JSON-LD / EIP712 are no longer top level veramo plugins but are now managed by the `@veramo/credential-w3c` plugin which will be able to use multiple proof formats and multiplex accordingly. The constructor for the `CredentialPlugin` has changed to accept different implementations of proof formats.
