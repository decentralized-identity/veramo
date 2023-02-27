import { AbstractKeyStore } from '../abstract-key-store.js'
import { IKey, ManagedKeyInfo } from '@veramo/core-types'

class MockKeyStore extends AbstractKeyStore {
  async listKeys(args: {}): Promise<ManagedKeyInfo[]> {
    return [
      {
        kid: '',
        kms: '',
        type: 'Ed25519',
        publicKeyHex: '',
      },
    ]
  }
  async getKey({ kid }: { kid: string }): Promise<IKey> {
    return {
      kid: '',
      kms: '',
      type: 'Ed25519',
      publicKeyHex: '',
    }
  }

  async deleteKey({ kid }: { kid: string }) {
    return true
  }

  async importKey(args: IKey): Promise<boolean> {
    return true
  }
}

describe('core AbstractKeyStore compile time error checking', () => {
  it.todo('call mock methods')
})
