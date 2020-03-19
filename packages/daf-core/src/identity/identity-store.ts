import { AbstractIdentityStore, SerializedIdentity } from '../identity/abstract-identity-store'
import { Identity } from '../entities/identity'
import { Key } from '../entities/key'

import Debug from 'debug'
const debug = Debug('daf:identity-store')

export class IdentityStore extends AbstractIdentityStore {
  /**
   *
   * @param provider Can be any string. It will be saved next to the Identity
   */
  constructor(private provider: string) {
    super()
  }

  /**
   *
   * @param did DID address. String
   */
  async get(did: string) {
    const identity = await Identity.findOne(did, { relations: ['keys'] })
    if (!identity) throw Error('Identity not found')
    return identity
  }

  /**
   *
   * @param did DID address. String
   */
  async delete(did: string) {
    const identity = await Identity.findOne(did)
    if (!identity) throw Error('Identity not found')
    debug('Deleting', did)
    await identity.remove()
    return true
  }

  /**
   *
   * @param did DID address
   * @param serializedIdentity SerializedIdentity
   */
  async set(did: string, serializedIdentity: SerializedIdentity) {
    const identity = new Identity()
    identity.did = serializedIdentity.did
    identity.controllerKeyId = serializedIdentity.controllerKeyId
    identity.keys = []
    identity.provider = this.provider

    for (const sKey of serializedIdentity.keys) {
      const key = new Key()
      key.kid = sKey.kid
      identity.keys.push(key)
    }
    await identity.save()

    debug('Saving', did)
    return true
  }

  async listDids() {
    const identities = await Identity.find({ where: { provider: this.provider } })
    return identities.map(identity => identity.did)
  }
}
