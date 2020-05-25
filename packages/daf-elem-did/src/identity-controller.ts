import { AbstractIdentityController, AbstractKeyManagementSystem, AbstractIdentityStore } from 'daf-core'
import Debug from 'debug'
const op = require('@transmute/element-lib/src/sidetree/op')
const debug = Debug('daf:elem-did:identity-controller')

export class IdentityController extends AbstractIdentityController {
  private did: string
  private kms: AbstractKeyManagementSystem
  private identityStore: AbstractIdentityStore
  private apiUrl: string

  constructor(options: {
    did: string
    kms: AbstractKeyManagementSystem
    identityStore: AbstractIdentityStore
    apiUrl: string
  }) {
    super()
    this.did = options.did
    this.kms = options.kms
    this.identityStore = options.identityStore
    this.apiUrl = options.apiUrl
  }

  async addService(service: { id: string; type: string; serviceEndpoint: string }): Promise<any> {
    return Promise.reject('[daf-elem-did identity-controller] addService not implemented')
  }

  async addPublicKey(type: 'Ed25519' | 'Secp256k1', proofPurpose?: string[]): Promise<any> {
    const serializedIdentity = await this.identityStore.get(this.did)
    const primaryKey = await this.kms.getKey(serializedIdentity.controllerKeyId)

    debug('Fetching list of previous operations')
    const response = await fetch(this.apiUrl + '/operations/' + this.did)
    const operations = await response.json()

    debug('Operations count:', operations.length)
    if (operations.length === 0) {
      return Promise.reject('There should be at least one operation')
    }

    const lastOperation = operations.pop()

    const newKey = await this.kms.createKey(type)
    const newPublicKey = {
      id: newKey.serialized.kid,
      usage: 'signing',
      type: type == 'Secp256k1' ? 'Secp256k1VerificationKey2018' : 'Ed25519VerificationKey2018',
      publicKeyHex: newKey.serialized.publicKeyHex,
    }

    const ops = op({ parameters: { didMethodName: 'did:elem' } })

    const updatePayload = await ops.getUpdatePayloadForAddingAKey(
      lastOperation,
      newPublicKey,
      primaryKey.serialized.privateKeyHex,
    )

    debug('Posting DID Doc update')
    const response2 = await fetch(this.apiUrl + '/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    })

    if (response2.status !== 200) {
      debug(response2.statusText)
      this.kms.deleteKey(newKey.serialized.kid)
      return Promise.reject(response2.statusText)
    }

    debug('Success. New publicKey:', newKey.serialized.publicKeyHex)
    serializedIdentity.keys.push(newKey.serialized)
    this.identityStore.set(serializedIdentity.did, serializedIdentity)
    return true
  }
}
