---
'@veramo/credential-ld': major
'@veramo/cli': patch
---

`@veramo/credential-ld` now runs on upstream `jsonld@9`, `jsonld-signatures@11` and `@digitalbazaar/vc@7`, with no forked dependencies:

- All four suites (Ed25519Signature2018, Ed25519Signature2020, JsonWebSignature2020, EcdsaSecp256k1RecoverySignature2020) are implemented in this package on top of `jsonld-signatures`' `LinkedDataSignature`, with `@noble/curves` / `@noble/hashes` for the cryptography. `@digitalcredentials/*`, `@transmute/*`, the `lds-ecdsa-secp256k1-recovery2020` git fork and `cross-fetch` are gone; remote contexts use the global `fetch`.
- Hashing is pure JS, so WebCrypto (`crypto.subtle`) is no longer needed.
- Proof formats are unchanged. Golden credentials and presentations issued by the previous version (all four suites, `did:key` / `did:pkh`) verify, and the same inputs produce byte-identical proofs, on Node, in the browser and on React Native (Hermes).
- The package works in a browser without Node polyfills. On React Native it needs a `TextDecoder` polyfill (for `did-jwt`, like the rest of Veramo) and an `import.meta` Babel transform (Expo: `unstable_transformImportMeta: true`) for `@digitalbazaar/credentials-context`. See `packages/test-rn-app/README.md`.
- JsonWebSignature2020 verifies `JsonWebKey2020`, `Ed25519VerificationKey2018`, `EcdsaSecp256k1VerificationKey2019` and `P256Key2021`/`P384Key2021`/`P521Key2021` keys with EdDSA, ES256K, ES256K-R, ES256, ES384 or ES512, as JWK, base58, hex or (P-256/P-384/P-521 `Multikey`) multibase. Signing is unchanged (EdDSA).
- LD presentations drop the Veramo-only `verifier` field before signing, since no credentials context defines it (it was never part of the signed data). Use `domain` / `challenge` to bind an LD presentation to its audience.
- **Breaking:** canonicalization runs in JSON-LD safe mode. Signing or verifying a document with a term that no `@context` defines now throws, instead of silently leaving that term out of the signed data. Credentials with such terms that verified before will now fail to verify.
- **Breaking:** `@digitalbazaar/vc` also requires `credentialStatus.id` to be a URI (as it already did for `issuer`, `credentialSubject.id` and `evidence` ids).
- The CLI's default config no longer references `@transmute/credentials-context`; `LdDefaultContexts` already contains the credentials v1 context.
