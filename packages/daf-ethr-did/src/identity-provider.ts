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
import { keccak_256 } from 'js-sha3'
const SignerProvider = require('ethjs-provider-signer')
import Debug from 'debug'
const debug = Debug('daf:ethr-did:identity-provider')

export function toEthereumAddress(hexPublicKey: string): string {
  return `0x${Buffer.from(keccak_256.arrayBuffer(Buffer.from(hexPublicKey.slice(2), 'hex')))
    .slice(-20)
    .toString('hex')}`
}

export class IdentityProvider extends AbstractIdentityProvider {
  public type = 'ethr-did'
  public description = 'identities'
  private network: string
  private web3Provider?: any
  private rpcUrl?: string
  private kms: AbstractKeyManagementSystem
  private identityStore: AbstractIdentityStore
  private gas?: number
  private ttl?: number
  private registry?: string

  constructor(options: {
    kms: AbstractKeyManagementSystem
    identityStore: AbstractIdentityStore
    network: string
    rpcUrl?: string
    web3Provider?: object
    ttl?: number
    gas?: number
    registry?: string
  }) {
    super()
    this.kms = options.kms
    this.identityStore = options.identityStore
    this.network = options.network
    this.rpcUrl = options.rpcUrl
    this.web3Provider = options.web3Provider
    this.type = options.network + '-' + this.type
    this.description = 'did:ethr ' + options.network + ' ' + this.description
    this.ttl = options.ttl
    this.gas = options.gas
    this.registry = options.registry
  }

  private async identityFromSerialized(serializedIdentity: SerializedIdentity): Promise<AbstractIdentity> {
    const key = await this.kms.getKey(serializedIdentity.controllerKeyId)

    if (!this.web3Provider && !this.rpcUrl) throw Error('Web3Provider or rpcUrl required')

    const web3Provider =
      this.web3Provider ||
      new SignerProvider(this.rpcUrl, {
        signTransaction: key.signEthTransaction.bind(key),
      })

    const identityController = new IdentityController({
      did: serializedIdentity.did,
      web3Provider,
      kms: this.kms,
      identityStore: this.identityStore,
      address: toEthereumAddress(key.serialized.publicKeyHex),
      gas: this.gas,
      ttl: this.ttl,
      registry: this.registry,
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
    const key = await this.kms.createKey('Secp256k1')
    const address = toEthereumAddress(key.serialized.publicKeyHex)
    const serializedIdentity: SerializedIdentity = {
      did: 'did:ethr:' + (this.network !== 'mainnet' ? this.network + ':' : '') + address,
      controllerKeyId: key.serialized.kid,
      keys: [key.serialized],
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
