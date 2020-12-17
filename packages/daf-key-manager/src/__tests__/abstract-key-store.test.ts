import { AbstractKeyStore } from '../abstract-key-store'
import { IKey } from '@veramo/core'

class MockKeyStore extends AbstractKeyStore {
  async get({ kid }: { kid: string }): Promise<IKey> {
    return {
      kid: '',
      kms: '',
      type: 'Ed25519',
      publicKeyHex: '',
    }
  }

  async delete({ kid }: { kid: string }) {
    return true
  }

  async import(args: IKey): Promise<boolean> {
    return true
  }
}

describe('core AbstractKeyStore compile time error checking', () => {
  it.todo('call mock methods')
})
