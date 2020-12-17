# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [7.0.0](https://github.com/uport-project/daf/compare/v6.4.1...v7.0.0) (2020-12-17)


### Bug Fixes

* **daf-did-jwt:** Fix parsing of JWT with missing `typ` in header ([#293](https://github.com/uport-project/daf/issues/293)) ([48e4c60](https://github.com/uport-project/daf/commit/48e4c607f78ac19be2ba83291cb68f414edb5b6b)), closes [#291](https://github.com/uport-project/daf/issues/291)
* **daf-did-jwt:** Fix verification of EdDSA JWTs ([#289](https://github.com/uport-project/daf/issues/289)) ([b97f2a3](https://github.com/uport-project/daf/commit/b97f2a3bc6bfc5f9df143e7e79840e568d6a9606)), closes [#288](https://github.com/uport-project/daf/issues/288)
* Daf-libsodium debug ([babbfe6](https://github.com/uport-project/daf/commit/babbfe63b51f4b6430d0dcd75ca2a2e599c184af))
* IdentityProvider WIP ([feec69e](https://github.com/uport-project/daf/commit/feec69e49f1760884b263feee63fc3e2d833c7e5))
* Removing EcdsaSignature type ([3e3a684](https://github.com/uport-project/daf/commit/3e3a6843a77cf389be9aa6414a2f77ebe26adc62))


### Code Refactoring

* **daf-cli:** Refactor CLI command palette ([#304](https://github.com/uport-project/daf/issues/304)) ([a5a0670](https://github.com/uport-project/daf/commit/a5a0670f5162e3f8753fa338ed00e64397c8acc0)), closes [#264](https://github.com/uport-project/daf/issues/264)
* Refactor and add inline documentation to daf-w3c package ([f0e2cb9](https://github.com/uport-project/daf/commit/f0e2cb9748dc04b0d46ac1d80bac9a0b7f7546cd))


### Features

* Generate plugin schema ([#277](https://github.com/uport-project/daf/issues/277)) ([c90473a](https://github.com/uport-project/daf/commit/c90473a67731eb0cfcaf545afe0d64dfee77809c))
* Generating plugin schemas ([d4450cd](https://github.com/uport-project/daf/commit/d4450cd30e27ebc8bf961400b871757662e202c3))
* Validating returnType ([c7d1ef3](https://github.com/uport-project/daf/commit/c7d1ef3bd77dd4a77cf9dcfa32a2ed8b47fe04e0))


### BREAKING CHANGES

* **daf-cli:** This refactor changes the CLI list of commands. Run `daf --help` to get the latest options.
The same actions are possible, but under different (simpler) names and subcommands.
* the `IW3c` type and `W3c` class have been renamed to
`ICredentialIssuer` and `CredentialIssuer`

fix(deps): update `did-resolver` and `did-jwt` libs for all packages to maintain type consistency





## [6.4.1](https://github.com/uport-project/daf/compare/v6.4.0...v6.4.1) (2020-11-13)

**Note:** Version bump only for package daf-libsodium





# [6.3.0](https://github.com/uport-project/daf/compare/v6.1.1...v6.3.0) (2020-09-04)

### Features

- **release:** Fix package descriptions and trigger new minor release ([#233](https://github.com/uport-project/daf/issues/233)) ([e67f4da](https://github.com/uport-project/daf/commit/e67f4da055d1f0b1b0ba4205726b79979d234a06))
- **release:** Trigger a new minor release ([#234](https://github.com/uport-project/daf/issues/234)) ([7c905e1](https://github.com/uport-project/daf/commit/7c905e1ea7c4851f7f06e87e06efe34d4eac7b0f))

# [6.2.0](https://github.com/uport-project/daf/compare/v6.1.2...v6.2.0) (2020-09-04)

### Features

- **release:** Fix package descriptions and trigger new minor release ([#233](https://github.com/uport-project/daf/issues/233)) ([e67f4da](https://github.com/uport-project/daf/commit/e67f4da055d1f0b1b0ba4205726b79979d234a06))

## [6.1.2](https://github.com/uport-project/daf/compare/v6.1.1...v6.1.2) (2020-09-03)

**Note:** Version bump only for package daf-libsodium

## [6.1.1](https://github.com/uport-project/daf/compare/v6.1.0...v6.1.1) (2020-07-06)

**Note:** Version bump only for package daf-libsodium

# [6.0.0](https://github.com/uport-project/daf/compare/v5.7.0...v6.0.0) (2020-05-29)

**Note:** Version bump only for package daf-libsodium

# [5.7.0](https://github.com/uport-project/daf/compare/v5.6.7...v5.7.0) (2020-05-29)

**Note:** Version bump only for package daf-libsodium

## [5.6.6](https://github.com/uport-project/daf/compare/v5.6.5...v5.6.6) (2020-05-26)

**Note:** Version bump only for package daf-libsodium

## [5.6.5](https://github.com/uport-project/daf/compare/v5.6.4...v5.6.5) (2020-05-25)

**Note:** Version bump only for package daf-libsodium

## [5.6.4](https://github.com/uport-project/daf/compare/v5.6.3...v5.6.4) (2020-05-22)

**Note:** Version bump only for package daf-libsodium

# [5.5.0](https://github.com/uport-project/daf/compare/v5.4.0...v5.5.0) (2020-05-13)

**Note:** Version bump only for package daf-libsodium

# [5.1.0](https://github.com/uport-project/daf/compare/v5.0.0...v5.1.0) (2020-05-06)

**Note:** Version bump only for package daf-libsodium

# [5.0.0](https://github.com/uport-project/daf/compare/v4.5.0...v5.0.0) (2020-05-05)

**Note:** Version bump only for package daf-libsodium

# [4.5.0](https://github.com/uport-project/daf/compare/v4.4.0...v4.5.0) (2020-05-05)

**Note:** Version bump only for package daf-libsodium

# [4.4.0](https://github.com/uport-project/daf/compare/v4.3.0...v4.4.0) (2020-04-29)

### Features

- Encrypting private keys with SecretBox ([8833931](https://github.com/uport-project/daf/commit/883393192cc830534cfec892b4ce271a09bff99d))

# [4.3.0](https://github.com/uport-project/daf/compare/v4.2.1...v4.3.0) (2020-04-28)

**Note:** Version bump only for package daf-libsodium

# [4.2.0](https://github.com/uport-project/daf/compare/v4.1.0...v4.2.0) (2020-04-24)

**Note:** Version bump only for package daf-libsodium

# [4.1.0](https://github.com/uport-project/daf/compare/v4.0.0...v4.1.0) (2020-04-23)

## [3.4.3](https://github.com/uport-project/daf/compare/v4.0.0-beta.42...v3.4.3) (2020-04-10)

### Bug Fixes

- **deps:** enable verification of ES256K signatures with default did:ethr: docs ([2e1bd33](https://github.com/uport-project/daf/commit/2e1bd331c3fc054f86380d977a78ec2305029a8e))

## [3.4.2](https://github.com/uport-project/daf/compare/v3.4.1...v3.4.2) (2020-03-23)

# [4.0.0](https://github.com/uport-project/daf/compare/v4.0.0-beta.48...v4.0.0) (2020-04-22)

## [3.4.3](https://github.com/uport-project/daf/compare/v3.4.2...v3.4.3) (2020-04-10)

### Bug Fixes

- **deps:** enable verification of ES256K signatures with default did:ethr: docs ([2e1bd33](https://github.com/uport-project/daf/commit/2e1bd331c3fc054f86380d977a78ec2305029a8e))

## [3.4.2](https://github.com/uport-project/daf/compare/v3.4.1...v3.4.2) (2020-03-23)

**Note:** Version bump only for package daf-libsodium

# [3.4.0](https://github.com/uport-project/daf/compare/v3.3.0...v3.4.0) (2020-03-19)

**Note:** Version bump only for package daf-libsodium

# [4.0.0-beta.48](https://github.com/uport-project/daf/compare/v4.0.0-beta.47...v4.0.0-beta.48) (2020-04-22)

**Note:** Version bump only for package daf-libsodium

# [4.0.0-beta.47](https://github.com/uport-project/daf/compare/v4.0.0-beta.46...v4.0.0-beta.47) (2020-04-17)

**Note:** Version bump only for package daf-libsodium

# [4.0.0-beta.46](https://github.com/uport-project/daf/compare/v4.0.0-beta.45...v4.0.0-beta.46) (2020-04-17)

**Note:** Version bump only for package daf-libsodium

# [4.0.0-beta.45](https://github.com/uport-project/daf/compare/v4.0.0-beta.44...v4.0.0-beta.45) (2020-04-16)

**Note:** Version bump only for package daf-libsodium

# [4.0.0-beta.44](https://github.com/uport-project/daf/compare/v4.0.0-beta.43...v4.0.0-beta.44) (2020-04-15)

**Note:** Version bump only for package daf-libsodium

# [4.0.0-beta.43](https://github.com/uport-project/daf/compare/v4.0.0-beta.42...v4.0.0-beta.43) (2020-04-15)

**Note:** Version bump only for package daf-libsodium

# [4.0.0-beta.42](https://github.com/uport-project/daf/compare/v3.4.0...v4.0.0-beta.42) (2020-04-09)

**Note:** Version bump only for package daf-libsodium

# [3.4.0](https://github.com/uport-project/daf/compare/v3.3.0...v3.4.0) (2020-03-19)

### Features

- Ethr-did export/import ([0f8ab11](https://github.com/uport-project/daf/commit/0f8ab111a5e96d3a687b318605ab2ff607c7bf23)), closes [#105](https://github.com/uport-project/daf/issues/105)

# [3.3.0](https://github.com/uport-project/daf/compare/v3.2.0...v3.3.0) (2020-03-19)

**Note:** Version bump only for package daf-libsodium

# [3.2.0](https://github.com/uport-project/daf/compare/v3.1.4...v3.2.0) (2020-03-19)

**Note:** Version bump only for package daf-libsodium

## [3.1.3](https://github.com/uport-project/daf/compare/v3.1.2...v3.1.3) (2020-03-18)

**Note:** Version bump only for package daf-libsodium

## [3.0.2](https://github.com/uport-project/daf/compare/v3.0.1...v3.0.2) (2020-03-16)

**Note:** Version bump only for package daf-libsodium

## [3.0.1](https://github.com/uport-project/daf/compare/v3.0.0...v3.0.1) (2020-03-16)

**Note:** Version bump only for package daf-libsodium

# [3.0.0](https://github.com/uport-project/daf/compare/v2.5.0...v3.0.0) (2020-03-13)

**Note:** Version bump only for package daf-libsodium

# [2.5.0](https://github.com/uport-project/daf/compare/v2.4.1...v2.5.0) (2020-03-13)

**Note:** Version bump only for package daf-libsodium

## [2.3.19](https://github.com/uport-project/daf/compare/v2.3.18...v2.3.19) (2020-03-11)

**Note:** Version bump only for package daf-libsodium

## [2.3.18](https://github.com/uport-project/daf/compare/v2.3.17...v2.3.18) (2020-03-10)

**Note:** Version bump only for package daf-libsodium

## [2.3.16](https://github.com/uport-project/daf/compare/v2.3.15...v2.3.16) (2020-03-03)

**Note:** Version bump only for package daf-libsodium

## [2.3.15](https://github.com/uport-project/daf/compare/v2.3.14...v2.3.15) (2020-03-02)

### Bug Fixes

- Typescript types ([72c1899](https://github.com/uport-project/daf/commit/72c18993ddba6a7a75ae8397e6549cdd29dccb31))

## [2.3.10](https://github.com/uport-project/daf/compare/v2.3.9...v2.3.10) (2020-02-25)

**Note:** Version bump only for package daf-libsodium

## [2.3.8](https://github.com/uport-project/daf/compare/v2.3.7...v2.3.8) (2020-02-19)

### Bug Fixes

- Await in IdentityProvider and KMS ([a5b36d9](https://github.com/uport-project/daf/commit/a5b36d9b96cc1ee6a2e0c1cb95f4697c39b1586b))

# [2.1.0](https://github.com/uport-project/daf/compare/v2.0.0...v2.1.0) (2020-02-17)

**Note:** Version bump only for package daf-libsodium

# [2.0.0](https://github.com/uport-project/daf/compare/v1.5.1...v2.0.0) (2020-02-17)

### Features

- New DID management interfaces ([9599e2a](https://github.com/uport-project/daf/commit/9599e2a5e75f0d6d0adaa5229e9653c8c3d9fa80))

### BREAKING CHANGES

- new interfaces for IdentityManager
  AbstractIdentityController AbstractIdentityProvider
  AbstractIdentityStore AbstractIdentity
  AbstractKeyManagementSystem AbstractKey AbstractKeyStore
