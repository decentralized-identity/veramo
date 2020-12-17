# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [7.0.0](https://github.com/uport-project/daf/compare/v6.4.1...v7.0.0) (2020-12-17)


### Bug Fixes

* **daf-did-jwt:** Fix parsing of JWT with missing `typ` in header ([#293](https://github.com/uport-project/daf/issues/293)) ([48e4c60](https://github.com/uport-project/daf/commit/48e4c607f78ac19be2ba83291cb68f414edb5b6b)), closes [#291](https://github.com/uport-project/daf/issues/291)
* **daf-did-jwt:** Fix verification of EdDSA JWTs ([#289](https://github.com/uport-project/daf/issues/289)) ([b97f2a3](https://github.com/uport-project/daf/commit/b97f2a3bc6bfc5f9df143e7e79840e568d6a9606)), closes [#288](https://github.com/uport-project/daf/issues/288)
* **message-handler:** Rewire promise rejections as `Error` objects ([#300](https://github.com/uport-project/daf/issues/300)) ([04446d4](https://github.com/uport-project/daf/commit/04446d4e2d2dba8ff2ae5695014686ef49891804)), closes [#294](https://github.com/uport-project/daf/issues/294)
* Test daf-did-jwt ([d6383c7](https://github.com/uport-project/daf/commit/d6383c739d40edb55055b13ea9e931b440b629e4))


### Code Refactoring

* **daf-cli:** Refactor CLI command palette ([#304](https://github.com/uport-project/daf/issues/304)) ([a5a0670](https://github.com/uport-project/daf/commit/a5a0670f5162e3f8753fa338ed00e64397c8acc0)), closes [#264](https://github.com/uport-project/daf/issues/264)
* Refactor and add inline documentation to daf-w3c package ([f0e2cb9](https://github.com/uport-project/daf/commit/f0e2cb9748dc04b0d46ac1d80bac9a0b7f7546cd))


### Features

* Add event system to agent ([#262](https://github.com/uport-project/daf/issues/262)) ([9a6747e](https://github.com/uport-project/daf/commit/9a6747e84037613d396e14a6f68cb2de8275ddca))
* Generate plugin schema ([#277](https://github.com/uport-project/daf/issues/277)) ([c90473a](https://github.com/uport-project/daf/commit/c90473a67731eb0cfcaf545afe0d64dfee77809c))
* Generating plugin schemas ([d4450cd](https://github.com/uport-project/daf/commit/d4450cd30e27ebc8bf961400b871757662e202c3))
* Removing GraphQL support ([3646aab](https://github.com/uport-project/daf/commit/3646aaba6bc72db933ceb7ddb4250bf4457902e3))


### BREAKING CHANGES

* **daf-cli:** This refactor changes the CLI list of commands. Run `daf --help` to get the latest options.
The same actions are possible, but under different (simpler) names and subcommands.
* the `IW3c` type and `W3c` class have been renamed to
`ICredentialIssuer` and `CredentialIssuer`

fix(deps): update `did-resolver` and `did-jwt` libs for all packages to maintain type consistency





## [6.4.1](https://github.com/uport-project/daf/compare/v6.4.0...v6.4.1) (2020-11-13)

**Note:** Version bump only for package daf-did-jwt





# [6.3.0](https://github.com/uport-project/daf/compare/v6.1.1...v6.3.0) (2020-09-04)

### Features

- **release:** Fix package descriptions and trigger new minor release ([#233](https://github.com/uport-project/daf/issues/233)) ([e67f4da](https://github.com/uport-project/daf/commit/e67f4da055d1f0b1b0ba4205726b79979d234a06))
- **release:** Trigger a new minor release ([#234](https://github.com/uport-project/daf/issues/234)) ([7c905e1](https://github.com/uport-project/daf/commit/7c905e1ea7c4851f7f06e87e06efe34d4eac7b0f))

# [6.2.0](https://github.com/uport-project/daf/compare/v6.1.2...v6.2.0) (2020-09-04)

### Features

- **release:** Fix package descriptions and trigger new minor release ([#233](https://github.com/uport-project/daf/issues/233)) ([e67f4da](https://github.com/uport-project/daf/commit/e67f4da055d1f0b1b0ba4205726b79979d234a06))

## [6.1.2](https://github.com/uport-project/daf/compare/v6.1.1...v6.1.2) (2020-09-03)

**Note:** Version bump only for package daf-did-jwt

## [6.1.1](https://github.com/uport-project/daf/compare/v6.1.0...v6.1.1) (2020-07-06)

**Note:** Version bump only for package daf-did-jwt

# [6.0.0](https://github.com/uport-project/daf/compare/v5.7.0...v6.0.0) (2020-05-29)

**Note:** Version bump only for package daf-did-jwt

# [5.7.0](https://github.com/uport-project/daf/compare/v5.6.7...v5.7.0) (2020-05-29)

**Note:** Version bump only for package daf-did-jwt

## [5.6.6](https://github.com/uport-project/daf/compare/v5.6.5...v5.6.6) (2020-05-26)

**Note:** Version bump only for package daf-did-jwt

## [5.6.5](https://github.com/uport-project/daf/compare/v5.6.4...v5.6.5) (2020-05-25)

**Note:** Version bump only for package daf-did-jwt

## [5.6.4](https://github.com/uport-project/daf/compare/v5.6.3...v5.6.4) (2020-05-22)

**Note:** Version bump only for package daf-did-jwt

# [5.5.0](https://github.com/uport-project/daf/compare/v5.4.0...v5.5.0) (2020-05-13)

**Note:** Version bump only for package daf-did-jwt

# [5.1.0](https://github.com/uport-project/daf/compare/v5.0.0...v5.1.0) (2020-05-06)

**Note:** Version bump only for package daf-did-jwt

# [5.0.0](https://github.com/uport-project/daf/compare/v4.5.0...v5.0.0) (2020-05-05)

### Bug Fixes

- JWT verification with multiple audiences ([dbbb85f](https://github.com/uport-project/daf/commit/dbbb85f4261ac0d1a0f8080fcb734c66eb311696))

# [4.5.0](https://github.com/uport-project/daf/compare/v4.4.0...v4.5.0) (2020-05-05)

**Note:** Version bump only for package daf-did-jwt

# [4.4.0](https://github.com/uport-project/daf/compare/v4.3.0...v4.4.0) (2020-04-29)

**Note:** Version bump only for package daf-did-jwt

# [4.3.0](https://github.com/uport-project/daf/compare/v4.2.1...v4.3.0) (2020-04-28)

**Note:** Version bump only for package daf-did-jwt

# [4.2.0](https://github.com/uport-project/daf/compare/v4.1.0...v4.2.0) (2020-04-24)

**Note:** Version bump only for package daf-did-jwt

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

**Note:** Version bump only for package daf-did-jwt

# [3.4.0](https://github.com/uport-project/daf/compare/v3.3.0...v3.4.0) (2020-03-19)

**Note:** Version bump only for package daf-did-jwt

# [4.0.0-beta.48](https://github.com/uport-project/daf/compare/v4.0.0-beta.47...v4.0.0-beta.48) (2020-04-22)

**Note:** Version bump only for package daf-did-jwt

# [4.0.0-beta.47](https://github.com/uport-project/daf/compare/v4.0.0-beta.46...v4.0.0-beta.47) (2020-04-17)

**Note:** Version bump only for package daf-did-jwt

# [4.0.0-beta.46](https://github.com/uport-project/daf/compare/v4.0.0-beta.45...v4.0.0-beta.46) (2020-04-17)

**Note:** Version bump only for package daf-did-jwt

# [4.0.0-beta.45](https://github.com/uport-project/daf/compare/v4.0.0-beta.44...v4.0.0-beta.45) (2020-04-16)

**Note:** Version bump only for package daf-did-jwt

# [4.0.0-beta.44](https://github.com/uport-project/daf/compare/v4.0.0-beta.43...v4.0.0-beta.44) (2020-04-15)

**Note:** Version bump only for package daf-did-jwt

# [4.0.0-beta.43](https://github.com/uport-project/daf/compare/v4.0.0-beta.42...v4.0.0-beta.43) (2020-04-15)

**Note:** Version bump only for package daf-did-jwt

# [4.0.0-beta.42](https://github.com/uport-project/daf/compare/v3.4.0...v4.0.0-beta.42) (2020-04-09)

### Features

- Renamed Core to Agent ([f2c79b6](https://github.com/uport-project/daf/commit/f2c79b69c59929deaa67a55d5b5b0caf8523ff5b))
- Renaming MessageValidator to MessageHandler ([586b43c](https://github.com/uport-project/daf/commit/586b43c628028d5c6d6550a9e87877385fa8c4fc))

# [3.4.0](https://github.com/uport-project/daf/compare/v3.3.0...v3.4.0) (2020-03-19)

**Note:** Version bump only for package daf-did-jwt

# [3.3.0](https://github.com/uport-project/daf/compare/v3.2.0...v3.3.0) (2020-03-19)

**Note:** Version bump only for package daf-did-jwt

# [3.2.0](https://github.com/uport-project/daf/compare/v3.1.4...v3.2.0) (2020-03-19)

**Note:** Version bump only for package daf-did-jwt

## [3.1.3](https://github.com/uport-project/daf/compare/v3.1.2...v3.1.3) (2020-03-18)

**Note:** Version bump only for package daf-did-jwt

## [3.0.2](https://github.com/uport-project/daf/compare/v3.0.1...v3.0.2) (2020-03-16)

**Note:** Version bump only for package daf-did-jwt

## [3.0.1](https://github.com/uport-project/daf/compare/v3.0.0...v3.0.1) (2020-03-16)

**Note:** Version bump only for package daf-did-jwt

# [3.0.0](https://github.com/uport-project/daf/compare/v2.5.0...v3.0.0) (2020-03-13)

### Bug Fixes

- Building ([60f3777](https://github.com/uport-project/daf/commit/60f3777510514051e75822ae8f350e28e1f64e54))
- Removing MessageMetaData entity ([353449c](https://github.com/uport-project/daf/commit/353449c5a2f9a9c0919b4e38a44012fdf98ec8a9))

# [2.5.0](https://github.com/uport-project/daf/compare/v2.4.1...v2.5.0) (2020-03-13)

**Note:** Version bump only for package daf-did-jwt

## [2.3.19](https://github.com/uport-project/daf/compare/v2.3.18...v2.3.19) (2020-03-11)

**Note:** Version bump only for package daf-did-jwt

## [2.3.18](https://github.com/uport-project/daf/compare/v2.3.17...v2.3.18) (2020-03-10)

**Note:** Version bump only for package daf-did-jwt

## [2.3.16](https://github.com/uport-project/daf/compare/v2.3.15...v2.3.16) (2020-03-03)

**Note:** Version bump only for package daf-did-jwt

## [2.3.15](https://github.com/uport-project/daf/compare/v2.3.14...v2.3.15) (2020-03-02)

### Bug Fixes

- Typescript types ([72c1899](https://github.com/uport-project/daf/commit/72c18993ddba6a7a75ae8397e6549cdd29dccb31))

## [2.3.10](https://github.com/uport-project/daf/compare/v2.3.9...v2.3.10) (2020-02-25)

**Note:** Version bump only for package daf-did-jwt

# [2.1.0](https://github.com/uport-project/daf/compare/v2.0.0...v2.1.0) (2020-02-17)

**Note:** Version bump only for package daf-did-jwt

# [2.0.0](https://github.com/uport-project/daf/compare/v1.5.1...v2.0.0) (2020-02-17)

**Note:** Version bump only for package daf-did-jwt

## [1.4.1](https://github.com/uport-project/daf/compare/v1.4.0...v1.4.1) (2020-01-14)

**Note:** Version bump only for package daf-did-jwt

# [1.4.0](https://github.com/uport-project/daf/compare/v1.3.7...v1.4.0) (2020-01-14)

**Note:** Version bump only for package daf-did-jwt

## [1.3.5](https://github.com/uport-project/daf/compare/v1.3.4...v1.3.5) (2020-01-08)

**Note:** Version bump only for package daf-did-jwt

## [1.3.4](https://github.com/uport-project/daf/compare/v1.3.3...v1.3.4) (2020-01-03)

**Note:** Version bump only for package daf-did-jwt

## [1.3.3](https://github.com/uport-project/daf/compare/v1.3.2...v1.3.3) (2019-12-20)

**Note:** Version bump only for package daf-did-jwt

## [1.3.2](https://github.com/uport-project/daf/compare/v1.3.1...v1.3.2) (2019-12-20)

**Note:** Version bump only for package daf-did-jwt

# [1.2.0](https://github.com/uport-project/daf/compare/v1.1.1...v1.2.0) (2019-12-16)

**Note:** Version bump only for package daf-did-jwt

## [1.1.1](https://github.com/uport-project/daf/compare/v1.1.0...v1.1.1) (2019-12-16)

**Note:** Version bump only for package daf-did-jwt

# [1.1.0](https://github.com/uport-project/daf/compare/v0.10.3...v1.1.0) (2019-12-16)

**Note:** Version bump only for package daf-did-jwt

## [0.10.3](https://github.com/uport-project/daf/compare/v0.10.2...v0.10.3) (2019-12-12)

### Bug Fixes

- Unifying debug messages ([efb4f3b](https://github.com/uport-project/daf/commit/efb4f3bf9f6d3f0d412eb80da7bb4ae92ce8ca72))

# [0.10.0](https://github.com/uport-project/daf/compare/v0.9.0...v0.10.0) (2019-12-10)

### Features

- Message object with validation ([8bf6a9d](https://github.com/uport-project/daf/commit/8bf6a9d47e73d6e2be9003854718b67f59c636dd))

# [0.9.0](https://github.com/uport-project/daf/compare/v0.8.0...v0.9.0) (2019-12-05)

**Note:** Version bump only for package daf-did-jwt

# [0.8.0](https://github.com/uport-project/daf/compare/v0.7.8...v0.8.0) (2019-12-04)

**Note:** Version bump only for package daf-did-jwt

# [0.7.0](https://github.com/uport-project/daf/compare/v0.6.1...v0.7.0) (2019-11-29)

**Note:** Version bump only for package daf-did-jwt

# [0.6.0](https://github.com/uport-project/daf/compare/v0.5.2...v0.6.0) (2019-11-27)

**Note:** Version bump only for package daf-did-jwt

## [0.5.1](https://github.com/uport-project/daf/compare/v0.5.0...v0.5.1) (2019-11-26)

**Note:** Version bump only for package daf-did-jwt

# [0.5.0](https://github.com/uport-project/daf/compare/v0.4.0...v0.5.0) (2019-11-26)

**Note:** Version bump only for package daf-did-jwt

# [0.4.0](https://github.com/uport-project/daf/compare/v0.3.0...v0.4.0) (2019-11-25)

**Note:** Version bump only for package daf-did-jwt

# [0.3.0](https://github.com/uport-project/daf/compare/v0.2.0...v0.3.0) (2019-11-24)

**Note:** Version bump only for package daf-did-jwt

# [0.2.0](https://github.com/uport-project/daf/compare/v0.1.0...v0.2.0) (2019-11-23)

**Note:** Version bump only for package daf-did-jwt

# [0.1.0](https://github.com/uport-project/daf/compare/v0.0.26...v0.1.0) (2019-11-22)

**Note:** Version bump only for package daf-did-jwt

## [0.0.26](https://github.com/uport-project/daf/compare/v0.0.25...v0.0.26) (2019-11-22)

**Note:** Version bump only for package daf-did-jwt

## [0.0.25](https://github.com/uport-project/daf/compare/v0.0.24...v0.0.25) (2019-11-21)

**Note:** Version bump only for package daf-did-jwt

## [0.0.24](https://github.com/uport-project/daf/compare/v0.0.23...v0.0.24) (2019-11-19)

**Note:** Version bump only for package daf-did-jwt
