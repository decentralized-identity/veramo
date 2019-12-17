import Debug from 'debug'
import { IdentityController, Issuer } from 'daf-core'
const debug = Debug('daf:ethr-did-metamask:identity-controller')

declare global {
  interface Window {
    ethereum: any
  }
}
export class EthrDidMetamaskController implements IdentityController {
  static snapId = ''
  public type = 'ethr-did-metamask'

  async listDids() {
    const did = await this.getDidFromMetamask()
    return [did]
  }

  async listIssuers() {
    try {
      const issuer = await this.issuer(await this.getDidFromMetamask())
      return [issuer]
    } catch (e) {
      debug(e)
      return []
    }
  }

  async issuer(did: string) {
    const metamaskDid = await this.getDidFromMetamask()

    if (did !== metamaskDid) {
      return Promise.reject('Did not found: ' + did)
    }

    const address = await this.getAddressFromMetamask()

    const issuer: Issuer = {
      did: metamaskDid,
      signer: this.signer,
      type: this.type,
      ethereumAddress: address,
    }
    return issuer
  }

  private async signer(data: string): Promise<any> {
    try {
      return await window.ethereum.send({
        method: 'wallet_invokePlugin',
        params: [
          EthrDidMetamaskController.snapId,
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
        EthrDidMetamaskController.snapId,
        {
          method: 'address',
        },
      ],
    })
  }

  async create() {
    try {
      await window.ethereum.send({
        method: 'wallet_enable',
        params: [
          {
            wallet_plugin: { [EthrDidMetamaskController.snapId]: {} },
          },
        ],
      })

      const did = await this.getDidFromMetamask()
      debug('Created', did)

      return did
    } catch (e) {
      debug(e)
      return Promise.reject('Metamask plugin not enabled')
    }
  }

  async delete(did: string) {
    debug('Delete not supported')
    return Promise.reject('Delete not supported ')
  }
}
