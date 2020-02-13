import {
  AbstractIdentityProvider,
  AbstractIdentity,
  Resolver,
  AbstractIdentityStore,
  AbstractKeyManagementSystem,
  SerializedIdentity,
} from 'daf-core'
import { Identity } from './identity'
import { sign } from 'ethjs-signer'
const SignerProvider = require('ethjs-provider-signer')
const EthrDID = require('ethr-did')
import Debug from 'debug'
const debug = Debug('daf:ethr-did-fs:identity-provider')

import { keccak_256 } from 'js-sha3'
import { sha256 as sha256js, Message } from 'js-sha256'

export function sha256(payload: Message): Buffer {
  return Buffer.from(sha256js.arrayBuffer(payload))
}

function keccak(data: any): Buffer {
  return Buffer.from(keccak_256.arrayBuffer(data))
}
export function toEthereumAddress(hexPublicKey: string): string {
  return `0x${keccak(Buffer.from(hexPublicKey.slice(2), 'hex'))
    .slice(-20)
    .toString('hex')}`
}

export class IdentityProvider extends AbstractIdentityProvider {
  public type = 'ethr-did-fs'
  public description = 'identities saved in JSON file'
  private network: string
  private rpcUrl: string
  private resolver: Resolver
  private kms: AbstractKeyManagementSystem
  private store: AbstractIdentityStore

  constructor(options: {
    kms: AbstractKeyManagementSystem
    store: AbstractIdentityStore
    network: string
    rpcUrl: string
    resolver: Resolver
  }) {
    super()
    this.kms = options.kms
    this.store = options.store
    this.network = options.network
    this.rpcUrl = options.rpcUrl
    this.resolver = options.resolver
    this.type = options.network + '-' + this.type
    this.description = 'did:ethr ' + options.network + ' ' + this.description
  }

  private identityFromSerialized(serializedIdentity: SerializedIdentity): AbstractIdentity {
    return new Identity({
      serializedIdentity,
      kms: this.kms,
      identityProviderType: this.type,
    })
  }

  async getIdentities() {
    const dids = await this.store.listDids()
    const result = []
    for (const did of dids) {
      const serializedIdentity = await this.store.get(did)
      result.push(this.identityFromSerialized(serializedIdentity))
    }
    return result
  }

  async createIdentity() {
    const key = await this.kms.createKey('Secp256k1')
    const address = toEthereumAddress(key.serialized.publicKeyHex)
    const serializedIdentity: SerializedIdentity = {
      did: 'did:ethr:' + (this.network !== 'mainnet' ? this.network + ':' : '') + address,
      controllerKeyId: key.serialized.kid,
      keys: [key.serialized],
    }
    this.store.set(serializedIdentity.did, serializedIdentity)
    return this.identityFromSerialized(serializedIdentity)
  }

  async deleteIdentity(did: string) {
    // TODO Error checking
    const serializedIdentity = await this.store.get(did)
    for (const key of serializedIdentity.keys) {
      await this.kms.deleteKey(key.kid)
    }
    this.store.delete(serializedIdentity.did)
    return true
  }

  async getIdentity(did: string) {
    const serializedIdentity = await this.store.get(did)
    return this.identityFromSerialized(serializedIdentity)
  }

  async addService(
    did: string,
    service: { id: string; type: string; serviceEndpoint: string },
  ): Promise<any> {
    const serializedIdentity = await this.store.get(did)
    const controllerKey = await this.kms.getKey(serializedIdentity.controllerKeyId)
    if (!controllerKey.serialized.privateKeyHex) throw Error('Private key not available')

    const provider = new SignerProvider(this.rpcUrl, {
      signTransaction: (rawTx: any, cb: any) =>
        cb(null, sign(rawTx, '0x' + controllerKey.serialized.privateKeyHex)),
    })
    const address = toEthereumAddress(controllerKey.serialized.publicKeyHex)
    const ethrDid = new EthrDID({ address, provider })

    const attribute = 'did/svc/' + service.type
    const value = service.serviceEndpoint
    const ttl = 86400
    const gas = 100000
    debug('ethrDid.setAttribute', { attribute, value, ttl, gas })
    const txHash = await ethrDid.setAttribute(attribute, value, ttl, gas)
    debug({ txHash })
    return txHash
  }

  async addPublicKey(did: string, type: 'Ed25519' | 'Secp256k1', proofPurpose?: string[]): Promise<any> {
    const serializedIdentity = await this.store.get(did)
    const controllerKey = await this.kms.getKey(serializedIdentity.controllerKeyId)
    if (!controllerKey.serialized.privateKeyHex) throw Error('Private key not available')

    const provider = new SignerProvider(this.rpcUrl, {
      signTransaction: (rawTx: any, cb: any) =>
        cb(null, sign(rawTx, '0x' + controllerKey.serialized.privateKeyHex)),
    })
    const address = toEthereumAddress(controllerKey.serialized.publicKeyHex)
    const ethrDid = new EthrDID({ address, provider })

    const key = await this.kms.createKey(type)

    const usg = 'veriKey'
    const attribute = 'did/pub/' + type + '/' + usg + '/hex'
    const value = '0x' + key.serialized.publicKeyHex
    const ttl = 86400
    const gas = 100000
    debug('ethrDid.setAttribute', { attribute, value, ttl, gas })
    const txHash = await ethrDid.setAttribute(attribute, value, ttl, gas)

    if (txHash) {
      debug({ txHash })
      serializedIdentity.keys.push(key.serialized)
      this.store.set(serializedIdentity.did, serializedIdentity)
      return true
    } else {
      this.kms.deleteKey(key.serialized.kid)
      return false
    }
  }
}
