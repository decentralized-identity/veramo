---
'@veramo/credential-w3c': major
---

**Breaking:** `verifyPresentation` now checks the `credentialStatus` of every embedded credential (JWT and LD) with the agent's `checkCredentialStatus`, like `verifyCredential` does for a single credential. A presentation with a revoked credential returns `verified: false` with `errorCode: 'revoked'`. Verifying a presentation that embeds a credential with a `credentialStatus` rejects with `invalid_setup` when no `ICredentialStatusVerifier` plugin is installed. Set `policies.credentialStatus: false` to skip the check.
