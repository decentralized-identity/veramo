import { TransactionRequest, Web3Provider } from '@ethersproject/providers'
import {
  TKeyType,
  IKey,
  ManagedKeyInfo,
  MinimalImportableKey,
} from '@veramo/core'
import { AbstractKeyManagementSystem, AbstractKeyStore } from '@veramo/key-manager'
import { toUtf8String } from '@ethersproject/strings'
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { parse } from '@ethersproject/transactions'
// import Debug from 'debug'
// const debug = Debug('veramo:kms:web3')

type Eip712Payload = {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  primaryType: string
  message: Record<string, any>
}

export class Web3KeyManagementSystem extends AbstractKeyManagementSystem {
  constructor(private providers: Record<string, Web3Provider>, private keyStore: AbstractKeyStore) {
    super()
  }

  createKey({ type }: { type: TKeyType }): Promise<ManagedKeyInfo> {
    throw Error('not_supported: Web3KeyManagementSystem cannot create new keys')
  }

  async importKey(
    args: Omit<MinimalImportableKey, 'kms'>,
  ): Promise<ManagedKeyInfo> {
    // throw Error('Not implemented')
    return args as any as ManagedKeyInfo
  }

  async listKeys(): Promise<ManagedKeyInfo[]> {
    throw Error('not_implemented: Web3KeyManagementSystem listKeys')
  }

  async sharedSecret(args: {
    myKeyRef: Pick<IKey, 'kid'>
    theirKey: Pick<IKey, 'type' | 'publicKeyHex'>
  }): Promise<string> {
    throw Error('not_implemented: Web3KeyManagementSystem sharedSecret')
  }

  async deleteKey(args: { kid: string }) {
    // this kms doesn't need to delete keys
    return true
  }

  async sign({
    keyRef,
    algorithm,
    data,
  }: {
    keyRef: Pick<IKey, 'kid'>
    algorithm?: string
    data: Uint8Array
  }): Promise<string> {
    
    let key: IKey
    try {
      key = await this.keyStore.get({ kid: keyRef.kid })
    } catch (e) {
      throw new Error(`key_not_found: No key entry found for kid=${keyRef.kid}`)
    }

    if (algorithm) {
      if (algorithm === 'eth_signMessage') {
        return await this.eth_signMessage(key, data)
      } else if (
        ['eth_signTypedData', 'EthereumEip712Signature2021'].includes(algorithm)
      ) {
        return await this.eth_signTypedData(key, data)
      }
    }

    throw Error(`not_supported: Cannot sign ${algorithm} `)
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed EIP712 data
   */
  private async eth_signTypedData(key: IKey, data: Uint8Array) {
    let msg, msgDomain, msgTypes
    const serializedData = toUtf8String(data)
    try {
      const jsonData = JSON.parse(serializedData) as Eip712Payload
      if (
        typeof jsonData.domain === 'object' &&
        typeof jsonData.types === 'object'
      ) {
        const { domain, types, message } = jsonData
        msg = message
        msgDomain = domain
        msgTypes = types
      } else {
        // next check will throw since the data couldn't be parsed
      }
    } catch (e) {
      // next check will throw since the data couldn't be parsed
    }
    if (
      typeof msgDomain !== 'object' ||
      typeof msgTypes !== 'object' ||
      typeof msg !== 'object'
    ) {
      throw Error(
        `invalid_arguments: Cannot sign typed data. 'domain', 'types', and 'message' must be provided`,
      )
    }

    const signature = await this.providers[key.meta?.provider]
      .getSigner()
      ._signTypedData(msgDomain, msgTypes, msg)
    return signature
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed message
   */
  private async eth_signMessage(key: IKey, rawMessageBytes: Uint8Array) {
    const signature = await this.providers[key.meta?.provider]
      .getSigner()
      .signMessage(rawMessageBytes)
    // HEX encoded string, 0x prefixed
    return signature
  }

}
