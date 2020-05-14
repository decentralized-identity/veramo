import { AbstractIdentityStore, SerializedIdentity } from 'daf-core'
import Debug from 'debug'
const debug = Debug('daf:meta-mask:identity-store')

declare global {
  interface Window {
    ethereum: any
  }
}

interface StorageContents {
  [did: string]: SerializedIdentity
}

export class IdentityStore extends AbstractIdentityStore {
  constructor(private type: string, private snapId: string) {
    super()
  }

  // @ts-ignore
  async get(did: string) {
    return await this.getDidFromMetamask()
  }

  async delete(did: string) {
    return Promise.reject('Not implemented')
  }

  async set(did: string, serializedIdentity: SerializedIdentity) {
    return Promise.reject('Not implemented')
  }

  async listDids() {
    const did = await this.getDidFromMetamask()
    return [did]
  }

  private async getDidFromMetamask(): Promise<string> {
    const address = await this.getAddressFromMetamask()
    return 'did:ethr:' + address
  }

  private async getAddressFromMetamask(): Promise<string> {
    return await window.ethereum.send({
      method: 'wallet_invokePlugin',
      params: [
        this.snapId,
        {
          method: 'address',
        },
      ],
    })
  }
}
