import { TransactionRequest, Provider } from '@ethersproject/abstract-provider'
import { Signer, TypedDataSigner, TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { getAddress } from '@ethersproject/address'
import { Bytes } from '@ethersproject/bytes'
import { Deferrable, resolveProperties } from '@ethersproject/properties'
import { computeAddress, serialize, UnsignedTransaction } from '@ethersproject/transactions'
import { IRequiredContext } from './ethr-did-provider.js'
import { IKey } from '@veramo/core-types'

/**
 * Creates an `@ethersproject/abstract-signer` implementation by wrapping
 * a veramo agent with a key-manager that should be capable of `eth_signTransaction`
 *
 * @internal This is exported for convenience, not meant to be supported as part of the public API
 */
export class KmsEthereumSigner extends Signer implements TypedDataSigner {
  private context: IRequiredContext
  private controllerKey: IKey
  readonly provider?: Provider

  constructor(controllerKey: IKey, context: IRequiredContext, provider?: Provider) {
    super()
    this.controllerKey = controllerKey
    this.context = context
    this.provider = provider
  }

  async getAddress(): Promise<string> {
    // publicKeyHex is not available when using web3provider
    if (this.controllerKey.meta?.account) {
      return this.controllerKey.meta?.account
    }
    return computeAddress('0x' + this.controllerKey.publicKeyHex)
  }

  async signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
    const tx = await resolveProperties(transaction)
    if (tx.from != null) {
      const thisAddress = await this.getAddress()
      if (getAddress(tx.from) !== thisAddress) {
        throw new Error(`transaction from address mismatch ${transaction.from} != ${thisAddress}`)
      }
      delete tx.from
    }
    const signature = await this.context.agent.keyManagerSign({
      keyRef: this.controllerKey.kid,
      data: serialize(<UnsignedTransaction>tx),
      algorithm: 'eth_signTransaction',
      encoding: 'base16',
    })
    return signature
  }

  async _signTypedData(
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

  signMessage(message: string | Bytes): Promise<string> {
    throw new Error('not_implemented: signMessage() Method not implemented by KmsEthereumSigner.')
  }

  connect(provider: Provider): KmsEthereumSigner {
    return new KmsEthereumSigner(this.controllerKey, this.context, provider)
  }
}
