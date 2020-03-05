import { AbstractIdentityStore, SerializedIdentity, Identity, Key } from 'daf-core'
import Debug from 'debug'
const debug = Debug('daf:orm:identity-store')

export class IdentityStore extends AbstractIdentityStore {
  async get(did: string) {
    const identity = await Identity.findOne(did, { relations: ['keys'] })
    if (!identity) throw Error('Identity not found')
    return identity
  }

  async delete(did: string) {
    const identity = await Identity.findOne(did)
    if (!identity) throw Error('Identity not found')
    debug('Deleting', did)
    await identity.remove()
    return true
  }

  async set(did: string, serializedIdentity: SerializedIdentity) {
    const identity = new Identity()
    identity.did = serializedIdentity.did
    identity.controllerKeyId = serializedIdentity.controllerKeyId
    identity.keys = []

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
    const identities = await Identity.find()
    return identities.map(identity => identity.did)
  }
}
