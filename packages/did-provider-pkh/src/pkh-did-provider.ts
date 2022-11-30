import { IIdentifier, IKey, IService, IAgentContext, IKeyManager } from '@veramo/core'
import { Provider } from '@ethersproject/abstract-provider'
import { computeAddress } from '@ethersproject/transactions'

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
   * This can be hex encoded chain ID (string) or a chainId number
   *
   * If this is not specified, `1` is assumed.
   */
  chainId?: string | number
}

 /**
 * Helper method that can computes the ethereumAddress corresponding to a Secp256k1 public key.
 * @param hexPublicKey A hex encoded public key, optionally prefixed with `0x`
 */
  export function toEthereumAddress(hexPublicKey: string): string {
    const publicKey = hexPublicKey.startsWith('0x') ? hexPublicKey : '0x' + hexPublicKey
    return computeAddress(publicKey)
  }


/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:pkh` identifiers
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class PkhDIDProvider extends AbstractIdentifierProvider {
    private defaultKms: string

    constructor(options: {
      defaultKms: string
    })
    {
      super()
      this.defaultKms = options.defaultKms
    }



  async createIdentifier(
    { kms, options }: { kms?: string; options?: CreateDidPkhEthrOptions },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {

    const key = await context.agent.keyManagerCreate({ kms: kms || this.defaultKms, type: 'Secp256k1' })
    const publicAddress = toEthereumAddress(key.publicKeyHex);

    const network = options?.chainId; 
    if (!network) {
      throw new Error(
        `invalid_setup: Cannot create did:pkh. There is no known configuration for network=${network}'`,
      )
    }

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:pkh:eip155:' + network + ':' + publicAddress,
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

  // private getNetworkFor(networkSpecifier: string | number | undefined): EthrNetworkConfiguration | undefined {
  //   let networkNameOrId: string | number = networkSpecifier || 'mainnet'
  //   if (
  //     typeof networkNameOrId === 'string' &&
  //     (networkNameOrId.startsWith('0x') || parseInt(networkNameOrId) > 0)
  //   ) {
  //     networkNameOrId = BigNumber.from(networkNameOrId).toNumber()
  //   }
  //   let network = this.networks?.find(
  //     (n) => n.chainId === networkNameOrId || n.name === networkNameOrId || n.description === networkNameOrId,
  //   )
  //   if (!network && !networkSpecifier && this.networks?.length === 1) {
  //     network = this.networks[0]
  //   }
  //   return network
  // }


}
