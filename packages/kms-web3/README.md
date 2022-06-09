# Veramo Web3 KMS

A Veramo KMS implementation that provides secp256k1 crypto backed by web3 wallets.

This module provides an implementation
of [`AbstractKeyManagementSystem`](../key-manager/src/abstract-key-management-system.ts#L6) that can be used by the
[`@veramo/key-manager`](../key-manager) plugin to provide Secp256k1 crypto functionality to a
Veramo agent.
