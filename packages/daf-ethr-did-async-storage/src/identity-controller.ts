import Debug from 'debug'
import { IdentityController, Issuer } from 'daf-core'
import AsyncStorage from '@react-native-community/async-storage'

import EthrDID from 'ethr-did'
const debug = Debug('daf:ethr-did-local-storage:identity-controller')

interface Identity {
  address: string
  privateKey: string
  did: string
}

interface StorageContents {
  identities: Identity[]
}

export class EthrDidAsyncStorageController implements IdentityController {
  public type = 'ethr-did-async-storage'

  private async readFromStorage(): Promise<StorageContents> {
    try {
      const raw = (await AsyncStorage.getItem(this.type)) || ''
      return JSON.parse(raw) as StorageContents
    } catch (e) {
      return { identities: [] }
    }
  }

  private async writeToStorage(json: StorageContents) {
    return await AsyncStorage.setItem(this.type, JSON.stringify(json))
  }

  private issuerFromIdentity(identity: Identity): Issuer {
    const ethrDid = new EthrDID({ ...identity })
    const issuer: Issuer = {
      did: identity.did,
      signer: ethrDid.signer,
      type: this.type,
      ethereumAddress: ethrDid.address,
    }
    return issuer
  }

  async listDids() {
    const { identities } = await this.readFromStorage()
    return identities.map(identity => identity.did)
  }

  async listIssuers() {
    const { identities } = await this.readFromStorage()
    return identities.map(this.issuerFromIdentity.bind(this)) as Issuer[]
  }

  async create() {
    const { identities } = await this.readFromStorage()
    const keyPair = EthrDID.createKeyPair()
    const ethrDid = new EthrDID({ ...keyPair })

    await this.writeToStorage({
      identities: [
        ...identities,
        {
          did: ethrDid.did,
          address: ethrDid.address,
          privateKey: keyPair.privateKey,
        },
      ],
    })

    debug('Created', ethrDid.did)

    return ethrDid.did
  }

  async delete(did: string) {
    const { identities } = await this.readFromStorage()

    if (!identities.find(identity => identity.did === did)) {
      return false
    }

    const filteredIdentities = identities.filter(identity => identity.did !== did)

    this.writeToStorage({ identities: filteredIdentities })

    debug('Deleted', did)

    return true
  }

  async issuer(did: string) {
    const { identities } = await this.readFromStorage()

    const identity = identities.find(identity => identity.did === did)
    if (!identity) {
      return Promise.reject('Did not found: ' + did)
    }

    return this.issuerFromIdentity(identity)
  }

  async export(did: string) {
    const { identities } = await this.readFromStorage()

    const identity = identities.find(identity => identity.did === did)
    if (!identity) {
      return Promise.reject('Did not found: ' + did)
    }
    return identity.privateKey
  }
}
