/**
 * Provides `did:jwk` {@link @veramo/did-provider-jwk#JwkDIDProvider | identifier provider } for the
 * {@link @veramo/did-manager#DIDManager}
 *
 * @packageDocumentation
 */
export { JwkDIDProvider } from './jwk-did-provider.js'
export { getDidJwkResolver } from './resolver.js'
export type JwkDidSupportedKeyTypes = 'Secp256r1' | 'Secp256k1' | 'Ed25519' | 'X25519'
