import { AbstractIdentity, Resolver } from 'daf-core'
import { SimpleSigner } from 'did-jwt'
import { sign } from 'ethjs-signer'
const SignerProvider = require('ethjs-provider-signer')
const EthrDID = require('ethr-did')

export class EthrIdentity extends AbstractIdentity {
  public readonly did: string
  public readonly identityProviderType: string
  private readonly address: string
  private readonly privateKey: string
  private readonly provider: any
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
    this.address = options.address
    this.privateKey = options.privateKey
    this.resolver = options.resolver

    this.provider = new SignerProvider(options.rpcUrl, {
      signTransaction: (rawTx: any, cb: any) => cb(null, sign(rawTx, '0x' + options.privateKey)),
    })
  }

  public signer(keyId?: string) {
    return SimpleSigner(this.privateKey)
  }

  async didDoc() {
    return this.resolver.resolve(this.did)
  }
  async encrypt(): Promise<any> {}
  async decrypt(): Promise<any> {}

  async addService(service: { id: string; type: string; serviceEndpoint: string }): Promise<any> {
    const ethrDid = new EthrDID({ address: this.address, provider: this.provider })
    return ethrDid.setAttribute('did/svc/' + service.type, service.serviceEndpoint, 86400, 100000)
  }
}
