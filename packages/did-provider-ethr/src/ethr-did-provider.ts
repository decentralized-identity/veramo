import { IAgentContext, IIdentifier, IKey, IKeyManager, IService } from '@veramo/core-types'
import { AbstractIdentifierProvider } from '@veramo/did-manager'
import { Provider, SigningKey, computeAddress, JsonRpcProvider, TransactionRequest, Signature } from 'ethers'
import { KmsEthereumSigner } from './kms-eth-signer.js'
import Debug from 'debug'
import { EthrDID } from 'ethr-did'

const debug = Debug('veramo:did-provider-ethr')

export type IRequiredContext = IAgentContext<IKeyManager>

/**
 * For most operations at most 60-70k gas is needed, larger amount for safety
 */
export const DEFAULT_GAS_LIMIT = 100000

/**
 * Helper method that can computes the ethereumAddress corresponding to a Secp256k1 public key.
 * @param hexPublicKey A hex encoded public key, optionally prefixed with `0x`
 */
export function toEthereumAddress(hexPublicKey: string): string {
  const publicKey = hexPublicKey.startsWith('0x') ? hexPublicKey : '0x' + hexPublicKey
  return computeAddress(publicKey)
}

/**
 * Options for creating a did:ethr
 * @beta
 */
export interface CreateDidEthrOptions {
  /**
   * This can be a network name or hex encoded chain ID (string) or a chainId number
   *
   * If this is not specified, `mainnet` is assumed.
   */
  network?: string | number | bigint

  /**
   * This is usually a did prefix, like `did:ethr` or `did:ethr:goerli` and can be used to determine the desired
   * network, if no `network` option is specified.
   */
  providerName?: string
}

export interface TransactionOptions extends TransactionRequest {
  ttl?: number
  encoding?: string
  metaIdentifierKeyId?: string
}

/**
 * Possible options for network configuration for `did:ethr`
 *
 * @beta
 */
export interface EthrNetworkConfiguration {
  /**
   * The name of the network, for example 'mainnet', 'goerli', 'polygon'.
   * If this is present, then DIDs anchored on this network will have a human-readable prefix, like
   * `did:ethr:goerli:0x...`. See the
   * {@link https://github.com/uport-project/ethr-did-registry#contract-deployments | official deployments} for a table
   * of reusable names.
   * If this parameter is not present, `chainId` MUST be specified.
   */
  name?: string

  /**
   * Web3 provider. This is used to interact with the ethereum network.
   * When a web3 wallet is used here, it can also be used to sign transactions.
   * Either a `provider` or a `rpcUrl` must be specified. `provider` takes precedence when both are used.
   */
  provider?: Provider

  /**
   * Equivalent to `provider`
   * Web3 provider. This is used to interact with the ethereum network.
   * When a web3 wallet is used here, it can also be used to sign transactions.
   * Either a `provider` or a `rpcUrl` must be specified. `provider` takes precedence when both are used.
   */
  web3Provider?: Provider

  /**
   * A JSON RPC URL for the ethereum network that is being used.
   * Either a `provider` or a `rpcUrl` must be specified. `provider` takes precedence when both are used.
   */
  rpcUrl?: string

  /**
   * The EIP1056 registry address for the ethereum network being configured.
   *
   * Please See the
   * {@link https://github.com/uport-project/ethr-did-registry#contract-deployments | official deployments} for a table
   * of known deployments.
   */
  registry?: string

  /**
   * The chain ID for the ethereum network being configured. This can be a hex-encoded string starting with `0x`.
   * If `name` is not specified, then the hex encoded `chainId` will be used when creating DIDs, according to the
   * `did:ethr` spec.
   *
   * Example, chainId==42 and name==undefined => DIDs are prefixed with `did:ethr:0x2a:`
   */
  chainId?: string | number | bigint

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any
}

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:ethr` identifiers
 * @public
 */
export class EthrDIDProvider extends AbstractIdentifierProvider {
  private defaultKms: string
  private networks: EthrNetworkConfiguration[]
  private gas?: number
  private ttl?: number

  constructor(options: {
    defaultKms: string
    networks?: EthrNetworkConfiguration[]
    ttl?: number
    /**
     * @deprecated Please use the `networks` parameter instead.
     */
    network?: string | number | bigint
    /**
     * @deprecated Please use the `networks` parameter instead.
     */
    name?: string
    /**
     * @deprecated Please use the `networks` parameter instead.
     */
    rpcUrl?: string
    /**
     * @deprecated Please use the `networks` parameter instead.
     */
    web3Provider?: Provider
    /**
     * @deprecated Please use the `networks` parameter instead.
     */
    registry?: string
    /**
     * @deprecated If tweaking is necessary, please specify the maximum `gasLimit` as an `option` to every DID update
     */
    gas?: number
  }) {
    super()
    this.defaultKms = options.defaultKms
    if (options.networks) {
      this.networks = options.networks
    } else {
      const singleNetwork: EthrNetworkConfiguration = {
        provider: options.web3Provider,
        rpcUrl: options.rpcUrl,
        registry: options.registry,
      }
      if (typeof singleNetwork.provider === 'undefined') {
        singleNetwork.provider = new JsonRpcProvider(singleNetwork.rpcUrl, singleNetwork.network)
      }
      if (typeof options.network === 'string') {
        if (options.network.startsWith('0x')) {
          singleNetwork.chainId = BigInt(options.network)
        } else {
          singleNetwork.name = options.network
        }
      } else if (typeof options.network === 'bigint') {
        singleNetwork.chainId = options.network
        singleNetwork.name = options.name
      } else if (typeof options.network === 'number') {
        singleNetwork.chainId = BigInt(options.network)
        singleNetwork.name = options.name
      }
      this.networks = [singleNetwork]
    }
    this.ttl = options.ttl
    this.gas = options.gas
  }

  async createIdentifier(
    { kms, options }: { kms?: string; options?: CreateDidEthrOptions },
    context: IRequiredContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const key = await context.agent.keyManagerCreate({kms: kms || this.defaultKms, type: 'Secp256k1'})
    const compressedPublicKey = SigningKey.computePublicKey(`0x${key.publicKeyHex}`, true)

    let networkSpecifier
    if(options?.network) {
      if(typeof options.network === 'number') {
        networkSpecifier = BigInt(options?.network)
      } else {
        networkSpecifier = options?.network
      }
    } else if(options?.providerName?.match(/^did:ethr:.+$/)) {
      networkSpecifier = options?.providerName?.substring(9)
    } else {
      networkSpecifier = undefined
    }

    const network = this.getNetworkFor(networkSpecifier)
    if (!network) {
      throw new Error(
        `invalid_setup: Cannot create did:ethr. There is no known configuration for network=${networkSpecifier}'`,
      )
    }
    if (typeof networkSpecifier === 'bigint' || typeof networkSpecifier === 'number') {
      networkSpecifier =
        network.name && network.name.length > 0
          ? network.name
          : BigInt(options?.network || 1).toString(16)
    }
    const networkString = networkSpecifier && networkSpecifier !== 'mainnet' ? `${networkSpecifier}:` : ''
    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:ethr:' + networkString + compressedPublicKey,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    debug('Created', identifier.did)
    return identifier
  }

  async updateIdentifier(
    args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    throw new Error('EthrDIDProvider updateIdentifier not supported yet.')
  }

  async deleteIdentifier(identifier: IIdentifier, context: IRequiredContext): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      // FIXME: keys might be used by multiple DIDs or even independent
      await context.agent.keyManagerDelete({ kid })
    }
    return true
  }

  private getNetworkFor(networkSpecifier: string | number | bigint | undefined): EthrNetworkConfiguration | undefined {
    let networkNameOrId: string | number | bigint = networkSpecifier || 'mainnet'
    let network = this.networks.find(
      (n) => {
        if(n.chainId) {
          if(typeof networkSpecifier === 'bigint') {
            if(BigInt(n.chainId) === networkNameOrId) return n
          } else {
            if(n.chainId === networkNameOrId) return n
          }
        }
        if(n.name === networkNameOrId || n.description === networkNameOrId) return n
      },
    )
    if (!network && !networkSpecifier && this.networks.length === 1) {
      network = this.networks[0]
    }
    return network
  }

  private async getEthrDidController(
    identifier: IIdentifier,
    context: IRequiredContext,
    metaIdentifierKeyId?: string,
  ): Promise<EthrDID> {
    if (identifier.controllerKeyId == null) {
      throw new Error('invalid_argument: identifier does not list a `controllerKeyId`')
    }
    const controllerKey = await context.agent.keyManagerGet({ kid: identifier.controllerKeyId })
    if (typeof controllerKey === 'undefined') {
      throw new Error('invalid_argument: identifier.controllerKeyId is not managed by this agent')
    }

    // find network
    const networkStringMatcher = /^did:ethr(:.+)?:(0x[0-9a-fA-F]{40}|0x[0-9a-fA-F]{66}).*$/
    const matches = identifier.did.match(networkStringMatcher)
    let network = this.getNetworkFor(matches?.[1]?.substring(1))

    if (!matches || !network) {
      throw new Error(`invalid_argument: cannot find network for ${identifier.did}`)
    }

    if(!network.provider) {
      throw new Error(`Provider was not found for network ${identifier.did}`)
    }

    if (metaIdentifierKeyId) {
      const metaControllerKey = await context.agent.keyManagerGet({ kid: metaIdentifierKeyId })
      if (typeof metaControllerKey === 'undefined') {
        throw new Error('invalid_argument: identifier.controllerKeyId is not managed by this agent')
      }

      // Identity owner signs payload but metaIdentifier send the tx (meta transaction; signed methods)
      return new EthrDID({
        identifier: identifier.did,
        provider: network.provider,
        chainNameOrId: network.name || network.chainId,
        rpcUrl: network.rpcUrl,
        registry: network.registry,
        txSigner: new KmsEthereumSigner(metaControllerKey, context, network?.provider),
      })
    }

    if (controllerKey.meta?.algorithms?.includes('eth_signTransaction')) {
      return new EthrDID({
        identifier: identifier.did,
        provider: network.provider,
        chainNameOrId: network.name || network.chainId,
        rpcUrl: network.rpcUrl,
        registry: network.registry,
        txSigner: new KmsEthereumSigner(controllerKey, context, network?.provider),
      })
    } else {
      // Web3Provider should perform signing and sending transaction
      return new EthrDID({
        identifier: identifier.did,
        provider: network.provider,
        chainNameOrId: network.name || network.chainId,
        rpcUrl: network.rpcUrl,
        registry: network.registry,
      })
    }
  }

  async addKey(
    { identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: TransactionOptions },
    context: IRequiredContext,
  ): Promise<any> {
    const ethrDid = await this.getEthrDidController(identifier, context)
    const usg = key.type === 'X25519' ? 'enc' : 'veriKey'
    const encoding = key.type === 'X25519' ? 'base58' : options?.encoding || 'hex'
    const attrName = `did/pub/${key.type}/${usg}/${encoding}`
    const attrValue = '0x' + key.publicKeyHex
    const ttl = options?.ttl || this.ttl || 86400
    const gasLimit = options?.gasLimit || this.gas || DEFAULT_GAS_LIMIT
    if (options?.metaIdentifierKeyId) {
      const metaHash = await ethrDid.createSetAttributeHash(attrName, attrValue, ttl)
      const canonicalSignature = await EthrDIDProvider.createMetaSignature(context, identifier, metaHash)

      const metaEthrDid = await this.getEthrDidController(identifier, context, options.metaIdentifierKeyId!)
      debug('ethrDid.addKeySigned %o', { attrName, attrValue, ttl, gasLimit })
      delete options.metaIdentifierKeyId
      const txHash = await metaEthrDid.setAttributeSigned(
        attrName,
        attrValue,
        ttl,
        { sigV: canonicalSignature.v, sigR: canonicalSignature.r, sigS: canonicalSignature.s },
        {
          ...options,
          gasLimit,
        },
      )
      debug(`ethrDid.addKeySigned tx = ${txHash}`)
      return txHash
    } else {
      debug('ethrDid.setAttribute %o', { attrName, attrValue, ttl, gasLimit })
      const txHash = await ethrDid.setAttribute(attrName, attrValue, ttl, undefined, {
        ...options,
        gasLimit,
      })
      debug(`ethrDid.addKey tx = ${txHash}`)
      return txHash
    }
  }

  async addService(
    {
      identifier,
      service,
      options,
    }: { identifier: IIdentifier; service: IService; options?: TransactionOptions },
    context: IRequiredContext,
  ): Promise<any> {
    const ethrDid = await this.getEthrDidController(identifier, context)

    const attrName = 'did/svc/' + service.type
    const attrValue =
      typeof service.serviceEndpoint === 'string'
        ? service.serviceEndpoint
        : JSON.stringify(service.serviceEndpoint)
    const ttl = options?.ttl || this.ttl || 86400
    const gasLimit = options?.gasLimit || this.gas || DEFAULT_GAS_LIMIT

    debug('ethrDid.setAttribute %o', { attrName, attrValue, ttl, gasLimit })

    if (options?.metaIdentifierKeyId) {
      const metaHash = await ethrDid.createSetAttributeHash(attrName, attrValue, ttl)
      const canonicalSignature = await EthrDIDProvider.createMetaSignature(context, identifier, metaHash)

      const metaEthrDid = await this.getEthrDidController(identifier, context, options.metaIdentifierKeyId!)
      debug('ethrDid.addServiceSigned %o', { attrName, attrValue, ttl, gasLimit })
      delete options.metaIdentifierKeyId
      const txHash = await metaEthrDid.setAttributeSigned(
        attrName,
        attrValue,
        ttl,
        { sigV: canonicalSignature.v, sigR: canonicalSignature.r, sigS: canonicalSignature.s },
        {
          ...options,
          gasLimit,
        },
      )
      debug(`ethrDid.addServiceSigned tx = ${txHash}`)
      return txHash
    } else {
      const txHash = await ethrDid.setAttribute(attrName, attrValue, ttl, undefined, {
        ...options,
        gasLimit,
      })
      debug(`ethrDid.addService tx = ${txHash}`)
      return txHash
    }
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: TransactionOptions },
    context: IRequiredContext,
  ): Promise<any> {
    const ethrDid = await this.getEthrDidController(args.identifier, context)

    const key = args.identifier.keys.find((k) => k.kid === args.kid)
    if (!key) throw Error('Key not found')

    const usg = key.type === 'X25519' ? 'enc' : 'veriKey'
    const encoding = key.type === 'X25519' ? 'base58' : args.options?.encoding || 'hex'
    const attrName = `did/pub/${key.type}/${usg}/${encoding}`
    const attrValue = '0x' + key.publicKeyHex
    const gasLimit = args.options?.gasLimit || this.gas || DEFAULT_GAS_LIMIT

    if (args.options?.metaIdentifierKeyId) {
      const metaHash = await ethrDid.createRevokeAttributeHash(attrName, attrValue)
      const canonicalSignature = await EthrDIDProvider.createMetaSignature(context, args.identifier, metaHash)

      const metaEthrDid = await this.getEthrDidController(
        args.identifier,
        context,
        args.options.metaIdentifierKeyId!,
      )
      debug('ethrDid.revokeAttributeSigned %o', { attrName, attrValue, gasLimit })
      delete args.options.metaIdentifierKeyId
      const txHash = await metaEthrDid.revokeAttributeSigned(
        attrName,
        attrValue,
        { sigV: canonicalSignature.v, sigR: canonicalSignature.r, sigS: canonicalSignature.s },
        {
          ...args.options,
          gasLimit,
        },
      )
      debug(`ethrDid.removeKeySigned tx = ${txHash}`)
      return txHash
    } else {
      debug('ethrDid.revokeAttribute', { attrName, attrValue, gasLimit })
      const txHash = await ethrDid.revokeAttribute(attrName, attrValue, undefined, {
        ...args.options,
        gasLimit,
      })
      debug(`ethrDid.removeKey tx = ${txHash}`)
      return txHash
    }
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: TransactionOptions },
    context: IRequiredContext,
  ): Promise<any> {
    const ethrDid = await this.getEthrDidController(args.identifier, context)

    const service = args.identifier.services.find((s) => s.id === args.id)
    if (!service) throw Error('Service not found')

    const attrName = 'did/svc/' + service.type
    const attrValue =
      typeof service.serviceEndpoint === 'string'
        ? service.serviceEndpoint
        : JSON.stringify(service.serviceEndpoint)
    const gasLimit = args.options?.gasLimit || this.gas || DEFAULT_GAS_LIMIT

    if (args.options?.metaIdentifierKeyId) {
      const metaHash = await ethrDid.createRevokeAttributeHash(attrName, attrValue)
      const canonicalSignature = await EthrDIDProvider.createMetaSignature(context, args.identifier, metaHash)

      const metaEthrDid = await this.getEthrDidController(
        args.identifier,
        context,
        args.options.metaIdentifierKeyId!,
      )
      debug('ethrDid.revokeAttributeSigned %o', { attrName, attrValue, gasLimit })
      delete args.options.metaIdentifierKeyId
      const txHash = await metaEthrDid.revokeAttributeSigned(
        attrName,
        attrValue,
        { sigV: canonicalSignature.v, sigR: canonicalSignature.r, sigS: canonicalSignature.s },
        {
          ...args.options,
          gasLimit,
        },
      )
      debug(`ethrDid.removeServiceSigned tx = ${txHash}`)
      return txHash
    } else {
      debug('ethrDid.revokeAttribute', { attrName, attrValue, gasLimit })
      const txHash = await ethrDid.revokeAttribute(attrName, attrValue, undefined, {
        ...args.options,
        gasLimit,
      })
      debug(`ethrDid.removeService tx = ${txHash}`)
      return txHash
    }
  }

  /**
   * Tries to determine if this DID provider can manage DIDs with the given prefix.
   *
   * If this provider was configured for a particular network and that network name or hexChainId is used in the prefix
   * it will return true.
   *
   * @param prefix - The DID prefix to match against
   */
  matchPrefix(prefix: string): boolean {
    const matches = prefix.match(/^did:ethr(:.+)?$/)
    let network = this.getNetworkFor(matches?.[1]?.substring(1))
    if (!matches || !network) {
      return false
    }
    return true
  }

  private static async createMetaSignature(
    context: IRequiredContext,
    identifier: IIdentifier,
    metaHash: string,
  ) {
    const controllerKey = await context.agent.keyManagerGet({ kid: identifier.controllerKeyId! })
    if (typeof controllerKey === 'undefined') {
      throw new Error('invalid_argument: identifier.controllerKeyId is not managed by this agent')
    }
    const signature = await context.agent.keyManagerSign({
      keyRef: controllerKey.kid,
      data: metaHash,
      algorithm: 'eth_rawSign',
      encoding: 'hex',
    })
    return Signature.from(signature)
  }
}
