import { JwkDIDProvider } from '../jwk-did-provider'
import { getDidJwkResolver } from '../resolver'
import { IDIDManager, IKeyManager, IResolver } from '@veramo/core-types'
import { createAgent } from '@veramo/core'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { DIDResolverPlugin } from '@veramo/did-resolver'

const defaultKms = 'memory'
const jwkDIDProvider = new JwkDIDProvider({ defaultKms })

const agent = createAgent<IKeyManager & IDIDManager & IResolver>({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        [defaultKms]: new KeyManagementSystem(new MemoryPrivateKeyStore()),
      },
    }),
    new DIDManager({
      providers: {
        'did:jwk': jwkDIDProvider,
      },
      defaultProvider: 'did:jwk',
      store: new MemoryDIDStore(),
    }),
    new DIDResolverPlugin({
      ...getDidJwkResolver(),
    }),
  ],
})
describe('create did:jwk', () => {
  it('Secp256k1', async () => {
    const id = await agent.didManagerCreate({
      options: {
        keyType: 'Secp256k1',
        privateKeyHex: 'a5e81a8cd50cf5c31d5b87db3e153e2817f86de350a60edc2335f76d5c3b4e0d',
      },
    })
    expect(id.did).toEqual(
      'did:jwk:eyJhbGciOiJFUzI1NksiLCJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsInVzZSI6InNpZyIsIngiOiJVNV85NlJMQWxMeEl0a3llNXhzcnJzNGt4eEM4clN4N3JNN1dGZllLNVRrIiwieSI6IlNjM0pVM25yVUZWdEVjc0stckRscHNxTXRIWFVFN0x4SXdmTUxYOVVPTjQifQ',
    )
  })

  it('Ed25519', async () => {
    const id = await agent.didManagerCreate({
      options: {
        keyType: 'Ed25519',
        privateKeyHex: 'a5e81a8cd50cf5c31d5b87db3e153e2817f86de350a60edc2335f76d5c3b4e0d',
      },
    })
    expect(id.did).toEqual(
      'did:jwk:eyJhbGciOiJFZERTQSIsImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ1c2UiOiJzaWciLCJ4IjoiTTNodVJCZnJpU3lHemlJS3pUSE5nS1djSVhuX3IxUzYxRnZBcUQyVmhSUSJ9',
    )
  })

  it('X25519', async () => {
    const id = await agent.didManagerCreate({
      options: {
        keyType: 'X25519',
        privateKeyHex: 'a5e81a8cd50cf5c31d5b87db3e153e2817f86de350a60edc2335f76d5c3b4e0d',
      },
    })
    expect(id.did).toEqual(
      'did:jwk:eyJhbGciOiJFQ0RILUVTIiwiY3J2IjoiWDI1NTE5Iiwia3R5IjoiT0tQIiwidXNlIjoiZW5jIiwieCI6IlVuNFNEWk12R2dReENiZkRBOWpwNjlyNDdvVWdsSF93eU1aRjU2THAwbU0ifQ',
    )
  })

  it('Secp256r1', async () => {
    const id = await agent.didManagerCreate({
      options: {
        keyType: 'Secp256r1',
        privateKeyHex: 'a5e81a8cd50cf5c31d5b87db3e153e2817f86de350a60edc2335f76d5c3b4e0d',
      },
    })
    expect(id.did).toEqual(
      'did:jwk:eyJhbGciOiJFUzI1NiIsImNydiI6IlAtMjU2Iiwia3R5IjoiRUMiLCJ1c2UiOiJzaWciLCJ4IjoiejhTTlNYTVgxUjZlVEt6SkdtLUE3ZWpBZkZsdURsaUhKdW9nT2FQc0REUSIsInkiOiJLUUtBTWVwTU56dHJseTB6ODI3MTg0dDRQdkFuU0lULW1MMFFsaUg1enU0In0',
    )
  })
})

describe('resolve did:jwk', () => {
  it('should resolve Secp256k1', async () => {
    const did =
      'did:jwk:eyJhbGciOiJFUzI1NksiLCJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsInVzZSI6InNpZyIsIngiOiJVNV85NlJMQWxMeEl0a3llNXhzcnJzNGt4eEM4clN4N3JNN1dGZllLNVRrIiwieSI6IlNjM0pVM25yVUZWdEVjc0stckRscHNxTXRIWFVFN0x4SXdmTUxYOVVPTjQifQ'
    const result = await agent.resolveDid({ didUrl: did })

    expect(result.didDocument).toEqual({
      id: did,
      '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
      verificationMethod: [
        {
          id: `${did}#0`,
          type: 'JsonWebKey2020',
          controller: did,
          publicKeyJwk: {
            alg: 'ES256K',
            crv: 'secp256k1',
            kty: 'EC',
            use: 'sig',
            x: 'U5_96RLAlLxItkye5xsrrs4kxxC8rSx7rM7WFfYK5Tk',
            y: 'Sc3JU3nrUFVtEcsK-rDlpsqMtHXUE7LxIwfMLX9UON4',
          },
        },
      ],
      assertionMethod: [`${did}#0`],
      authentication: [`${did}#0`],
      capabilityInvocation: [`${did}#0`],
      capabilityDelegation: [`${did}#0`],
    })
  })

  it('should resolve P-256', async () => {
    const did =
      'did:jwk:eyJhbGciOiJFUzI1NiIsImNydiI6IlAtMjU2Iiwia3R5IjoiRUMiLCJ1c2UiOiJzaWciLCJ4IjoiejhTTlNYTVgxUjZlVEt6SkdtLUE3ZWpBZkZsdURsaUhKdW9nT2FQc0REUSIsInkiOiJLUUtBTWVwTU56dHJseTB6ODI3MTg0dDRQdkFuU0lULW1MMFFsaUg1enU0In0'
    const result = await agent.resolveDid({ didUrl: did })

    expect(result.didDocument).toEqual({
      id: did,
      '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
      verificationMethod: [
        {
          id: `${did}#0`,
          type: 'JsonWebKey2020',
          controller: did,
          publicKeyJwk: {
            alg: 'ES256',
            crv: 'P-256',
            kty: 'EC',
            use: 'sig',
            x: 'z8SNSXMX1R6eTKzJGm-A7ejAfFluDliHJuogOaPsDDQ',
            y: 'KQKAMepMNztrly0z827184t4PvAnSIT-mL0QliH5zu4',
          },
        },
      ],
      assertionMethod: [`${did}#0`],
      authentication: [`${did}#0`],
      capabilityInvocation: [`${did}#0`],
      capabilityDelegation: [`${did}#0`],
    })
  })

  it('should resolve Ed25519', async () => {
    const did =
      'did:jwk:eyJhbGciOiJFZERTQSIsImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ1c2UiOiJzaWciLCJ4IjoiTTNodVJCZnJpU3lHemlJS3pUSE5nS1djSVhuX3IxUzYxRnZBcUQyVmhSUSJ9'
    const result = await agent.resolveDid({ didUrl: did })

    expect(result.didDocument).toEqual({
      id: did,
      '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
      verificationMethod: [
        {
          id: `${did}#0`,
          type: 'JsonWebKey2020',
          controller: did,
          publicKeyJwk: {
            alg: 'EdDSA',
            crv: 'Ed25519',
            kty: 'OKP',
            use: 'sig',
            x: 'M3huRBfriSyGziIKzTHNgKWcIXn_r1S61FvAqD2VhRQ',
          },
        },
      ],
      assertionMethod: [`${did}#0`],
      authentication: [`${did}#0`],
      capabilityInvocation: [`${did}#0`],
      capabilityDelegation: [`${did}#0`],
    })
  })

  it('should resolve X25519', async () => {
    const did =
      'did:jwk:eyJhbGciOiJFQ0RILUVTIiwiY3J2IjoiWDI1NTE5Iiwia3R5IjoiT0tQIiwidXNlIjoiZW5jIiwieCI6IlVuNFNEWk12R2dReENiZkRBOWpwNjlyNDdvVWdsSF93eU1aRjU2THAwbU0ifQ'
    const result = await agent.resolveDid({ didUrl: did })

    expect(result.didDocument).toEqual({
      id: did,
      '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
      verificationMethod: [
        {
          id: `${did}#0`,
          type: 'JsonWebKey2020',
          controller: did,
          publicKeyJwk: {
            alg: 'ECDH-ES',
            crv: 'X25519',
            kty: 'OKP',
            use: 'enc',
            x: 'Un4SDZMvGgQxCbfDA9jp69r47oUglH_wyMZF56Lp0mM',
          },
        },
      ],
      keyAgreement: [`${did}#0`],
    })
  })
})
