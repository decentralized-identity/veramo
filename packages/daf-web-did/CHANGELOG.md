# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [7.0.0](https://github.com/uport-project/daf/compare/v6.4.1...v7.0.0) (2020-12-17)


### Code Refactoring

* Rename Identity to Identifier ([#308](https://github.com/uport-project/daf/issues/308)) ([7812e51](https://github.com/uport-project/daf/commit/7812e51ee250265bcc308e7fd4db1ee8b2e408a4))
* **daf-cli:** Refactor CLI command palette ([#304](https://github.com/uport-project/daf/issues/304)) ([a5a0670](https://github.com/uport-project/daf/commit/a5a0670f5162e3f8753fa338ed00e64397c8acc0)), closes [#264](https://github.com/uport-project/daf/issues/264)


### Features

* Generate plugin schema ([#277](https://github.com/uport-project/daf/issues/277)) ([c90473a](https://github.com/uport-project/daf/commit/c90473a67731eb0cfcaf545afe0d64dfee77809c))
* Generating plugin schemas ([d4450cd](https://github.com/uport-project/daf/commit/d4450cd30e27ebc8bf961400b871757662e202c3))
* Method identityManagerGetOrCreateIdentity ([0155389](https://github.com/uport-project/daf/commit/0155389bf8ad3cfe6f4802d1ac5ce655321423c6))
* Validating returnType ([c7d1ef3](https://github.com/uport-project/daf/commit/c7d1ef3bd77dd4a77cf9dcfa32a2ed8b47fe04e0))


### BREAKING CHANGES

* This rename affects almost all the Identity management API
Please look for `IDIDManager.ts` in `daf-core/src/types` to see the new method names.
Functionality is the same but some renaming is required if already in use.

* refactor: Rename Identity to Identifier
* fix: Integration tests
* refactor: WebDIDProvider
* refactor: EthrDIDProvider
* refactor: DIDStore
* refactor: Resolver
* refactor: DidManagerFind
* refactor: DidManagerFind
* refactor: DidManagerGet
* refactor: DidManagerCreate
* refactor: DidManagerGetOrCreate
* refactor: DidManagerImport
* refactor: DidManagerDelete
* refactor: KeyManager
* refactor: DefaultDID
* refactor: IDIDManager
* refactor: IDIDManager.ts
* **daf-cli:** This refactor changes the CLI list of commands. Run `daf --help` to get the latest options.
The same actions are possible, but under different (simpler) names and subcommands.





## [6.4.1](https://github.com/uport-project/daf/compare/v6.4.0...v6.4.1) (2020-11-13)

**Note:** Version bump only for package daf-web-did





# [6.3.0](https://github.com/uport-project/daf/compare/v6.1.1...v6.3.0) (2020-09-04)

### Features

- **release:** Fix package descriptions and trigger new minor release ([#233](https://github.com/uport-project/daf/issues/233)) ([e67f4da](https://github.com/uport-project/daf/commit/e67f4da055d1f0b1b0ba4205726b79979d234a06))
- **release:** Trigger a new minor release ([#234](https://github.com/uport-project/daf/issues/234)) ([7c905e1](https://github.com/uport-project/daf/commit/7c905e1ea7c4851f7f06e87e06efe34d4eac7b0f))

# [6.2.0](https://github.com/uport-project/daf/compare/v6.1.2...v6.2.0) (2020-09-04)

### Features

- **release:** Fix package descriptions and trigger new minor release ([#233](https://github.com/uport-project/daf/issues/233)) ([e67f4da](https://github.com/uport-project/daf/commit/e67f4da055d1f0b1b0ba4205726b79979d234a06))

## [6.1.2](https://github.com/uport-project/daf/compare/v6.1.1...v6.1.2) (2020-09-03)

**Note:** Version bump only for package daf-web-did

## [6.1.1](https://github.com/uport-project/daf/compare/v6.1.0...v6.1.1) (2020-07-06)

**Note:** Version bump only for package daf-web-did

# [6.0.0](https://github.com/uport-project/daf/compare/v5.7.0...v6.0.0) (2020-05-29)

**Note:** Version bump only for package daf-web-did

# [5.7.0](https://github.com/uport-project/daf/compare/v5.6.7...v5.7.0) (2020-05-29)

### Bug Fixes

- IdentityController for web-did ([a829991](https://github.com/uport-project/daf/commit/a829991f0d16b424e756684cbca8d159b8195cac))

### Features

- Identity provider for did:web ([9b20fb1](https://github.com/uport-project/daf/commit/9b20fb13da21865d50f6e0680e0d7da040a3d75c))
