import { IIdentifier, IKey, IService, IAgentContext, IKeyManager } from '@veramo/core'
import { AbstractIdentifierProvider } from '@veramo/did-manager'
import { Provider } from '@ethersproject/abstract-provider'
import { JsonRpcProvider } from '@ethersproject/providers'
import { computePublicKey } from '@ethersproject/signing-key'
import { computeAddress } from '@ethersproject/transactions'
import { KmsEthereumSigner } from './kms-eth-signer'
import Debug from 'debug'
import { EthrDID } from 'ethr-did'
const debug = Debug('veramo:did-provider-ethr')

export type IRequiredContext = IAgentContext<IKeyManager>

/**
 * Helper method that can computes the ethereumAddress corresponding to a secp256k1 public key.
 * @param hexPublicKey A hex encoded public key, prefixed with `0x`
 */
export function toEthereumAddress(hexPublicKey: string): string {
  return computeAddress('0x' + hexPublicKey)
}

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:ethr` identifiers
 * @public
 */
export class EthrDIDProvider extends AbstractIdentifierProvider {
  private defaultKms: string
  private network: string | number
  private web3Provider?: Provider
  private rpcUrl?: string
  private gas?: number
  private ttl?: number
  private registry?: string

  constructor(options: {
    defaultKms: string
    network: string | number
    rpcUrl?: string
    web3Provider?: Provider
    ttl?: number
    gas?: number
    registry?: string
  }) {
    super()
    this.defaultKms = options.defaultKms
    this.network = options.network
    this.rpcUrl = options.rpcUrl
    this.web3Provider = <Provider>options.web3Provider
    if (typeof this.web3Provider === 'undefined') {
      this.web3Provider = new JsonRpcProvider(this.rpcUrl, this.network)
    }
    this.ttl = options.ttl
    this.gas = options.gas
    this.registry = options.registry
  }

  async createIdentifier(
    { kms, options }: { kms?: string; options?: any },
    context: IRequiredContext,
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

  async deleteIdentifier(identifier: IIdentifier, context: IRequiredContext): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid })
    }
    return true
  }

  private async getEthrDidController(identifier: IIdentifier, context: IRequiredContext) {
    if (identifier.controllerKeyId == null) {
      throw new Error('invalid_argument: identifier does not list a `controllerKeyId`')
    }
    const controllerKey = await context.agent.keyManagerGet({ kid: identifier.controllerKeyId })
    if (typeof controllerKey === 'undefined') {
      throw new Error('invalid_argument: identifier.controllerKeyId is not managed by this agent')
    }
    if (controllerKey.meta?.algorithms?.includes('eth_signTransaction')) {
      return new EthrDID({
        identifier: identifier.did,
        provider: this.web3Provider,
        chainNameOrId: this.network,
        rpcUrl: this.rpcUrl,
        registry: this.registry,
        txSigner: new KmsEthereumSigner(controllerKey, context, this.web3Provider),
      })
    } else {
      // Web3Provider should perform signing and sending transaction
      return new EthrDID({
        identifier: identifier.did,
        provider: this.web3Provider,
        chainNameOrId: this.network,
        rpcUrl: this.rpcUrl,
        registry: this.registry,
      })      
    }
  }

  async addKey(
    { identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IRequiredContext,
  ): Promise<any> {
    const ethrDid = await this.getEthrDidController(identifier, context)
    const usg = key.type === 'X25519' ? 'enc' : 'veriKey'
    const encoding = key.type === 'X25519' ? 'base58' : options?.encoding || 'hex'
    const attrName = `did/pub/${key.type}/${usg}/${encoding}`
    const attrValue = '0x' + key.publicKeyHex
    const ttl = options?.ttl || this.ttl
    const gasLimit = options?.gas || this.gas
    debug('ethrDid.setAttribute %o', { attrName, attrValue, ttl, gasLimit })
    const txHash = await ethrDid.setAttribute(attrName, attrValue, ttl, undefined, {
      gasLimit,
      gasPrice: options?.gasPrice,
      maxFeePerGas: options?.maxFeePerGas,
      maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
      // from: options?.from,
      nonce: options?.nonce,
      accessList: options?.accessList,
      type: options?.type,
    })
    debug({ txHash })
    return txHash
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IRequiredContext,
  ): Promise<any> {
    const ethrDid = await this.getEthrDidController(identifier, context)

    const attrName = 'did/svc/' + service.type
    const attrValue = service.serviceEndpoint
    const ttl = options?.ttl || this.ttl
    const gasLimit = options?.gas || this.gas

    debug('ethrDid.setAttribute %o', { attrName, attrValue, ttl, gasLimit })

    const txHash = await ethrDid.setAttribute(attrName, attrValue, ttl, undefined, {
      gasLimit,
      gasPrice: options?.gasPrice,
      maxFeePerGas: options?.maxFeePerGas,
      maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
      // from: options?.from,
      nonce: options?.nonce,
      accessList: options?.accessList,
      type: options?.type,
    })
    debug({ txHash })
    return txHash
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IRequiredContext,
  ): Promise<any> {
    const ethrDid = await this.getEthrDidController(args.identifier, context)

    const key = args.identifier.keys.find((k) => k.kid === args.kid)
    if (!key) throw Error('Key not found')

    const usg = key.type === 'X25519' ? 'enc' : 'veriKey'
    const encoding = key.type === 'X25519' ? 'base58' : args.options?.encoding || 'hex'
    const attrName = `did/pub/${key.type}/${usg}/${encoding}`
    const attrValue = '0x' + key.publicKeyHex
    const gasLimit = args.options?.gas || this.gas

    debug('ethrDid.revokeAttribute', { attrName, attrValue, gasLimit })
    const txHash = await ethrDid.revokeAttribute(attrName, attrValue, undefined, {
      gasLimit,
      gasPrice: args.options?.gasPrice,
      maxFeePerGas: args.options?.maxFeePerGas,
      maxPriorityFeePerGas: args.options?.maxPriorityFeePerGas,
      // from: options?.from,
      nonce: args.options?.nonce,
      accessList: args.options?.accessList,
      type: args.options?.type,
    })

    return txHash
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IRequiredContext,
  ): Promise<any> {
    const ethrDid = await this.getEthrDidController(args.identifier, context)

    const service = args.identifier.services.find((s) => s.id === args.id)
    if (!service) throw Error('Service not found')

    const attrName = 'did/svc/' + service.type
    const attrValue = service.serviceEndpoint
    const gasLimit = args.options?.gas || this.gas

    debug('ethrDid.revokeAttribute', { attrName, attrValue, gasLimit })
    const txHash = await ethrDid.revokeAttribute(attrName, attrValue, undefined, {
      gasLimit,
      gasPrice: args.options?.gasPrice,
      maxFeePerGas: args.options?.maxFeePerGas,
      maxPriorityFeePerGas: args.options?.maxPriorityFeePerGas,
      // from: options?.from,
      nonce: args.options?.nonce,
      accessList: args.options?.accessList,
      type: args.options?.type,
    })
    return txHash
  }
}
