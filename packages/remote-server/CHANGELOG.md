# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.3.0](https://github.com/uport-project/veramo/compare/v4.2.0...v4.3.0) (2023-01-27)

**Note:** Version bump only for package @veramo/remote-server





# [4.2.0](https://github.com/uport-project/veramo/compare/v4.1.2...v4.2.0) (2022-12-05)


### Bug Fixes

* **deps:** bump dependencies ([701b8ed](https://github.com/uport-project/veramo/commit/701b8edf981ea11c7ddb6a81d2817dbbdbb022f3))





## [4.1.1](https://github.com/uport-project/veramo/compare/v4.1.0...v4.1.1) (2022-11-01)

**Note:** Version bump only for package @veramo/remote-server





# [4.1.0](https://github.com/uport-project/veramo/compare/v4.0.2...v4.1.0) (2022-10-31)


### Bug Fixes

* **deps:** Update dependency ethr-did-resolver to v7 ([#1038](https://github.com/uport-project/veramo/issues/1038)) ([d421c0f](https://github.com/uport-project/veramo/commit/d421c0f9f5934829df2930e58e98bcfce813ce84))


### Features

* add support for NIST Secp256r1 keys and ES256 signatures ([#1039](https://github.com/uport-project/veramo/issues/1039)) ([61eb369](https://github.com/uport-project/veramo/commit/61eb369cfcde7372babf3f68fb65ea2055b5bf70))





# [4.0.0](https://github.com/uport-project/veramo/compare/v3.1.5...v4.0.0) (2022-09-22)


### Bug Fixes

* **deps:** update all non-major dependencies ([b537187](https://github.com/uport-project/veramo/commit/b537187ba04ba41cd45c18dfb58c92725b65b084))
* **did-resolver:** use interface `Resolvable` instead of the `Resolver` class ([9c2e59f](https://github.com/uport-project/veramo/commit/9c2e59f3f23f808511c6c0e8e440b4d53ba5cb00))
* **remote-server:** api-key-auth ([#772](https://github.com/uport-project/veramo/issues/772)) ([cbe6f35](https://github.com/uport-project/veramo/commit/cbe6f35e31c3a9e062d7f9c593253cb53b988e46)), closes [#771](https://github.com/uport-project/veramo/issues/771)
* **remote-server:** web-did-doc-router options ([#777](https://github.com/uport-project/veramo/issues/777)) ([cc1ec7a](https://github.com/uport-project/veramo/commit/cc1ec7a0c510fcc2329bffcb33ee91fe8739ae5a))
* update and fix inline documentation of all exported types ([#921](https://github.com/uport-project/veramo/issues/921)) ([63e64e0](https://github.com/uport-project/veramo/commit/63e64e0e2693808c4704dca8cc511dc0bab3f3b1))


### Features

* add key type definitions: 'Bls12381G1Key2020' and 'Bls12381G2Key2020' ([#839](https://github.com/uport-project/veramo/issues/839)) ([0f0f517](https://github.com/uport-project/veramo/commit/0f0f517d97230fd5334d604d4f20d575a14f8670))
* add support for serviceEndpoint property as defined in latest DID Spec ([#988](https://github.com/uport-project/veramo/issues/988)) ([9bed70b](https://github.com/uport-project/veramo/commit/9bed70ba658aed34a97944e0dee27bca6c81d700))
* **credential-ld:** add support for browser environments ([#916](https://github.com/uport-project/veramo/issues/916)) ([435e4d2](https://github.com/uport-project/veramo/commit/435e4d260b1774f96b182c1a75ab2f1c993f2291))


### BREAKING CHANGES

* the `did-resolver` and connected libraries change the data-type for `ServiceEndpoint` to `Service` and the previous semantic has changed. Services can have multiple endpoints, not just a single string.





## [3.1.3](https://github.com/uport-project/veramo/compare/v3.1.2...v3.1.3) (2022-06-01)

**Note:** Version bump only for package @veramo/remote-server





## [3.1.2](https://github.com/uport-project/veramo/compare/v3.1.1...v3.1.2) (2022-05-30)


### Bug Fixes

* **remote-server:** fix error when resolving local did:web ([#905](https://github.com/uport-project/veramo/issues/905)) ([782f64a](https://github.com/uport-project/veramo/commit/782f64ace21c4710185fa80015b6435c8c37d088))





## [3.1.1](https://github.com/uport-project/veramo/compare/v3.1.0...v3.1.1) (2022-01-13)


### Bug Fixes

* **remote-server:** api-key-auth ([#772](https://github.com/uport-project/veramo/issues/772)) ([6d1916b](https://github.com/uport-project/veramo/commit/6d1916b52f23aa818e023c35e6324ec5153e1a5c)), closes [#771](https://github.com/uport-project/veramo/issues/771)
* **remote-server:** fix path for web-did-doc-router ([6bb1003](https://github.com/uport-project/veramo/commit/6bb10039434d45de3ffcc22bcfeadf796c774b08))





# [3.1.0](https://github.com/uport-project/veramo/compare/v3.0.0...v3.1.0) (2021-11-12)


### Bug Fixes

* **deps:** update dependency passport to ^0.5.0 ([a4dae24](https://github.com/uport-project/veramo/commit/a4dae24c8e8b2bf9e061e182076c1b89b71df306))


### Features

* **did-comm:** didcomm messaging using did:ethr ([#744](https://github.com/uport-project/veramo/issues/744)) ([1be5e04](https://github.com/uport-project/veramo/commit/1be5e04e09112c0823d776fe2d55117d71a7b448)), closes [#743](https://github.com/uport-project/veramo/issues/743)
* **remote-server:** add default services option for WebDidDocRouter ([#715](https://github.com/uport-project/veramo/issues/715)) ([cfa6431](https://github.com/uport-project/veramo/commit/cfa64319a6ca27ec29330ea743104d0fa1a7eba0))
* **remote-server:** add MessagingRouter `save` option ([#713](https://github.com/uport-project/veramo/issues/713)) ([0ca9b44](https://github.com/uport-project/veramo/commit/0ca9b448db8b467630a14bc64343082af29bc725))





# [3.0.0](https://github.com/uport-project/veramo/compare/v2.1.3...v3.0.0) (2021-09-20)

**Note:** Version bump only for package @veramo/remote-server





# [2.1.0](https://github.com/uport-project/veramo/compare/v2.0.1...v2.1.0) (2021-08-11)

**Note:** Version bump only for package @veramo/remote-server





# [2.0.0](https://github.com/uport-project/veramo/compare/v1.2.2...v2.0.0) (2021-07-14)


### Bug Fixes

* **remote-server:** create an Ed25519 key for the default did:web ([a2f7f8c](https://github.com/uport-project/veramo/commit/a2f7f8c3fc6ab6cc276f6853104386bf9d923424))
* **remote-server:** list DIDCommMessaging service entry by default for did:web ([339201a](https://github.com/uport-project/veramo/commit/339201a30f2f95f9b92251f233fb426d8290274f))


### Features

* add support for did-comm over simple HTTP-based transports ([#610](https://github.com/uport-project/veramo/issues/610)) ([78836a4](https://github.com/uport-project/veramo/commit/78836a46d3ce71b568acaa98558b64f9c2b98167)), closes [#552](https://github.com/uport-project/veramo/issues/552) [#469](https://github.com/uport-project/veramo/issues/469)
* **remote-server:** express keys properly in did:web doc ([c33e39e](https://github.com/uport-project/veramo/commit/c33e39e6e33f5976aa4e5ff27ed3675b22113119)), closes [#618](https://github.com/uport-project/veramo/issues/618)





# [1.2.0](https://github.com/uport-project/veramo/compare/v1.1.2...v1.2.0) (2021-04-27)


### Bug Fixes

* **deps:** update all non-major dependencies ([#462](https://github.com/uport-project/veramo/issues/462)) ([4a2b206](https://github.com/uport-project/veramo/commit/4a2b20633810b45a155bf2149cbff57d157bda3c))
* **remote-server:** get alias for request ([#455](https://github.com/uport-project/veramo/issues/455)) ([6ef7e3a](https://github.com/uport-project/veramo/commit/6ef7e3a8b45e5b25961cdadfd6f4026372e9d73f))
* use URI encoded host in web-did-doc-router ([#384](https://github.com/uport-project/veramo/issues/384)) ([37186d5](https://github.com/uport-project/veramo/commit/37186d5cbdbbdbdccf0b6b9c56b1f78a482d1193)), closes [#383](https://github.com/uport-project/veramo/issues/383)


### Features

* adapt to did core spec ([#430](https://github.com/uport-project/veramo/issues/430)) ([9712db0](https://github.com/uport-project/veramo/commit/9712db0eea1a3f48cf0665d66ae715ea0c23cd4a)), closes [#418](https://github.com/uport-project/veramo/issues/418) [#428](https://github.com/uport-project/veramo/issues/428) [#417](https://github.com/uport-project/veramo/issues/417) [#416](https://github.com/uport-project/veramo/issues/416) [#412](https://github.com/uport-project/veramo/issues/412) [#397](https://github.com/uport-project/veramo/issues/397) [#384](https://github.com/uport-project/veramo/issues/384) [#394](https://github.com/uport-project/veramo/issues/394)





# [1.1.0](https://github.com/uport-project/veramo/compare/v1.0.1...v1.1.0) (2021-01-26)

**Note:** Version bump only for package @veramo/remote-server





## 1.0.1 (2020-12-18)

**Note:** Version bump only for package @veramo/remote-server
