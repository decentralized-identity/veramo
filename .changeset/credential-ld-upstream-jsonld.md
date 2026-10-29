---
'@veramo/credential-ld': major
'@veramo/cli': patch
---

`@veramo/credential-ld` now runs on upstream `jsonld@9` and `jsonld-signatures@11`, with no forked dependencies:

- All four suites (Ed25519Signature2018, Ed25519Signature2020, JsonWebSignature2020, EcdsaSecp256k1RecoverySignature2020) are implemented in this package on top of `jsonld-signatures`' `LinkedDataSignature`, with `@noble/curves` / `@noble/hashes` for the cryptography. `@digitalcredentials/*`, `@transmute/*`, the `lds-ecdsa-secp256k1-recovery2020` git fork and `cross-fetch` are gone; remote contexts use the global `fetch`.
- The VC data model checks and the credential/presentation verification flow of `@digitalbazaar/vc@7` are implemented in this package, so `@digitalbazaar/vc` (and its `@digitalbazaar/credentials-context`, which uses `import.meta`) is not a dependency. `LdDefaultContexts` now also contains the credentials v2 and undefined-terms v2 contexts.
- Hashing is pure JS, so WebCrypto (`crypto.subtle`) is no longer needed.
- Proof formats are unchanged. Golden credentials and presentations issued by the previous version (all four suites, `did:key` / `did:pkh`) verify, and the same inputs produce byte-identical proofs, on Node, in the browser and on React Native (Hermes).
- The package works in a browser without Node polyfills. On React Native it needs only a `TextDecoder` polyfill (for `did-jwt`, like the rest of Veramo). See `packages/test-rn-app/README.md`.
- JsonWebSignature2020 verifies `JsonWebKey2020`, `Multikey`, `Ed25519VerificationKey2018`, `EcdsaSecp256k1VerificationKey2019` and `P256Key2021`/`P384Key2021`/`P521Key2021` keys with EdDSA, ES256K, ES256K-R, ES256, ES384 or ES512, as JWK, base58, hex or multibase. EcdsaSecp256k1RecoverySignature2020 also verifies against secp256k1 `Multikey` keys. Signing is unchanged (EdDSA for JsonWebSignature2020, `EcdsaSecp256k1RecoveryMethod2020` keys for EcdsaSecp256k1RecoverySignature2020).
- LD presentations drop the Veramo-only `verifier` field before signing, since no credentials context defines it (it was never part of the signed data). Use `domain` / `challenge` to bind an LD presentation to its audience.
- **Breaking:** canonicalization runs in JSON-LD safe mode. Signing or verifying a document with a term that no `@context` defines now throws, instead of silently leaving that term out of the signed data. Credentials with such terms that verified before will now fail to verify.
- **Breaking:** `credentialStatus.id` must now be a URI, like `issuer`, `credentialSubject.id` and `evidence` ids.
- The CLI's default config no longer references `@transmute/credentials-context`; `LdDefaultContexts` already contains the credentials v1 context.
- `verifyPresentation` returns `verified: false` with an `error` instead of rejecting when the presentation fails a data model check or no `challenge` is given. LD credential results no longer carry a placeholder `statusResult` (credential status is checked by `@veramo/credential-w3c`).
