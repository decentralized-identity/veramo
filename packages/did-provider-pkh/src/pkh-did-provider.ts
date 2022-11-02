import { IIdentifier, IKey, IService, IAgentContext, IKeyManager } from '@veramo/core'
import { Provider } from '@ethersproject/abstract-provider'

import { AbstractIdentifierProvider } from '@veramo/did-manager'
import { computePublicKey } from '@ethersproject/signing-key'
import { BigNumber } from '@ethersproject/bignumber'

import Debug from 'debug'
const debug = Debug('veramo:did-pkh:identifier-provider')

type IContext = IAgentContext<IKeyManager>

/**
 * Options for creating a did:ethr
 * @beta
 */
 export interface CreateDidPkhEthrOptions {
  /**
   * This can be a network name or hex encoded chain ID (string) or a chainId number
   *
   * If this is not specified, `mainnet` is assumed.
   */
  network?: string | number

  /**
   * This is usually a did prefix, like `did:ethr` or `did:ethr:goerli` and can be used to determine the desired
   * network, if no `network` option is specified.
   */
  providerName?: string
}

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
   * The chain ID for the ethereum network being configured. This can be a hex-encoded string starting with `0x`.
   * If `name` is not specified, then the hex encoded `chainId` will be used when creating DIDs, according to the
   * `did:pkh` spec.
   *
   * Example, chainId==42 and name==undefined => DIDs are prefixed with `did:ethr:0x2a:`
   */
  chainId?: string | number

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any
}

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:pkh` identifiers
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class PkhDIDProvider extends AbstractIdentifierProvider {
    private defaultKms: string
    private networks: EthrNetworkConfiguration[] | undefined
  
    constructor(options: {
      defaultKms: string
      networks?: EthrNetworkConfiguration[]
    })
    {
      super()
      this.defaultKms = options.defaultKms
      if (options.networks) {
        this.networks = options.networks
      } else {
       
      //   if (typeof options.network === 'string') {
      //     if (options.network.startsWith('0x')) {
      //       singleNetwork.chainId = parseInt(options.network.substring(2), 16)
      //     } else {
      //       singleNetwork.name = options.network
      //     }
      //   } else if (typeof options.network === 'number') {
      //     singleNetwork.chainId = options.network
      //     singleNetwork.name = options.name
      //   }
      //   this.networks = [singleNetwork]
      // }
    
    }
    
    }



  async createIdentifier(
    { kms, options }: { kms?: string; options?: CreateDidPkhEthrOptions },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
 
    const key = await context.agent.keyManagerCreate({ kms: kms || this.defaultKms, type: 'Secp256k1' })
    const compressedPublicKey = computePublicKey(`0x${key.publicKeyHex}`, true)
    let networkSpecifier =
      options?.network ||
      (options?.providerName?.match(/^did:pkh:eip155.+$/) ? options?.providerName?.substring(9) : undefined)

    
    const network = options?.network; // this.getNetworkFor(networkSpecifier)
    if (!network) {
      throw new Error(
        `invalid_setup: Cannot create did:pkh. There is no known configuration for network=${networkSpecifier}'`,
      )
    }
    // if (typeof networkSpecifier === 'number') {
    //   networkSpecifier =
    //     network.name && network.name.length > 0
    //       ? network.name
    //       : BigNumber.from(options?.network || 1).toHexString()
    // }
    //const networkString = networkSpecifier && networkSpecifier !== 'mainnet' ? `${networkSpecifier}:` : ''
    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:pkh:eip155:' + network + ':' + compressedPublicKey,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    debug('Created', identifier.did)
    return identifier
  }
  async updateIdentifier(args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any }, context: IAgentContext<IKeyManager>): Promise<IIdentifier> {
    throw new Error('PkhDIDProvider updateIdentifier not supported yet.')
  }

  async deleteIdentifier(identifier: IIdentifier, context: IContext): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid })
    }
    return true
  }

  async addKey(
    { identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('PkhDIDProvider addKey not supported')
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('PkhDIDProvider addService not supported')
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('PkhDIDProvider removeKey not supported')
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('PkhDIDProvider removeService not supported')
  }

  private getNetworkFor(networkSpecifier: string | number | undefined): EthrNetworkConfiguration | undefined {
    let networkNameOrId: string | number = networkSpecifier || 'mainnet'
    if (
      typeof networkNameOrId === 'string' &&
      (networkNameOrId.startsWith('0x') || parseInt(networkNameOrId) > 0)
    ) {
      networkNameOrId = BigNumber.from(networkNameOrId).toNumber()
    }
    let network = this.networks?.find(
      (n) => n.chainId === networkNameOrId || n.name === networkNameOrId || n.description === networkNameOrId,
    )
    if (!network && !networkSpecifier && this.networks?.length === 1) {
      network = this.networks[0]
    }
    return network
  }
}
