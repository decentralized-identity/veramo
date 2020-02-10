export interface DIDDocument {
  '@context': 'https://w3id.org/did/v1'
  id: string
  publicKey: PublicKey[]
  service?: ServiceEndpoint[]
}
export interface PublicKey {
  id: string
  type: string
  owner: string
  ethereumAddress?: string
  publicKeyBase64?: string
  publicKeyBase58?: string
  publicKeyHex?: string
  publicKeyPem?: string
}
export interface ServiceEndpoint {
  id: string
  type: string
  serviceEndpoint: string
  description?: string
}

// Placeholder:
interface EcdsaSignature {
  r: string
  s: string
  recoveryParam?: number
}
// Placeholder:
type Signer = (data: string) => Promise<EcdsaSignature | string>

export abstract class AbstractIdentity {
  abstract identityProviderType: string
  abstract did: string
  abstract didDoc(): Promise<DIDDocument | null>
  abstract signer(keyId?: string): Signer
  abstract encrypt(to: string, data: string): Promise<string>
  abstract decrypt(encrypted: string): Promise<string>
}

type AbstractIdentityClass = typeof AbstractIdentity
export interface IdentityDerived extends AbstractIdentityClass {}
