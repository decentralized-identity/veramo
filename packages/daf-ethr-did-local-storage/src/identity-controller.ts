import Debug from 'debug'
import { AbstractIdentityProvider, AbstractIdentity } from 'daf-core'
const EthrDID = require('ethr-did').default
const debug = Debug('daf:ethr-did-local-storage:identity-controller')

interface Identity {
  address: string
  privateKey: string
  did: string
}

interface StorageContents {
  identities: Identity[]
}

export class EthrDidLocalStorageController {
  public type = 'ethr-did-local-storage'

  // private readFromStorage(): StorageContents {
  //   try {
  //     const raw = window.localStorage.getItem(this.type) || ''
  //     return JSON.parse(raw) as StorageContents
  //   } catch (e) {
  //     return { identities: [] }
  //   }
  // }

  // private writeToStorage(json: StorageContents) {
  //   return window.localStorage.setItem(this.type, JSON.stringify(json))
  // }

  // private issuerFromIdentity(identity: Identity): Issuer {
  //   const ethrDid = new EthrDID({ ...identity })
  //   const issuer: Issuer = {
  //     did: identity.did,
  //     signer: ethrDid.signer,
  //     type: this.type,
  //     ethereumAddress: ethrDid.address,
  //   }
  //   return issuer
  // }

  // async listDids() {
  //   const { identities } = this.readFromStorage()
  //   return identities.map(identity => identity.did)
  // }

  // async listIssuers() {
  //   const { identities } = this.readFromStorage()
  //   return identities.map(this.issuerFromIdentity.bind(this)) as Issuer[]
  // }

  // async create() {
  //   const { identities } = this.readFromStorage()
  //   const keyPair = EthrDID.createKeyPair()
  //   const ethrDid = new EthrDID({ ...keyPair })

  //   this.writeToStorage({
  //     identities: [
  //       ...identities,
  //       {
  //         did: ethrDid.did,
  //         address: ethrDid.address,
  //         privateKey: keyPair.privateKey,
  //       },
  //     ],
  //   })

  //   debug('Created', ethrDid.did)

  //   return ethrDid.did
  // }

  // async delete(did: string) {
  //   const { identities } = this.readFromStorage()

  //   if (!identities.find(identity => identity.did === did)) {
  //     return false
  //   }

  //   const filteredIdentities = identities.filter(identity => identity.did !== did)

  //   this.writeToStorage({ identities: filteredIdentities })

  //   debug('Deleted', did)

  //   return true
  // }

  // async issuer(did: string) {
  //   const { identities } = this.readFromStorage()

  //   const identity = identities.find(identity => identity.did === did)
  //   if (!identity) {
  //     return Promise.reject('Did not found: ' + did)
  //   }

  //   return this.issuerFromIdentity(identity)
  // }

  // async export(did: string) {
  //   const { identities } = this.readFromStorage()

  //   const identity = identities.find(identity => identity.did === did)
  //   if (!identity) {
  //     return Promise.reject('Did not found: ' + did)
  //   }
  //   return identity.privateKey
  // }
}
