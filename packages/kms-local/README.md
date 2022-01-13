# Veramo Local KMS

A Veramo KMS implementation that provides Ed25519 and secp256k1 crypto.

This module provides an implementation
of [`AbstractKeyManagementSystem`](../key-manager/src/abstract-key-management-system.ts#L6) that can be used by the
[`@veramo/key-manager`](../key-manager) plugin to provide Secp256k1, Ed25519, and X25519 crypto functionality to a
Veramo agent.

The keys managed by this module are stored in an implementation
of [`AbstractPrivateKeyStore`](../key-manager/src/abstract-private-key-store.ts).
See [`MemoryPrivateKeyStore`](../key-manager/src/memory-key-store.ts#L43)
or [`PrivateKeyStore`](../data-store/src/identifier/private-key-store.ts) for implementations.
