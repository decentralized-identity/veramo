import { IIdentifier, IKey, IService, IAgentContext, IKeyManager } from '@veramo/core'
import { AbstractIdentifierProvider } from '@veramo/did-manager'
import { keccak_256 } from 'js-sha3'
import Debug from 'debug'
import { EthrDID } from 'ethr-did'
import { computePublicKey } from '@ethersproject/signing-key'
const SignerProvider = require('ethjs-provider-signer')
const debug = Debug('veramo:did-provider-ethr')

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
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:ethr` identifiers
 * @public
 */
export class EthrDIDProvider extends AbstractIdentifierProvider {
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

  async createIdentifier(
    { kms, options }: { kms?: string; options?: any },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const key = await context.agent.keyManagerCreate({ kms: kms || this.defaultKms, type: 'Secp256k1' })
    const compressedPublicKey = computePublicKey(`0x${key.publicKeyHex}`, true)
    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:ethr:' + (this.network !== 'mainnet' ? this.network + ':' : '') + compressedPublicKey,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    debug('Created', identifier.did)
    return identifier
  }

  async deleteIdentifier(identifier: IIdentifier, context: IContext): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid })
    }
    return true
  }

  private getWeb3Provider({ controllerKeyId }: IIdentifier, context: IContext) {
    if (!this.web3Provider && !this.rpcUrl) throw Error('Web3Provider or rpcUrl required')
    if (!controllerKeyId) throw Error('ControllerKeyId does not exist')

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
    { identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IContext,
  ): Promise<any> {
    const ethrDid = new EthrDID({
      identifier: identifier.did,
      provider: this.getWeb3Provider(identifier, context),
      registry: this.registry,
    })

    const usg = 'veriKey'
    const attribute = 'did/pub/' + key.type + '/' + usg + '/hex'
    const value = '0x' + key.publicKeyHex
    const ttl = options?.ttl || this.ttl
    const gasLimit = options?.gas || this.gas

    debug('ethrDid.setAttribute %o', { attribute, value, ttl, gas: gasLimit })

    const txHash = await ethrDid.setAttribute(attribute, value, ttl, gasLimit)
    debug({ txHash })
    return txHash
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    const ethrDid = new EthrDID({
      identifier: identifier.did,
      provider: this.getWeb3Provider(identifier, context),
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
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    const ethrDid = new EthrDID({
      identifier: args.identifier.did,
      provider: this.getWeb3Provider(args.identifier, context),
      registry: this.registry,
    })

    const key = args.identifier.keys.find((k) => k.kid === args.kid)
    if (!key) throw Error('Key not found')

    const usg = 'veriKey'
    const attribute = 'did/pub/' + key.type + '/' + usg + '/hex'
    const value = '0x' + key.publicKeyHex
    const gas = args.options?.gas || this.gas

    debug('ethrDid.revokeAttribute', { attribute, value, gas })
    const txHash = await ethrDid.revokeAttribute(attribute, value, gas)
    return txHash
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    const ethrDid = new EthrDID({
      identifier: args.identifier.did,
      provider: this.getWeb3Provider(args.identifier, context),
      registry: this.registry,
    })

    const service = args.identifier.services.find((s) => s.id === args.id)
    if (!service) throw Error('Service not found')

    const attribute = 'did/svc/' + service.type
    const value = service.serviceEndpoint
    const gas = args.options?.gas || this.gas

    debug('ethrDid.revokeAttribute', { attribute, value, gas })
    const txHash = await ethrDid.revokeAttribute(attribute, value, gas)
    return txHash
  }
}
