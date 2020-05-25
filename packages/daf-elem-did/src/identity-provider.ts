import {
  AbstractIdentityProvider,
  AbstractIdentity,
  Resolver,
  AbstractIdentityStore,
  AbstractKeyManagementSystem,
  SerializedIdentity,
} from 'daf-core'
import { Identity } from './identity'
import { IdentityController } from './identity-controller'
const SignerProvider = require('ethjs-provider-signer')
import Debug from 'debug'
const debug = Debug('daf:elem-did:identity-provider')
const element = require('@transmute/element-lib')
const op = require('@transmute/element-lib/src/sidetree/op')
const func = require('@transmute/element-lib/src/func')

export class IdentityProvider extends AbstractIdentityProvider {
  public type = 'elem-did'
  public description = 'identities'
  private apiUrl: string
  private network?: string
  private kms: AbstractKeyManagementSystem
  private identityStore: AbstractIdentityStore

  constructor(options: {
    kms: AbstractKeyManagementSystem
    identityStore: AbstractIdentityStore
    apiUrl: string
    network?: string
  }) {
    super()
    this.kms = options.kms
    this.identityStore = options.identityStore
    this.apiUrl = options.apiUrl
    this.network = options.network
    this.description = 'did:elem ' + this.network + ' using ' + options.apiUrl
    this.type = options.network + '-' + this.type
  }

  private async identityFromSerialized(serializedIdentity: SerializedIdentity): Promise<AbstractIdentity> {
    const identityController = new IdentityController({
      did: serializedIdentity.did,
      kms: this.kms,
      identityStore: this.identityStore,
      apiUrl: this.apiUrl,
    })

    return new Identity({
      serializedIdentity,
      kms: this.kms,
      identityProviderType: this.type,
      identityController,
    })
  }

  async getIdentities() {
    const dids = await this.identityStore.listDids()
    const result = []
    for (const did of dids) {
      const serializedIdentity = await this.identityStore.get(did)
      result.push(await this.identityFromSerialized(serializedIdentity))
    }
    return result
  }

  async createIdentity() {
    const primaryKey = await this.kms.createKey('Secp256k1')
    const recoveryKey = await this.kms.createKey('Secp256k1')
    const didMethodName = 'did:elem' + (this.network ? ':' + this.network : '')
    const operations = op({ parameters: { didMethodName } })
    const didDocumentModel = operations.getDidDocumentModel(
      primaryKey.serialized.publicKeyHex,
      recoveryKey.serialized.publicKeyHex,
    )
    const createPayload = await operations.getCreatePayload(didDocumentModel, {
      privateKey: primaryKey.serialized.privateKeyHex,
    })
    const didUniqueSuffix = func.getDidUniqueSuffix(createPayload)
    const did = didMethodName + ':' + didUniqueSuffix
    debug('Creating new DID at', this.apiUrl)
    debug('Posting new DID Document for', did)
    const response = await fetch(this.apiUrl + '/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
    })

    if (response.status !== 200) {
      return Promise.reject(response.statusText)
    }

    const serializedIdentity: SerializedIdentity = {
      did,
      controllerKeyId: primaryKey.serialized.kid,
      keys: [primaryKey.serialized, recoveryKey.serialized],
    }

    await this.identityStore.set(serializedIdentity.did, serializedIdentity)
    debug('Created', serializedIdentity.did)
    return this.identityFromSerialized(serializedIdentity)
  }

  async deleteIdentity(did: string) {
    const serializedIdentity = await this.identityStore.get(did)
    for (const key of serializedIdentity.keys) {
      await this.kms.deleteKey(key.kid)
    }
    return this.identityStore.delete(serializedIdentity.did)
  }

  async getIdentity(did: string) {
    const serializedIdentity = await this.identityStore.get(did)
    return this.identityFromSerialized(serializedIdentity)
  }

  async exportIdentity(did: string) {
    const serializedIdentity = await this.identityStore.get(did)
    return JSON.stringify(serializedIdentity)
  }

  async importIdentity(secret: string) {
    const serializedIdentity: SerializedIdentity = JSON.parse(secret)
    for (const serializedKey of serializedIdentity.keys) {
      await this.kms.importKey(serializedKey)
    }
    await this.identityStore.set(serializedIdentity.did, serializedIdentity)
    return this.identityFromSerialized(serializedIdentity)
  }
}
