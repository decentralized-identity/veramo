import { IIdentity, IKey, IService, IAgentBase, IAgentKeyManager, AbstractIdentityProvider } from 'daf-core'
import { Identity } from './identity'
import { IdentityController } from './identity-controller'
import { keccak_256 } from 'js-sha3'
import Debug from 'debug'
const EthrDID = require('ethr-did')
const SignerProvider = require('ethjs-provider-signer')
const debug = Debug('daf:ethr-did:identity-provider')

interface IContext {
  agent: IAgentBase & IAgentKeyManager
}


export function toEthereumAddress(hexPublicKey: string): string {
  return `0x${Buffer.from(keccak_256.arrayBuffer(Buffer.from(hexPublicKey.slice(2), 'hex')))
    .slice(-20)
    .toString('hex')}`
}

export class IdentityProvider extends AbstractIdentityProvider {
  private network: string
  private web3Provider?: any
  private rpcUrl?: string
  private gas?: number
  private ttl?: number
  private registry?: string

  constructor(options: {
    network: string
    rpcUrl?: string
    web3Provider?: object
    ttl?: number
    gas?: number
    registry?: string
  }) {
    super()
    this.network = options.network
    this.rpcUrl = options.rpcUrl
    this.web3Provider = options.web3Provider
    this.ttl = options.ttl
    this.gas = options.gas
    this.registry = options.registry
  }

  // private async identityFromSerialized(serializedIdentity: SerializedIdentity): Promise<AbstractIdentity> {
  //   const key = await this.kms.getKey(serializedIdentity.controllerKeyId)

  //   if (!this.web3Provider && !this.rpcUrl) throw Error('Web3Provider or rpcUrl required')

  //   const web3Provider =
  //     this.web3Provider ||
  //     new SignerProvider(this.rpcUrl, {
  //       signTransaction: key.signEthTransaction.bind(key),
  //     })

  //   const identityController = new IdentityController({
  //     did: serializedIdentity.did,
  //     web3Provider,
  //     kms: this.kms,
  //     identityStore: this.identityStore,
  //     address: toEthereumAddress(key.serialized.publicKeyHex),
  //     gas: this.gas,
  //     ttl: this.ttl,
  //     registry: this.registry,
  //   })

  //   return new Identity({
  //     serializedIdentity,
  //     kms: this.kms,
  //     identityProviderType: this.type,
  //     identityController,
  //   })
  // }

  // async getIdentities() {
  //   const dids = await this.identityStore.listDids()
  //   const result = []
  //   for (const did of dids) {
  //     const serializedIdentity = await this.identityStore.get(did)
  //     result.push(await this.identityFromSerialized(serializedIdentity))
  //   }
  //   return result
  // }

  async createIdentity(
    { kms, options }: { kms: string; options?: any },
    context: IContext,
  ): Promise<Omit<IIdentity, 'provider'>> {

    const key = await context.agent.keyManagerCreateKey({ kms, type: 'Secp256k1' })
    const address = toEthereumAddress(key.publicKeyHex)
    const identity: Omit<IIdentity, 'provider'> = {
      did: 'did:ethr:' + (this.network !== 'mainnet' ? this.network + ':' : '') + address,
      controllerKeyId: key.kid,
      keys: [key],
      services: []
    }
    debug('Created', identity.did)
    return identity
  }

  async deleteIdentity(identity: IIdentity, context: IContext): Promise<boolean> {
    for (const { kid } of identity.keys) {
      await context.agent.keyManagerDeleteKey({ kid })
    }
    return true
  }

  private getWeb3Provider(key: IKey) {
    if (!this.web3Provider && !this.rpcUrl) throw Error('Web3Provider or rpcUrl required')

    const web3Provider =
      this.web3Provider ||
      new SignerProvider(this.rpcUrl, {
        signTransaction: key.signEthTransaction.bind(key),
      })
  }

  async addKey({ did, key, options }: { did: string; key: IKey; options?: any }): Promise<any> {

    const ethrDid = new EthrDID({
      address: did.split(':').pop,
      provider: this.web3Provider,
      registry: this.registry,
    })

    const usg = 'veriKey'
    const attribute = 'did/pub/' + key.type + '/' + usg + '/hex'
    const value = '0x' + key.publicKeyHex
    const ttl = options?.ttl || this.ttl 
    const gas = options?.gas || this.gas 
    
    debug('ethrDid.setAttribute', { attribute, value, ttl, gas })

    const txHash = await ethrDid.setAttribute(attribute, value, ttl, gas)
    debug({ txHash })
    return txHash
  }

  async addService({ did, service, options }: { did: string; service: IService; options?: any }): Promise<any> {
    const ethrDid = new EthrDID({
      address: did.split(':').pop,
      provider: this.web3Provider,
      registry: this.registry,
    })

    const attribute = 'did/svc/' + service.type
    const value = service.serviceEndpoint
    const ttl = options?.ttl || this.ttl 
    const gas = options?.gas || this.gas 

    debug('ethrDid.setAttribute', { attribute, value, ttl, gas })
    
    const txHash = await ethrDid.setAttribute(attribute, value, ttl, gas)
    debug({ txHash })
    return txHash
  }

  async removeKey(args: { did: string; kid: string; options?: any }): Promise<any> {
    throw Error('Not implemented')
  }

  async removeService(args: { did: string; id: string; options?: any }): Promise<any> {
    throw Error('Not implemented')
  }

}
