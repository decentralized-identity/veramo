---
'@veramo/credential-ld': major
'@veramo/cli': patch
---

`@veramo/credential-ld` now runs on the upstream Digital Bazaar JSON-LD stack (`jsonld@9`, `jsonld-signatures@11`, `@digitalbazaar/vc@7`, `@digitalbazaar/ed25519-signature-2020@5`) and has no forked dependencies:

- Ed25519Signature2018, JsonWebSignature2020 and EcdsaSecp256k1RecoverySignature2020 are implemented in this package on top of `jsonld-signatures` (detached JWS) instead of `@transmute/*` and the `lds-ecdsa-secp256k1-recovery2020` git fork. `@digitalcredentials/*` and `cross-fetch` are gone; remote contexts use the global `fetch`.
- Proofs are unchanged: credentials and presentations issued by the previous version verify, and the same inputs produce byte-identical proofs.
- The package now bundles and runs on React Native (Metro + Hermes); see `packages/test-rn-app/README.md` for the polyfills an app needs.
- **Breaking:** JSON-LD canonicalization runs in safe mode. Signing or verifying a document with a term that no `@context` defines now throws instead of silently leaving that term out of the signed data. `credentialStatus.id` and other ids validated by `@digitalbazaar/vc` must be URIs.
- The CLI's default config no longer references `@transmute/credentials-context`; `LdDefaultContexts` already contains the credentials v1 context.
