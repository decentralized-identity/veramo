import Debug from 'debug'
import { AbstractIdentityProvider, AbstractIdentity } from 'daf-core'
const debug = Debug('daf:ethr-did-metamask:identity-provider')

declare global {
  interface Window {
    ethereum: any
  }
}

export class MetamaskIdentity extends AbstractIdentity {
  public readonly did: string
  public readonly identityProviderType: string
  private readonly sign: any

  constructor(options: { identityProviderType: string; did: string; sign: any }) {
    super()
    this.did = options.did
    this.identityProviderType = options.identityProviderType
    this.sign = options.sign
  }

  public signer(keyId?: string) {
    return this.sign
  }

  async didDoc() {
    return Promise.reject('not implemented')
  }
  async encrypt(): Promise<any> {
    return Promise.reject('not implemented')
  }
  async decrypt(): Promise<any> {
    return Promise.reject('not implemented')
  }
}

export class IdentityProvider extends AbstractIdentityProvider {
  static snapId = ''
  public type = 'ethr-did-metamask'
  public description = 'metamask snap identity'

  async getIdentities() {
    try {
      const identity = await this.getIdentity(await this.getDidFromMetamask())
      return [identity]
    } catch (e) {
      debug(e)
      return []
    }
  }

  async getIdentity(did: string) {
    const metamaskDid = await this.getDidFromMetamask()

    if (did !== metamaskDid) {
      return Promise.reject('Did not found: ' + did)
    }

    const address = await this.getAddressFromMetamask()

    const identity = new MetamaskIdentity({
      did: metamaskDid,
      sign: this.signer,
      identityProviderType: this.type,
    })
    return identity
  }

  private async signer(data: string): Promise<any> {
    try {
      return await window.ethereum.send({
        method: 'wallet_invokePlugin',
        params: [
          IdentityProvider.snapId,
          {
            method: 'sign',
            params: [data],
          },
        ],
      })
    } catch (e) {
      debug(e)
      return Promise.reject()
    }
  }

  private async getDidFromMetamask(): Promise<string> {
    const address = await this.getAddressFromMetamask()
    return 'did:ethr:' + address
  }

  private async getAddressFromMetamask(): Promise<string> {
    return await window.ethereum.send({
      method: 'wallet_invokePlugin',
      params: [
        IdentityProvider.snapId,
        {
          method: 'address',
        },
      ],
    })
  }

  async createIdentity() {
    try {
      await window.ethereum.send({
        method: 'wallet_enable',
        params: [
          {
            wallet_plugin: { [IdentityProvider.snapId]: {} },
          },
        ],
      })

      const did = await this.getDidFromMetamask()
      debug('Created', did)

      return this.getIdentity(did)
    } catch (e) {
      debug(e)
      return Promise.reject('Metamask plugin not enabled')
    }
  }

  async deleteIdentity(did: string) {
    return Promise.reject('not impemented')
  }
}
