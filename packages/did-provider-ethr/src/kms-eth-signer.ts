import {
  Provider,
  Signer,
  TypedDataDomain,
  TypedDataField,
  getAddress,
  computeAddress,
  Transaction,
  AbstractSigner,
} from 'ethers'
import { IRequiredContext } from './ethr-did-provider.js'
import { IKey } from '@veramo/core-types'
import {Addressable} from "ethers";

/**
 * Creates an `ethers` - `signer` implementation by wrapping
 * a veramo agent with a key-manager that should be capable of `eth_signTransaction`
 *
 * @internal This is exported for convenience, not meant to be supported as part of the public API
 */
export class KmsEthereumSigner extends AbstractSigner {
  private context: IRequiredContext
  private controllerKey: IKey
  readonly provider: Provider | null

  constructor(controllerKey: IKey, context: IRequiredContext, provider?: Provider) {
    super(provider)
    this.controllerKey = controllerKey
    this.context = context
    this.provider = provider || null
  }

  async getAddress(): Promise<string> {
    // publicKeyHex is not available when using web3provider
    if (this.controllerKey.meta?.account) {
      return this.controllerKey.meta?.account
    }
    return computeAddress('0x' + this.controllerKey.publicKeyHex)
  }

  async signTransaction(transaction: Transaction): Promise<string> {
    if (transaction.from != null) {
      const thisAddress = await this.getAddress()
      if (getAddress(transaction.from) !== thisAddress) {
        throw new Error(`transaction from address mismatch ${transaction.from} != ${thisAddress}`)
      }
    }

    const signature = await this.context.agent.keyManagerSign({
      keyRef: this.controllerKey.kid,
      data: transaction.unsignedSerialized,
      algorithm: 'eth_signTransaction',
      encoding: 'base16',
    })
    return signature
  }

  async signTypedData(
      domain: TypedDataDomain,
      types: Record<string, Array<TypedDataField>>,
      value: Record<string, any>,
  ): Promise<string> {
    const data = JSON.stringify({
      domain: domain,
      types: types,
      message: value,
    });
    return this.context.agent.keyManagerSign({
      keyRef: this.controllerKey.kid,
      algorithm: 'eth_signTypedData',
      data: data,
    });
  }

  signMessage(message: string | Uint8Array): Promise<string> {
    throw new Error('not_implemented: signMessage() Method not implemented by KmsEthereumSigner.')
  }

  connect(provider: Provider | null) {
    if(!provider) {
      throw new Error('provider must not be null')
    }
    return new KmsEthereumSigner(this.controllerKey, this.context, provider) as unknown as Signer
  }
}

function isAddressable(address: any): address is Addressable {
  return (address as Addressable).getAddress !== undefined;
}
