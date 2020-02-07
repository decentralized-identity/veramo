import { AbstractIdentity, Resolver } from 'daf-core'
import { SimpleSigner } from 'did-jwt'
import { Key } from './identity-provider'

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
    if (!key) throw Error('[ethr-identity] Key not found')
    return SimpleSigner(key.privateKey)
  }

  async didDoc() {
    return this.resolver.resolve(this.did)
  }
  async encrypt(): Promise<any> {}
  async decrypt(): Promise<any> {}
}
