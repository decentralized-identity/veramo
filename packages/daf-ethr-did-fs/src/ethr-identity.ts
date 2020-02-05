import { AbstractIdentity, Resolver } from 'daf-core'
import { SimpleSigner } from 'did-jwt'
import * as jose from 'jose'
import { convertECKeyToEthHexKeys } from './daf-jose'

export class EthrIdentity extends AbstractIdentity {
  public readonly did: string
  public readonly identityProviderType: string
  private readonly keyStore: jose.JWKS.KeyStore
  private readonly resolver: Resolver

  constructor(options: {
    identityProviderType: string
    did: string
    keyStore: jose.JWKS.KeyStore
    resolver: Resolver
  }) {
    super()
    this.did = options.did
    this.identityProviderType = options.identityProviderType
    this.keyStore = options.keyStore
    this.resolver = options.resolver
  }

  public signer(keyId?: string) {
    const key = this.keyStore.get({ kty: 'EC', crv: 'secp256k1' }) as jose.JWK.ECKey
    const { hexPrivateKey } = convertECKeyToEthHexKeys(key)
    return SimpleSigner(hexPrivateKey)

    // @TODO: Use jose for signer

    // return async (data: any) => {
    //   const test = jose.JWS.sign(data, key)

    //   console.log(test)

    //   const r = Buffer.from('r')
    //   const s = Buffer.from('s')
    //   const recoveryParam = 1

    //   return {
    //     r: leftpad(r.toString('hex')),
    //     s: leftpad(s.toString('hex')),
    //     recoveryParam
    //   }
    // }
  }

  async didDoc() {
    return this.resolver.resolve(this.did)
  }
  async encrypt(): Promise<any> {}
  async decrypt(): Promise<any> {}
}
