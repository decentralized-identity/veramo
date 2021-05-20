import { TransactionRequest, Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'
import { getAddress } from '@ethersproject/address'
import { Bytes } from '@ethersproject/bytes'
import { Deferrable, resolveProperties } from '@ethersproject/properties'
import { computeAddress, serialize, UnsignedTransaction } from '@ethersproject/transactions'
import { IRequiredContext } from './ethr-did-provider'
import { IKey } from '@veramo/core'

/**
 * Creates an `@ethersproject/abstract-signer` implementation by wrapping
 * a veramo agent with a key-manager that should be capable of `eth_signTransaction`
 */
export class KmsEthereumSigner extends Signer {
  private context: IRequiredContext
  private controllerKey: IKey

  constructor(controllerKey: IKey, context: IRequiredContext) {
    super()
    this.controllerKey = controllerKey
    this.context = context
  }

  async getAddress(): Promise<string> {
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
      kid: this.controllerKey.kid,
      data: serialize(<UnsignedTransaction>tx),
      alg: 'eth_signTransaction',
      enc: 'base16',
    })
    return serialize(<UnsignedTransaction>tx, signature)
  }

  signMessage(message: string | Bytes): Promise<string> {
    throw new Error('not_implemented: signMessage() Method not implemented by KmsEthereumSigner.')
  }

  connect(provider: Provider): Signer {
    throw new Error('not_implemented: connect() Method not implemented by KmsEthereumSigner.')
  }
}
