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

export abstract class AbstractIdentity {
  abstract identityProviderType: string
  abstract did: string
  abstract didDoc: () => Promise<DIDDocument>
  abstract sign: (data: string, keyId?: string) => Promise<any>
  abstract encrypt: (to: string, data: string | Uint8Array) => Promise<any>
  abstract decrypt: (encrypted: any) => Promise<string>
  abstract addPublicKey: (type: string, proofPurpose?: string[]) => Promise<PublicKey>
  abstract removePublicKey: (keyId: string) => Promise<boolean>
  abstract addService: (service: ServiceEndpoint) => Promise<boolean>
  abstract removeService: (service: ServiceEndpoint) => Promise<boolean>
}

type AbstractIdentityClass = typeof AbstractIdentity
export interface IdentityDerived extends AbstractIdentityClass {}
