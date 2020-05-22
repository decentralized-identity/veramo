import {
  AbstractIdentityProvider,
  AbstractIdentity,
  AbstractIdentityStore,
  AbstractKeyManagementSystem,
  SerializedIdentity,
} from 'daf-core'
import { Identity } from './identity'
import { IdentityController } from './identity-controller'
import Debug from 'debug'
const debug = Debug('daf:web-did:identity-provider')

export class IdentityProvider extends AbstractIdentityProvider {
  public type = 'web-did'
  public description = 'identities'
  private kms: AbstractKeyManagementSystem
  private identityStore: AbstractIdentityStore

  constructor(options: { kms: AbstractKeyManagementSystem; identityStore: AbstractIdentityStore }) {
    super()
    this.kms = options.kms
    this.identityStore = options.identityStore
    this.description = 'did:web identities'
  }

  private async identityFromSerialized(serializedIdentity: SerializedIdentity): Promise<AbstractIdentity> {
    const identityController = new IdentityController({
      did: serializedIdentity.did,
      kms: this.kms,
      identityStore: this.identityStore,
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

  async createIdentity(options: { domain: string }) {
    if (!options?.domain) {
      throw Error('[daf-web-did] Domain required')
    }

    const did = 'did:web:' + options?.domain
    const primaryKey = await this.kms.createKey('Secp256k1')

    const serializedIdentity: SerializedIdentity = {
      did,
      controllerKeyId: primaryKey.serialized.kid,
      keys: [primaryKey.serialized],
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
