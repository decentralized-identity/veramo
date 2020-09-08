import { IIdentity, IKey, IService, IAgentContext, IKeyManager } from 'daf-core'
import { AbstractIdentityProvider } from 'daf-identity-manager'
import { keccak_256 } from 'js-sha3'
import Debug from 'debug'
const EthrDID = require('ethr-did')
const SignerProvider = require('ethjs-provider-signer')
const debug = Debug('daf:ethr-did:identity-provider')

type IContext = IAgentContext<IKeyManager>

/**
 * Helper method that can computes the ethereumAddress corresponding to a secp256k1 public key.
 * @param hexPublicKey A hex encoded public key, prefixed with `0x`
 */
export function toEthereumAddress(hexPublicKey: string): string {
  return `0x${Buffer.from(keccak_256.arrayBuffer(Buffer.from(hexPublicKey.slice(2), 'hex')))
    .slice(-20)
    .toString('hex')}`
}

/**
 * {@link daf-identity-manager#IdentityManager} identity provider for `did:ethr` identities
 * @public
 */
export class EthrIdentityProvider extends AbstractIdentityProvider {
  private defaultKms: string
  private network: string
  private web3Provider?: any
  private rpcUrl?: string
  private gas?: number
  private ttl?: number
  private registry?: string

  constructor(options: {
    defaultKms: string
    network: string
    rpcUrl?: string
    web3Provider?: object
    ttl?: number
    gas?: number
    registry?: string
  }) {
    super()
    this.defaultKms = options.defaultKms
    this.network = options.network
    this.rpcUrl = options.rpcUrl
    this.web3Provider = options.web3Provider
    this.ttl = options.ttl
    this.gas = options.gas
    this.registry = options.registry
  }

  async createIdentity(
    { kms, options }: { kms?: string; options?: any },
    context: IContext,
  ): Promise<Omit<IIdentity, 'provider'>> {
    const key = await context.agent.keyManagerCreateKey({ kms: kms || this.defaultKms, type: 'Secp256k1' })
    const address = toEthereumAddress(key.publicKeyHex)
    const identity: Omit<IIdentity, 'provider'> = {
      did: 'did:ethr:' + (this.network !== 'mainnet' ? this.network + ':' : '') + address,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
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

  private getWeb3Provider({ controllerKeyId }: IIdentity, context: IContext) {
    if (!this.web3Provider && !this.rpcUrl) throw Error('Web3Provider or rpcUrl required')

    const web3Provider =
      this.web3Provider ||
      new SignerProvider(this.rpcUrl, {
        signTransaction: (
          transaction: object,
          callback: (error: string | null, signature?: string) => void,
        ) => {
          context.agent
            .keyManagerSignEthTX({ kid: controllerKeyId, transaction })
            .then((signature) => callback(null, signature))
            .catch((error) => callback(error))
        },
      })
    return web3Provider
  }

  async addKey(
    { identity, key, options }: { identity: IIdentity; key: IKey; options?: any },
    context: IContext,
  ): Promise<any> {
    const address = identity.did.split(':').pop()
    const ethrDid = new EthrDID({
      address,
      provider: this.getWeb3Provider(identity, context),
      registry: this.registry,
    })

    const usg = 'veriKey'
    const attribute = 'did/pub/' + key.type + '/' + usg + '/hex'
    const value = '0x' + key.publicKeyHex
    const ttl = options?.ttl || this.ttl
    const gas = options?.gas || this.gas

    debug('ethrDid.setAttribute %o', { attribute, value, ttl, gas })

    const txHash = await ethrDid.setAttribute(attribute, value, ttl, gas)
    debug({ txHash })
    return txHash
  }

  async addService(
    { identity, service, options }: { identity: IIdentity; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    const ethrDid = new EthrDID({
      address: identity.did.split(':').pop(),
      provider: this.getWeb3Provider(identity, context),
      registry: this.registry,
    })

    const attribute = 'did/svc/' + service.type
    const value = service.serviceEndpoint
    const ttl = options?.ttl || this.ttl
    const gas = options?.gas || this.gas

    debug('ethrDid.setAttribute %o', { attribute, value, ttl, gas })

    const txHash = await ethrDid.setAttribute(attribute, value, ttl, gas)
    debug({ txHash })
    return txHash
  }

  async removeKey(
    args: { identity: IIdentity; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('Not implemented')
  }

  async removeService(
    args: { identity: IIdentity; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('Not implemented')
  }
}
