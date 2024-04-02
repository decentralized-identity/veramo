import { Resolver } from 'did-resolver'
import { getDidKeyResolver } from '../resolver.js'

const resolver = new Resolver(getDidKeyResolver())

describe('did:key resolver', () => {
  describe('Ed25519', () => {
    it('should resolve with defaults', async () => {
      const sigMultibase = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
      const encMultibase = 'z6LSj72tK8brWgZja8NLRwPigth2T9QRiG1uH9oKZuKjdh9p'
      const did = `did:key:${sigMultibase}`
      const result = await resolver.resolve(did)

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${sigMultibase}`,
              type: 'JsonWebKey2020',
              controller: did,
              publicKeyJwk: {
                alg: 'EdDSA',
                crv: 'Ed25519',
                kty: 'OKP',
                use: 'sig',
                x: 'Lm_M42cB3HkUiODQsXRcweM6TByfzEHGO9ND274JcOY',
              },
            },
            {
              id: `${did}#${encMultibase}`,
              type: 'JsonWebKey2020',
              controller: did,
              publicKeyJwk: {
                alg: 'ECDH-ES',
                crv: 'X25519',
                kty: 'OKP',
                use: 'enc',
                x: 'bl_3kgKpz9jgsg350CNuHa_kQL3B60Gi-98WmdQW2h8',
              },
            },
          ],
          authentication: [`${did}#${sigMultibase}`],
          assertionMethod: [`${did}#${sigMultibase}`],
          capabilityDelegation: [`${did}#${sigMultibase}`],
          capabilityInvocation: [`${did}#${sigMultibase}`],
          keyAgreement: [`${did}#${encMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })

    it('should resolve with Multikey', async () => {
      const sigMultibase = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
      const encMultibase = 'z6LSj72tK8brWgZja8NLRwPigth2T9QRiG1uH9oKZuKjdh9p'
      const did = `did:key:${sigMultibase}`
      const result = await resolver.resolve(did, { publicKeyFormat: 'Multikey' })

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${sigMultibase}`,
              type: 'Multikey',
              controller: did,
              publicKeyMultibase: sigMultibase,
            },
            {
              id: `${did}#${encMultibase}`,
              type: 'Multikey',
              controller: did,
              publicKeyMultibase: encMultibase,
            },
          ],
          authentication: [`${did}#${sigMultibase}`],
          assertionMethod: [`${did}#${sigMultibase}`],
          capabilityDelegation: [`${did}#${sigMultibase}`],
          capabilityInvocation: [`${did}#${sigMultibase}`],
          keyAgreement: [`${did}#${encMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/multikey/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })

    it('should resolve with 2020 suite', async () => {
      const sigMultibase = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
      const encMultibase = 'z6LSj72tK8brWgZja8NLRwPigth2T9QRiG1uH9oKZuKjdh9p'
      const did = `did:key:${sigMultibase}`
      const result = await resolver.resolve(did, { publicKeyFormat: 'Ed25519VerificationKey2020' })

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${sigMultibase}`,
              type: 'Ed25519VerificationKey2020',
              controller: did,
              publicKeyMultibase: sigMultibase,
            },
            {
              id: `${did}#${encMultibase}`,
              type: 'X25519KeyAgreementKey2020',
              controller: did,
              publicKeyMultibase: encMultibase,
            },
          ],
          authentication: [`${did}#${sigMultibase}`],
          assertionMethod: [`${did}#${sigMultibase}`],
          capabilityDelegation: [`${did}#${sigMultibase}`],
          capabilityInvocation: [`${did}#${sigMultibase}`],
          keyAgreement: [`${did}#${encMultibase}`],
          '@context': [
            'https://www.w3.org/ns/did/v1',
            'https://w3id.org/security/suites/ed25519-2020/v1',
            'https://w3id.org/security/suites/x25519-2020/v1',
          ],
        },
      }

      expect(result).toEqual(expectedResult)
    })

    it('should resolve with 2018 suite', async () => {
      const sigMultibase = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
      const encMultibase = 'z6LSj72tK8brWgZja8NLRwPigth2T9QRiG1uH9oKZuKjdh9p'
      const did = `did:key:${sigMultibase}`
      const result = await resolver.resolve(did, { publicKeyFormat: 'Ed25519VerificationKey2018' })

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${sigMultibase}`,
              type: 'Ed25519VerificationKey2018',
              controller: did,
              publicKeyBase58: '48GdbJyVULjHDaBNS6ct9oAGtckZUS5v8asrPzvZ7R1w',
            },
            {
              id: `${did}#${encMultibase}`,
              type: 'X25519KeyAgreementKey2019',
              controller: did,
              publicKeyBase58: '8RrinpnzRDqzUjzZuHsmNJUYbzsK1eqkQB5e5SgCvKP4',
            },
          ],
          authentication: [`${did}#${sigMultibase}`],
          assertionMethod: [`${did}#${sigMultibase}`],
          capabilityDelegation: [`${did}#${sigMultibase}`],
          capabilityInvocation: [`${did}#${sigMultibase}`],
          keyAgreement: [`${did}#${encMultibase}`],
          '@context': [
            'https://www.w3.org/ns/did/v1',
            'https://w3id.org/security/suites/ed25519-2018/v1',
            'https://w3id.org/security/suites/x25519-2019/v1',
          ],
        },
      }

      expect(result).toEqual(expectedResult)
    })
  })

  describe('X25519', () => {
    it('should resolve with defaults', async () => {
      const encMultibase = 'z6LSj72tK8brWgZja8NLRwPigth2T9QRiG1uH9oKZuKjdh9p'
      const did = `did:key:${encMultibase}`
      const result = await resolver.resolve(did)

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${encMultibase}`,
              type: 'JsonWebKey2020',
              controller: did,
              publicKeyJwk: {
                alg: 'ECDH-ES',
                crv: 'X25519',
                kty: 'OKP',
                use: 'enc',
                x: 'bl_3kgKpz9jgsg350CNuHa_kQL3B60Gi-98WmdQW2h8',
              },
            },
          ],
          keyAgreement: [`${did}#${encMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })

    it('should resolve with Multikey', async () => {
      const encMultibase = 'z6LSj72tK8brWgZja8NLRwPigth2T9QRiG1uH9oKZuKjdh9p'
      const did = `did:key:${encMultibase}`
      const result = await resolver.resolve(did, { publicKeyFormat: 'Multikey' })

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${encMultibase}`,
              type: 'Multikey',
              controller: did,
              publicKeyMultibase: encMultibase,
            },
          ],
          keyAgreement: [`${did}#${encMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/multikey/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })

    it('should resolve with 2020 suite', async () => {
      const encMultibase = 'z6LSj72tK8brWgZja8NLRwPigth2T9QRiG1uH9oKZuKjdh9p'
      const did = `did:key:${encMultibase}`
      const result = await resolver.resolve(did, { publicKeyFormat: 'X25519KeyAgreementKey2020' })

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${encMultibase}`,
              type: 'X25519KeyAgreementKey2020',
              controller: did,
              publicKeyMultibase: encMultibase,
            },
          ],
          keyAgreement: [`${did}#${encMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/x25519-2020/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })

    it('should resolve with 2019 suite', async () => {
      const encMultibase = 'z6LSj72tK8brWgZja8NLRwPigth2T9QRiG1uH9oKZuKjdh9p'
      const did = `did:key:${encMultibase}`
      const result = await resolver.resolve(did, { publicKeyFormat: 'X25519KeyAgreementKey2019' })

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${encMultibase}`,
              type: 'X25519KeyAgreementKey2019',
              controller: did,
              publicKeyBase58: '8RrinpnzRDqzUjzZuHsmNJUYbzsK1eqkQB5e5SgCvKP4',
            },
          ],
          keyAgreement: [`${did}#${encMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/x25519-2019/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })
  })

  describe('Secp256k1', () => {
    it('should resolve with defaults', async () => {
      const sigMultibase = 'zQ3shokFTS3brHcDQrn82RUDfCZESWL1ZdCEJwekUDPQiYBme'
      const did = `did:key:${sigMultibase}`
      const result = await resolver.resolve(did)

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${sigMultibase}`,
              type: 'JsonWebKey2020',
              controller: did,
              publicKeyJwk: {
                alg: 'ES256K',
                crv: 'secp256k1',
                kty: 'EC',
                use: 'sig',
                x: 'h0wVx_2iDlOcblulc8E5iEw1EYh5n1RYtLQfeSTyNc0',
                y: 'O2EATIGbu6DezKFptj5scAIRntgfecanVNXxat1rnwE',
              },
            },
          ],
          authentication: [`${did}#${sigMultibase}`],
          assertionMethod: [`${did}#${sigMultibase}`],
          capabilityDelegation: [`${did}#${sigMultibase}`],
          capabilityInvocation: [`${did}#${sigMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })

    it('should resolve with Multikey', async () => {
      const sigMultibase = 'zQ3shokFTS3brHcDQrn82RUDfCZESWL1ZdCEJwekUDPQiYBme'
      const did = `did:key:${sigMultibase}`
      const result = await resolver.resolve(did, { publicKeyFormat: 'Multikey' })

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${sigMultibase}`,
              type: 'Multikey',
              controller: did,
              publicKeyMultibase: sigMultibase,
            },
          ],
          authentication: [`${did}#${sigMultibase}`],
          assertionMethod: [`${did}#${sigMultibase}`],
          capabilityDelegation: [`${did}#${sigMultibase}`],
          capabilityInvocation: [`${did}#${sigMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/multikey/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })

    it('should resolve with 2020 suite', async () => {
      const sigMultibase = 'zQ3shokFTS3brHcDQrn82RUDfCZESWL1ZdCEJwekUDPQiYBme'
      const did = `did:key:${sigMultibase}`
      const result = await resolver.resolve(did, { publicKeyFormat: 'EcdsaSecp256k1VerificationKey2020' })

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${sigMultibase}`,
              type: 'EcdsaSecp256k1VerificationKey2020',
              controller: did,
              publicKeyMultibase: sigMultibase,
            },
          ],
          authentication: [`${did}#${sigMultibase}`],
          assertionMethod: [`${did}#${sigMultibase}`],
          capabilityDelegation: [`${did}#${sigMultibase}`],
          capabilityInvocation: [`${did}#${sigMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/secp256k1-2020/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })

    it('should resolve with 2019 suite', async () => {
      const sigMultibase = 'zQ3shokFTS3brHcDQrn82RUDfCZESWL1ZdCEJwekUDPQiYBme'
      const did = `did:key:${sigMultibase}`
      const result = await resolver.resolve(did, { publicKeyFormat: 'EcdsaSecp256k1VerificationKey2019' })

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${sigMultibase}`,
              type: 'EcdsaSecp256k1VerificationKey2019',
              controller: did,
              publicKeyMultibase: sigMultibase,
            },
          ],
          authentication: [`${did}#${sigMultibase}`],
          assertionMethod: [`${did}#${sigMultibase}`],
          capabilityDelegation: [`${did}#${sigMultibase}`],
          capabilityInvocation: [`${did}#${sigMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/secp256k1-2019/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })
  })

  describe('P-256', () => {
    it('should resolve with defaults', async () => {
      const sigMultibase = 'zDnaerDaTF5BXEavCrfRZEk316dpbLsfPDZ3WJ5hRTPFU2169'
      const did = `did:key:${sigMultibase}`
      const result = await resolver.resolve(did)

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${sigMultibase}`,
              type: 'JsonWebKey2020',
              controller: did,
              publicKeyJwk: {
                alg: 'ES256',
                crv: 'P-256',
                kty: 'EC',
                use: 'sig',
                x: 'fyNYMN0976ci7xqiSdag3buk-ZCwgXU4kz9XNkBlNUI',
                y: 'hW2ojTNfH7Jbi8--CJUo3OCbH3y5n91g-IMA9MLMbTU',
              },
            },
          ],
          authentication: [`${did}#${sigMultibase}`],
          assertionMethod: [`${did}#${sigMultibase}`],
          capabilityDelegation: [`${did}#${sigMultibase}`],
          capabilityInvocation: [`${did}#${sigMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })

    it('should resolve with Multikey', async () => {
      const sigMultibase = 'zDnaerDaTF5BXEavCrfRZEk316dpbLsfPDZ3WJ5hRTPFU2169'
      const did = `did:key:${sigMultibase}`
      const result = await resolver.resolve(did, { publicKeyFormat: 'Multikey' })

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${sigMultibase}`,
              type: 'Multikey',
              controller: did,
              publicKeyMultibase: sigMultibase,
            },
          ],
          authentication: [`${did}#${sigMultibase}`],
          assertionMethod: [`${did}#${sigMultibase}`],
          capabilityDelegation: [`${did}#${sigMultibase}`],
          capabilityInvocation: [`${did}#${sigMultibase}`],
          '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/multikey/v1'],
        },
      }

      expect(result).toEqual(expectedResult)
    })

    it('should resolve with 2019 suite', async () => {
      const sigMultibase = 'zDnaerDaTF5BXEavCrfRZEk316dpbLsfPDZ3WJ5hRTPFU2169'
      const did = `did:key:${sigMultibase}`
      const result = await resolver.resolve(did, { publicKeyFormat: 'EcdsaSecp256r1VerificationKey2019' })

      const expectedResult = {
        didDocumentMetadata: { contentType: 'application/did+ld+json' },
        didResolutionMetadata: {},
        didDocument: {
          id: did,
          verificationMethod: [
            {
              id: `${did}#${sigMultibase}`,
              type: 'EcdsaSecp256r1VerificationKey2019',
              controller: did,
              publicKeyJwk: {
                alg: 'ES256',
                crv: 'P-256',
                kty: 'EC',
                use: 'sig',
                x: 'fyNYMN0976ci7xqiSdag3buk-ZCwgXU4kz9XNkBlNUI',
                y: 'hW2ojTNfH7Jbi8--CJUo3OCbH3y5n91g-IMA9MLMbTU',
              },
            },
          ],
          authentication: [`${did}#${sigMultibase}`],
          assertionMethod: [`${did}#${sigMultibase}`],
          capabilityDelegation: [`${did}#${sigMultibase}`],
          capabilityInvocation: [`${did}#${sigMultibase}`],
          '@context': [
            'https://www.w3.org/ns/did/v1',
            {
              EcdsaSecp256r1VerificationKey2019:
                'https://w3id.org/security#EcdsaSecp256r1VerificationKey2019',
              publicKeyJwk: {
                '@id': 'https://w3id.org/security#publicKeyJwk',
                '@type': '@json',
              },
            },
          ],
        },
      }

      expect(result).toEqual(expectedResult)
    })
  })
})
