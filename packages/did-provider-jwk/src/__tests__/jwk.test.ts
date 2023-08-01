import { JwkDIDProvider } from '../jwk-did-provider'
import { IDIDManager, IKeyManager } from "@veramo/core-types";
import { createAgent } from '@veramo/core'
import { MemoryKeyStore, MemoryPrivateKeyStore, KeyManager } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { DIDManager, MemoryDIDStore } from "@veramo/did-manager";

const defaultKms = 'memory'
const ionDIDProvider = new JwkDIDProvider({ defaultKms })

const agent = createAgent<IKeyManager & IDIDManager>({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        [defaultKms]: new KeyManagementSystem(new MemoryPrivateKeyStore()),
      },
    }),
    new DIDManager({
      providers: {
        'did:jwk': ionDIDProvider,
      },
      defaultProvider: 'did:jwk',
      store: new MemoryDIDStore(),
    }),
  ],
})
describe('create did:jwk', () => {
  it('Secp256k1', async () => {
    const id = await agent.didManagerCreate({
      options: {
        keyType: 'Secp256k1',
        privateKeyHex: 'a5e81a8cd50cf5c31d5b87db3e153e2817f86de350a60edc2335f76d5c3b4e0d'
      }
    })
    expect(id.did).toEqual('did:jwk:eyJhbGciOiJFUzI1NksiLCJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsInVzZSI6InNpZyIsIngiOiJVNV85NlJMQWxMeEl0a3llNXhzcnJzNGt4eEM4clN4N3JNN1dGZllLNVRrIiwieSI6IlNjM0pVM25yVUZWdEVjc0stckRscHNxTXRIWFVFN0x4SXdmTUxYOVVPTjQifQ')
  })

  it('Ed25519', async () => {
    const id = await agent.didManagerCreate({
      options: {
        keyType: 'Ed25519',
        privateKeyHex: 'a5e81a8cd50cf5c31d5b87db3e153e2817f86de350a60edc2335f76d5c3b4e0d'
      }
    })
    expect(id.did).toEqual('did:jwk:eyJhbGciOiJFZERTQSIsImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ1c2UiOiJzaWciLCJ4IjoiTTNodVJCZnJpU3lHemlJS3pUSE5nS1djSVhuX3IxUzYxRnZBcUQyVmhSUSJ9')
  })

  it('X25519', async () => {
    const id = await agent.didManagerCreate({
      options: {
        keyType: 'X25519',
        privateKeyHex: 'a5e81a8cd50cf5c31d5b87db3e153e2817f86de350a60edc2335f76d5c3b4e0d'
      }
    })
    expect(id.did).toEqual('did:jwk:eyJhbGciOiJFQ0RILUVTIiwiY3J2IjoiWDI1NTE5Iiwia3R5IjoiT0tQIiwidXNlIjoiZW5jIiwieCI6IlVuNFNEWk12R2dReENiZkRBOWpwNjlyNDdvVWdsSF93eU1aRjU2THAwbU0ifQ')
  })

  it('Secp256r1', async () => {
    const id = await agent.didManagerCreate({
      options: {
        keyType: 'Secp256r1',
        privateKeyHex: 'a5e81a8cd50cf5c31d5b87db3e153e2817f86de350a60edc2335f76d5c3b4e0d'
      }
    })
    expect(id.did).toEqual('did:jwk:eyJhbGciOiJFUzI1NiIsImNydiI6IlAtMjU2Iiwia3R5IjoiRUMiLCJ1c2UiOiJzaWciLCJ4IjoiejhTTlNYTVgxUjZlVEt6SkdtLUE3ZWpBZkZsdURsaUhKdW9nT2FQc0REUSIsInkiOiJLUUtBTWVwTU56dHJseTB6ODI3MTg0dDRQdkFuU0lULW1MMFFsaUg1enU0In0')
  })
})
