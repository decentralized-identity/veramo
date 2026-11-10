---
'@veramo/did-provider-ethr': major
---

`ethr-did-resolver` was bumped from 11 to 14, which changes the shape of resolved `did:ethr` documents:

- Ed25519 verification methods now use `Ed25519VerificationKey2020` with a `publicKeyMultibase` (Multikey) instead of `Ed25519VerificationKey2018` with `publicKeyHex` / `publicKeyBase58`. X25519 key agreement methods now use `X25519KeyAgreementKey2020` instead of `X25519KeyAgreementKey2019`, also with `publicKeyMultibase`.
- The `#controllerKey` entry and secp256k1 keys added as attributes now resolve to modern verification method formats (`publicKeyJwk` / `blockchainAccountId`) instead of `publicKeyHex`.
- A `registry` must now be configured for every `did:ethr` network. The upstream default registry address was removed, and resolution throws when none is set.
- Resolution failures caused by RPC connectivity, timeouts or non-archive nodes are now reported as `internalError` instead of `notFound`. Malformed `versionId` / `versionTime` query parameters are rejected with `invalidOptions`.
- Network configuration can be inferred from known registry deployments, and resolver events are cached between resolutions.

`EthrDIDProvider` now uses `EthrDidController` from `ethr-did-resolver` instead of the separate `ethr-did` package, which is no longer a dependency. Updating a `did:ethr` without a configured provider or registry throws an `invalid_setup` error. Ed25519 / X25519 keys can now be added to `did:ethr` identifiers. The `ethers` dependency is aligned to `^6.16` across the project.
