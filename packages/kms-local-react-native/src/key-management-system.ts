import { TKeyType, IKey } from '@veramo/core'
import { AbstractKeyManagementSystem } from '@veramo/key-manager'
import sodium from 'libsodium-wrappers'
import { EdDSASigner, ES256KSigner } from 'did-jwt'
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { TransactionRequest } from '@ethersproject/abstract-provider'
import { toUtf8String } from '@ethersproject/strings'
import { parse } from '@ethersproject/transactions'
import { Wallet } from '@ethersproject/wallet'
import { DIDComm } from './didcomm'
const didcomm = new DIDComm()
import Debug from 'debug'
const debug = Debug('veramo:react-native-libsodium:kms')

export class KeyManagementSystem extends AbstractKeyManagementSystem {
  async createKey({ type }: { type: TKeyType }): Promise<Omit<IKey, 'kms'>> {
    let key: Omit<IKey, 'kms'>

    switch (type) {
      case 'Ed25519':
        await sodium.ready
        const keyPairEd25519 = sodium.crypto_sign_keypair()
        key = {
          type,
          kid: Buffer.from(keyPairEd25519.publicKey).toString('hex'),
          publicKeyHex: Buffer.from(keyPairEd25519.publicKey).toString('hex'),
          privateKeyHex: Buffer.from(keyPairEd25519.privateKey).toString('hex'),
          meta: {
            algorithms: ['Ed25519', 'EdDSA'],
          },
        }
        break
      case 'Secp256k1':
        const keyPair = Wallet.createRandom()._signingKey()
        const publicKeyHex = keyPair.publicKey.substring(2)
        const privateKeyHex = keyPair.privateKey.substring(2)
        key = {
          type,
          kid: publicKeyHex,
          publicKeyHex,
          privateKeyHex,
          meta: {
            algorithms: ['ES256K', 'ES256K-R', 'eth_signTransaction', 'eth_signTypedData', 'eth_signMessage'],
          },
        }
        break
      default:
        throw Error('Key type not supported: ' + type)
    }

    debug('Created key', type, key.publicKeyHex)

    return key
  }

  async deleteKey(args: { kid: string }) {
    // this kms doesn't need to delete keys
    return true
  }

  async encryptJWE({ key, to, data }: { key: IKey; to: IKey; data: string }): Promise<string> {
    await didcomm.ready
    return await didcomm.pack_anon_msg_for_recipients(data, [
      Uint8Array.from(Buffer.from(to.publicKeyHex, 'hex')),
    ])
  }

  async decryptJWE({ key, data }: { key: IKey; data: string }): Promise<string> {
    if (!key.privateKeyHex) throw Error('No private key')

    await didcomm.ready
    const unpackMessage = await didcomm.unpackMessage(data, {
      keyType: 'ed25519',
      publicKey: Uint8Array.from(Buffer.from(key.publicKeyHex, 'hex')),
      privateKey: Uint8Array.from(Buffer.from(key.privateKeyHex, 'hex')),
    })

    return unpackMessage.message
  }

  async sign({
    key,
    alg,
    data,
    extras,
  }: {
    key: IKey
    alg?: string
    data: Uint8Array
    extras?: KMSSignerExtras
  }): Promise<string> {
    //FIXME: KMS implementation should not rely on private keys being provided, but rather manage their own keys
    if (!key.privateKeyHex) throw Error('No private key for kid: ' + key.kid)

    if (key.type === 'Ed25519' && (typeof alg === 'undefined' || ['Ed25519', 'EdDSA'].includes(alg))) {
      const signer = EdDSASigner(key.privateKeyHex)
      const signature = await signer(data)
      //base64url encoded string
      return signature as string
    } else if (key.type === 'Secp256k1') {
      if (typeof alg === 'undefined' || ['ES256K', 'ES256K-R'].includes(alg)) {
        const signer = ES256KSigner(key.privateKeyHex, alg === 'ES256K-R')
        const signature = await signer(data)
        //base64url encoded string
        return signature as string
      } else if (['eth_signTransaction', 'signTransaction', 'signTx'].includes(alg)) {
        const { v, r, s, type, ...tx } = parse(data)
        const wallet = new Wallet(key.privateKeyHex)
        const signedRawTransaction = await wallet.signTransaction(<TransactionRequest>tx)
        //HEX encoded string, 0x prefixed
        return signedRawTransaction
      } else if (alg === 'eth_signMessage') {
        const wallet = new Wallet(key.privateKeyHex)
        const signature = await wallet.signMessage(data)
        //HEX encoded string, 0x prefixed
        return signature
      } else if (['eth_signTypedData', 'EthereumEip712Signature2021'].includes(alg)) {
        let msg, msgDomain, msgTypes
        const serializedData = toUtf8String(data)
        let jsonData = JSON.parse(serializedData)
        if (typeof jsonData.domain === 'object' && typeof jsonData.types === 'object') {
          const { domain = undefined, types = undefined, message = undefined } = { ...extras, ...jsonData }
          msg = message || jsonData
          msgDomain = domain
          msgTypes = types
        }
        if (typeof msgDomain !== 'object' || typeof msgTypes !== 'object') {
          throw Error(`invalid_arguments: Cannot sign typed data. 'domain' and 'types' must be provided`)
        }
        const wallet = new Wallet(key.privateKeyHex)

        const signature = await wallet._signTypedData(msgDomain, msgTypes, msg)
        //HEX encoded string
        return signature
      }
    }
    throw Error(`not_supported: Cannot sign ${alg} using key of type ${key.type}`)
  }
}

interface KMSSignerExtras {
  domain?: TypedDataDomain
  types?: Record<string, TypedDataField[]>
  transaction?: TransactionRequest
  [x: string]: any
}
