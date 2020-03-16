# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://github.com/uport-project/daf/compare/v3.0.0...v3.0.1) (2020-03-16)

**Note:** Version bump only for package daf-core





# [3.0.0](https://github.com/uport-project/daf/compare/v2.5.0...v3.0.0) (2020-03-13)


### Bug Fixes

* Building ([60f3777](https://github.com/uport-project/daf/commit/60f3777510514051e75822ae8f350e28e1f64e54))
* Claim hash ([d00b9c6](https://github.com/uport-project/daf/commit/d00b9c6ed1fed1c76cb7ed4939e2f017979360a2))
* Deduplicating messages ([eda582b](https://github.com/uport-project/daf/commit/eda582b32923d6cd251fc82023dc18b361122c5e))
* Examples ([e4581e1](https://github.com/uport-project/daf/commit/e4581e148ee1fdf19efd4f3506a6eb8e2a6789f9))
* Initializing DB before any action ([7b5959e](https://github.com/uport-project/daf/commit/7b5959e9ea8c4e5a93e8aeeb98baf020c0388a9c))
* Latest message timestamps ([048974b](https://github.com/uport-project/daf/commit/048974b7016a1deb990aacf2b84a09a172bd3f6d))
* Removing context entities ([1a5c4c9](https://github.com/uport-project/daf/commit/1a5c4c9827fdc98338395311d7b176ebd09332f3))
* Removing MessageMetaData entity ([353449c](https://github.com/uport-project/daf/commit/353449c5a2f9a9c0919b4e38a44012fdf98ec8a9))
* VC / VP hash ([d4fa78f](https://github.com/uport-project/daf/commit/d4fa78ff0d03d64db6806fde9fdd6c7201ce1969))


### Features

* Data-store upgrade ([c4c0810](https://github.com/uport-project/daf/commit/c4c081023fb331bf7cb8c19ca2e5c79e8db6b506))
* Entities ([7f1c85f](https://github.com/uport-project/daf/commit/7f1c85f84c64d49435ee1c8049b00559f3863442))
* IdentityStore and KeyStore in daf-core ([238539c](https://github.com/uport-project/daf/commit/238539c59c328baf4a4f84c0fe86520bfefdd680))
* IdentityStore docs ([190b505](https://github.com/uport-project/daf/commit/190b5052a800c9893c27fe57b89c50cce9fc9343))
* TypeORM wip ([27e4ab2](https://github.com/uport-project/daf/commit/27e4ab2676042cea96370ba31d5dd7fc1c8cceb5))
* Updated entities ([00db341](https://github.com/uport-project/daf/commit/00db341ca10ae08d1afa666b880ffd066b5b6bbc))
* Updating examples to the new API ([13c7e3b](https://github.com/uport-project/daf/commit/13c7e3b625ed1924f2ff9346ff0ab40337fcc8d4))


### BREAKING CHANGES

* Introducing TypeORM - support for more databases
Deprecating some packages.





# [2.5.0](https://github.com/uport-project/daf/compare/v2.4.1...v2.5.0) (2020-03-13)

### Bug Fixes

- GQL return raw while validating message ([53573bc](https://github.com/uport-project/daf/commit/53573bc07cbaabc92c34baaa3096acd279aa985f))

## [2.3.19](https://github.com/uport-project/daf/compare/v2.3.18...v2.3.19) (2020-03-11)

### Bug Fixes

- GQL newMessage data field ([48181b9](https://github.com/uport-project/daf/commit/48181b93a5504e82373894598a81149f3c529a69))

## [2.3.18](https://github.com/uport-project/daf/compare/v2.3.17...v2.3.18) (2020-03-10)

**Note:** Version bump only for package daf-core

## [2.3.16](https://github.com/uport-project/daf/compare/v2.3.15...v2.3.16) (2020-03-03)

**Note:** Version bump only for package daf-core

## [2.3.15](https://github.com/uport-project/daf/compare/v2.3.14...v2.3.15) (2020-03-02)

### Bug Fixes

- Typescript types ([72c1899](https://github.com/uport-project/daf/commit/72c18993ddba6a7a75ae8397e6549cdd29dccb31))

## [2.3.10](https://github.com/uport-project/daf/compare/v2.3.9...v2.3.10) (2020-02-25)

**Note:** Version bump only for package daf-core

# [2.1.0](https://github.com/uport-project/daf/compare/v2.0.0...v2.1.0) (2020-02-17)

### Features

- Version bump ([4fd60a9](https://github.com/uport-project/daf/commit/4fd60a9a73130ee5e11ac9bf87b0c7864458c70b))

# [2.0.0](https://github.com/uport-project/daf/compare/v1.5.1...v2.0.0) (2020-02-17)

### Bug Fixes

- Removing daf-sodium-fs and encryptionmanager ([1ea064d](https://github.com/uport-project/daf/commit/1ea064dabf8d7875c060411283d2d80c04d9c801))

### Features

- Breaking. New did management interfaces ([c384159](https://github.com/uport-project/daf/commit/c3841591189dc307ba281a72186dbb878d9aa5be))
- Daf-ethr-did-fs using experimental interface ([cecffd8](https://github.com/uport-project/daf/commit/cecffd8de4fe161abe0013ab7b715860a591c365))
- FS IdentityStore ([a2521e0](https://github.com/uport-project/daf/commit/a2521e0e36a9531478910815d17409bc749658c2))
- FS KMS ([1bcf4c1](https://github.com/uport-project/daf/commit/1bcf4c1ecc29c674c9525946eb5b9bacecd2c550))
- IdentityController, KeyStore ([e86fec4](https://github.com/uport-project/daf/commit/e86fec425aba3c80dc49520f205e9317deea43bc))
- Moving DID Doc management to the provider ([b6bd930](https://github.com/uport-project/daf/commit/b6bd9300464923fac6c464d0997216f2cc5faec8))
- New Identity TS and GraphQL interfaces ([3f8ff1c](https://github.com/uport-project/daf/commit/3f8ff1c0c8edd9f1f8a25343a265b78eeecb32e3))
- Using DIDComm for encryption ([02fefa9](https://github.com/uport-project/daf/commit/02fefa9930961618d723ed74d244de932e93ce76))

## [1.4.1](https://github.com/uport-project/daf/compare/v1.4.0...v1.4.1) (2020-01-14)

### Bug Fixes

- Adding id to serviceMessagesSince ([45bb45b](https://github.com/uport-project/daf/commit/45bb45b8b59034e6f793d486e06efc998c53584e))

# [1.4.0](https://github.com/uport-project/daf/compare/v1.3.7...v1.4.0) (2020-01-14)

### Features

- GQL query to get latest service messages ([8061fbe](https://github.com/uport-project/daf/commit/8061fbed8fc3626b165b8c03dee79901682f60a2))

## [1.3.3](https://github.com/uport-project/daf/compare/v1.3.2...v1.3.3) (2019-12-20)

**Note:** Version bump only for package daf-core

## [1.3.2](https://github.com/uport-project/daf/compare/v1.3.1...v1.3.2) (2019-12-20)

### Bug Fixes

- ValidateMessage can throw an error ([d00dcdd](https://github.com/uport-project/daf/commit/d00dcddaf69eae26445f7b2ac1fe79b0027e297c)), closes [#10](https://github.com/uport-project/daf/issues/10)

# [1.2.0](https://github.com/uport-project/daf/compare/v1.1.1...v1.2.0) (2019-12-16)

**Note:** Version bump only for package daf-core

## [1.1.1](https://github.com/uport-project/daf/compare/v1.1.0...v1.1.1) (2019-12-16)

### Bug Fixes

- Identity.isManaged ([38ad11e](https://github.com/uport-project/daf/commit/38ad11ec9abf74143acda726725820c0d6e29e14))

# [1.1.0](https://github.com/uport-project/daf/compare/v0.10.3...v1.1.0) (2019-12-16)

**Note:** Version bump only for package daf-core

## [0.10.3](https://github.com/uport-project/daf/compare/v0.10.2...v0.10.3) (2019-12-12)

### Bug Fixes

- EventEmmiter ([dc52b55](https://github.com/uport-project/daf/commit/dc52b55aad6c612266ce136636f6aa65e524b59b))
- ServiceManager and AbstractServiceController ([284badc](https://github.com/uport-project/daf/commit/284badc52b420c637d0c7bc6823b71f1ea5c449d))
- Unifying debug messages ([efb4f3b](https://github.com/uport-project/daf/commit/efb4f3bf9f6d3f0d412eb80da7bb4ae92ce8ca72))

# [0.10.0](https://github.com/uport-project/daf/compare/v0.9.0...v0.10.0) (2019-12-10)

### Bug Fixes

- Renaming to sender and receiver ([bf33a2d](https://github.com/uport-project/daf/commit/bf33a2de268cf07b06faa04283ec066573c37ffc))
- Typo ([0a47c70](https://github.com/uport-project/daf/commit/0a47c70fac8c9624c73343c8067d11fab3cd2c9d))

### Features

- Data deduplication ([c5c10b1](https://github.com/uport-project/daf/commit/c5c10b17eebd1d6f82a43f0d5cc46da9b9270c3e))
- Message object with validation ([8bf6a9d](https://github.com/uport-project/daf/commit/8bf6a9d47e73d6e2be9003854718b67f59c636dd))

# [0.9.0](https://github.com/uport-project/daf/compare/v0.8.0...v0.9.0) (2019-12-05)

### Features

- Using EventEmitter instead of pubsub-js ([5d50acf](https://github.com/uport-project/daf/commit/5d50acf0c9fbdb9ea45f0e90a55b64a1a1e5dfde))

# [0.8.0](https://github.com/uport-project/daf/compare/v0.7.8...v0.8.0) (2019-12-04)

**Note:** Version bump only for package daf-core

# [0.7.0](https://github.com/uport-project/daf/compare/v0.6.1...v0.7.0) (2019-11-29)

### Bug Fixes

- Express example ([1c33310](https://github.com/uport-project/daf/commit/1c333108accc7feaaaba5a7864db12efac626881))

### Features

- Selective Disclosure Request ([9afe0c5](https://github.com/uport-project/daf/commit/9afe0c5a2fae7e3f778fe99ff4f88f44f61d3b94))

# [0.6.0](https://github.com/uport-project/daf/compare/v0.5.2...v0.6.0) (2019-11-27)

**Note:** Version bump only for package daf-core

## [0.5.1](https://github.com/uport-project/daf/compare/v0.5.0...v0.5.1) (2019-11-26)

**Note:** Version bump only for package daf-core

# [0.5.0](https://github.com/uport-project/daf/compare/v0.4.0...v0.5.0) (2019-11-26)

**Note:** Version bump only for package daf-core

# [0.4.0](https://github.com/uport-project/daf/compare/v0.3.0...v0.4.0) (2019-11-25)

**Note:** Version bump only for package daf-core

# [0.3.0](https://github.com/uport-project/daf/compare/v0.2.0...v0.3.0) (2019-11-24)

**Note:** Version bump only for package daf-core

# [0.2.0](https://github.com/uport-project/daf/compare/v0.1.0...v0.2.0) (2019-11-23)

**Note:** Version bump only for package daf-core

# [0.1.0](https://github.com/uport-project/daf/compare/v0.0.26...v0.1.0) (2019-11-22)

**Note:** Version bump only for package daf-core

## [0.0.26](https://github.com/uport-project/daf/compare/v0.0.25...v0.0.26) (2019-11-22)

### Bug Fixes

- Wait for messages to be validated ([717b285](https://github.com/uport-project/daf/commit/717b2858b2c96efdfb39f85297f4026585b366be))

## [0.0.25](https://github.com/uport-project/daf/compare/v0.0.24...v0.0.25) (2019-11-21)

### Bug Fixes

- Moved did-resolver to devDeps ([3ae8c1c](https://github.com/uport-project/daf/commit/3ae8c1cec0c0d0b827d627cc181a85935fae2e88))

## [0.0.24](https://github.com/uport-project/daf/compare/v0.0.23...v0.0.24) (2019-11-19)

**Note:** Version bump only for package daf-core
