import { AbstractIdentityController, AbstractKeyManagementSystem, AbstractIdentityStore } from 'daf-core'
import Debug from 'debug'
const debug = Debug('daf:web-did:identity-controller')

export class IdentityController extends AbstractIdentityController {
  private did: string
  private kms: AbstractKeyManagementSystem
  private identityStore: AbstractIdentityStore

  constructor(options: {
    did: string
    kms: AbstractKeyManagementSystem
    identityStore: AbstractIdentityStore
  }) {
    super()
    this.did = options.did
    this.kms = options.kms
    this.identityStore = options.identityStore
  }

  async addService(service: { id: string; type: string; serviceEndpoint: string }): Promise<any> {
    return Promise.reject('[daf-web-did identity-controller] addService not implemented')
  }

  async addPublicKey(type: 'Ed25519' | 'Secp256k1', proofPurpose?: string[]): Promise<any> {
    const serializedIdentity = await this.identityStore.get(this.did)
    const newKey = await this.kms.createKey(type)

    debug('Success. New publicKey:', newKey.serialized.publicKeyHex)
    serializedIdentity.keys.push(newKey.serialized)
    this.identityStore.set(serializedIdentity.did, serializedIdentity)
    return true
  }

  async getDidDocument(): Promise<any> {
    const serializedIdentity = await this.identityStore.get(this.did)
    return {
      '@context': 'https://w3id.org/did/v1',
      id: serializedIdentity.did,
      publicKey: serializedIdentity.keys.map(key => ({
        id: serializedIdentity.did + '#' + key.kid,
        type: key.type === 'Secp256k1' ? 'Secp256k1VerificationKey2018' : 'Ed25519VerificationKey2018',
        owner: serializedIdentity.did,
        publicKeyHex: key.publicKeyHex,
      })),
      authentication: serializedIdentity.keys.map(key => ({
        type:
          key.type === 'Secp256k1'
            ? 'Secp256k1SignatureAuthentication2018'
            : 'Ed25519SignatureAuthentication2018',
        publicKey: serializedIdentity.did + '#' + key.kid,
      })),
    }
  }
}
