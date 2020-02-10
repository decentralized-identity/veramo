import { AbstractIdentity, Resolver } from 'daf-core'
import { SimpleSigner } from 'did-jwt'
import { Key } from './identity-provider'
import { DIDComm } from 'DIDComm-js'
const didcomm = new DIDComm()

export class EthrIdentity extends AbstractIdentity {
  public readonly did: string
  public readonly identityProviderType: string
  private readonly keys: Key[]
  private readonly resolver: Resolver

  constructor(options: { identityProviderType: string; did: string; keys: Key[]; resolver: Resolver }) {
    super()
    this.did = options.did
    this.identityProviderType = options.identityProviderType
    this.keys = options.keys
    this.resolver = options.resolver
  }

  public signer(keyId?: string) {
    const key = this.keys.find(item => item.type === 'Secp256k1')
    if (!key) throw Error('Key not found')
    return SimpleSigner(key.privateKey)
  }

  async didDoc() {
    return this.resolver.resolve(this.did)
  }
  async encrypt(to: string, data: string): Promise<any> {
    const didDoc = await this.resolver.resolve(to)
    const publicKey = didDoc?.publicKey.find(item => item.type == 'Ed25519VerificationKey2018')
    if (publicKey?.publicKeyHex) {
      await didcomm.ready
      return await didcomm.pack_anon_msg_for_recipients(data, [
        Uint8Array.from(Buffer.from(publicKey.publicKeyHex, 'hex')),
      ])
    } else {
      return Promise.reject('Encryption public key not found for ' + to)
    }
  }
  async decrypt(encrypted: string): Promise<string> {
    const key = this.keys.find(item => item.type === 'Ed25519')
    if (!key) throw Error('Encryption key not found for ' + this.did)
    await didcomm.ready
    try {
      const unpackMessage = await didcomm.unpackMessage(encrypted, {
        keyType: 'ed25519',
        publicKey: Uint8Array.from(Buffer.from(key.publicKey, 'hex')),
        privateKey: Uint8Array.from(Buffer.from(key.privateKey, 'hex')),
      })

      return unpackMessage.message
    } catch (e) {
      return Promise.reject('Error: ' + e.message)
    }
  }
}
