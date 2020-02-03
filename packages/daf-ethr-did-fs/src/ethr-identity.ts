import { AbstractIdentity, Resolver } from 'daf-core'
import { SimpleSigner } from 'did-jwt'

export class EthrIdentity extends AbstractIdentity {
  public readonly did: string
  public readonly identityProviderType: string
  private readonly privateKey: string
  private readonly resolver: Resolver

  constructor(options: {
    identityProviderType: string
    did: string
    address: string
    privateKey: string
    resolver: Resolver
    rpcUrl: string
  }) {
    super()
    this.did = options.did
    this.identityProviderType = options.identityProviderType
    this.privateKey = options.privateKey
    this.resolver = options.resolver
  }

  public signer(keyId?: string) {
    return SimpleSigner(this.privateKey)
  }

  async didDoc() {
    return this.resolver.resolve(this.did)
  }
  async encrypt(): Promise<any> {}
  async decrypt(): Promise<any> {}
}
