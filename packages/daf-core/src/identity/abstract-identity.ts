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
  abstract encrypt(to: string, data: string | Uint8Array): Promise<any>
  abstract decrypt(encrypted: any): Promise<string>

  addPublicKey(type: string, proofPurpose?: string[]): Promise<PublicKey> {
    return Promise.reject('Method addPublicKey not implemented')
  }

  removePublicKey(keyId: string): Promise<boolean> {
    return Promise.reject('Method removePublicKey not implemented')
  }

  addService(service: ServiceEndpoint): Promise<any> {
    return Promise.reject('Method addService not implemented')
  }

  removeService(service: ServiceEndpoint): Promise<boolean> {
    return Promise.reject('Method removeService not implemented')
  }
}

type AbstractIdentityClass = typeof AbstractIdentity
export interface IdentityDerived extends AbstractIdentityClass {}
