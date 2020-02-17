import { AbstractIdentityController, AbstractKeyManagementSystem, AbstractIdentityStore } from 'daf-core'
const EthrDID = require('ethr-did')
import Debug from 'debug'
const debug = Debug('daf:ethr-did:identity-controller')

export class IdentityController extends AbstractIdentityController {
  private did: string
  private kms: AbstractKeyManagementSystem
  private identityStore: AbstractIdentityStore
  private web3Provider: any
  private address: string

  constructor(options: {
    did: string
    kms: AbstractKeyManagementSystem
    identityStore: AbstractIdentityStore
    web3Provider: any
    address: string
  }) {
    super()
    this.did = options.did
    this.kms = options.kms
    this.identityStore = options.identityStore
    this.web3Provider = options.web3Provider
    this.address = options.address
  }

  async addService(service: { id: string; type: string; serviceEndpoint: string }): Promise<any> {
    const ethrDid = new EthrDID({ address: this.address, provider: this.web3Provider })

    const attribute = 'did/svc/' + service.type
    const value = service.serviceEndpoint
    const ttl = 86400
    const gas = 100000
    debug('ethrDid.setAttribute', { attribute, value, ttl, gas })
    try {
      const txHash = await ethrDid.setAttribute(attribute, value, ttl, gas)
      debug({ txHash })
      return txHash
    } catch (e) {
      debug(e.message)
      return false
    }
  }

  async addPublicKey(type: 'Ed25519' | 'Secp256k1', proofPurpose?: string[]): Promise<any> {
    const serializedIdentity = await this.identityStore.get(this.did)
    const ethrDid = new EthrDID({ address: this.address, provider: this.web3Provider })

    const key = await this.kms.createKey(type)

    const usg = 'veriKey'
    const attribute = 'did/pub/' + type + '/' + usg + '/hex'
    const value = '0x' + key.serialized.publicKeyHex
    const ttl = 86400
    const gas = 100000
    debug('ethrDid.setAttribute', { attribute, value, ttl, gas })

    try {
      const txHash = await ethrDid.setAttribute(attribute, value, ttl, gas)
      debug({ txHash })
      serializedIdentity.keys.push(key.serialized)
      this.identityStore.set(serializedIdentity.did, serializedIdentity)
      return true
    } catch (e) {
      debug(e.message)
      this.kms.deleteKey(key.serialized.kid)
      return false
    }
  }
}
