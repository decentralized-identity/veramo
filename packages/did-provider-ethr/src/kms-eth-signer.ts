import {
  TransactionRequest,
  Provider,
  Signer,
  TypedDataDomain,
  TypedDataField,
  getAddress,
  BlockTag,
  TransactionLike,
  TransactionResponse,
  computeAddress,
  Transaction,
  resolveProperties,
} from 'ethers'
import { IRequiredContext } from './ethr-did-provider.js'
import { IKey } from '@veramo/core-types'
import {Addressable} from "ethers/src.ts/address";

export type Deferrable<T> = {
  [ K in keyof T ]: T[K] | Promise<T[K]>;
}

/**
 * Creates an `ethers` - `signer` implementation by wrapping
 * a veramo agent with a key-manager that should be capable of `eth_signTransaction`
 *
 * @internal This is exported for convenience, not meant to be supported as part of the public API
 */
export class KmsEthereumSigner implements Signer {
  private context: IRequiredContext
  private controllerKey: IKey
  readonly provider: Provider

  constructor(controllerKey: IKey, context: IRequiredContext, provider: Provider) {
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
      // What have I done?!
      let txFrom;
      if(isAddressable(tx.from)) {
        txFrom = await (tx.from as Addressable).getAddress()
      } else {
        txFrom = tx.from
      }
      if (getAddress(await txFrom as string) !== thisAddress) {
        throw new Error(`transaction from address mismatch ${transaction.from} != ${thisAddress}`)
      }
      delete tx.from
    }

    const txObject = new Transaction()
    // get all properties of tx and set them on txObject
    Object.keys(tx).forEach((key) => {
      // TODO: This is a hack, but I wanna try it before
      // @ts-ignore
      txObject[key] = tx[key]
    })

    const signature = await this.context.agent.keyManagerSign({
      keyRef: this.controllerKey.kid,
      data: txObject.serialized,
      algorithm: 'eth_signTransaction',
      encoding: 'base16',
    })
    return signature
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

  call(tx: TransactionRequest): Promise<string> {
    return Promise.reject("");
  }

  estimateGas(tx: TransactionRequest): Promise<bigint> {
    return Promise.reject("");
  }

  getNonce(blockTag?: BlockTag): Promise<number> {
    return Promise.reject("");
  }

  populateCall(tx: TransactionRequest): Promise<TransactionLike<string>> {
    return Promise.reject("");
  }

  populateTransaction(tx: TransactionRequest): Promise<TransactionLike<string>> {
    return Promise.reject("");
  }

  resolveName(name: string): Promise<string | null> {
    return Promise.reject("");
  }

  sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    return Promise.reject("");
  }

  signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
    return Promise.reject("");
  }
}

function isAddressable(address: any): address is Addressable {
  return (address as Addressable).getAddress !== undefined;
}
