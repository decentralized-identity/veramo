import { DIDComm } from '../didcomm.js'
import { IDIDManager, IIdentifier, IKeyManager, IResolver, TAgent } from '../../../core-types/src'
import { createAgent } from '../../../core/src'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'
import { getDidKeyResolver, KeyDIDProvider } from '../../../did-provider-key/src'
import { DIDResolverPlugin } from '../../../did-resolver/src'
import { type DIDDocument, Resolver } from 'did-resolver'
import { type IDIDComm } from '../types/IDIDComm.js'
import { base64ToBytes, bytesToUtf8String } from '@veramo/utils'

const multiBaseDoc = {
  '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
  controller: 'did:web:portcullis.1keep.com',
  id: 'did:web:portcullis.1keep.com',
  keyAgreement: ['did:web:portcullis.1keep.com#1'],
  service: [
    {
      accept: ['didcomm/v2'],
      id: '#didcomm',
      routingKeys: [],
      serviceEndpoint: 'https://portcullis.1keep.com/didcomm',
      type: 'DIDCommMessaging',
    },
  ],
  verificationMethod: [
    {
      controller: 'did:web:portcullis.1keep.com',
      id: 'did:web:portcullis.1keep.com#0',
      publicKeyMultibase: 'z8FRmkyRH9xAsLCk51yXN2Qy6uq4eN4iAesa3v3Hv889v',
      type: 'Ed25519VerificationKey2020',
    },
    {
      controller: 'did:web:portcullis.1keep.com',
      id: 'did:web:portcullis.1keep.com#1',
      publicKeyMultibase: 'z6LSpSrLxbAhg2SHwKk7kwpsH7DM7QjFS5iK6qP87eViohud',
      type: 'X25519KeyAgreementKey2020',
    },
  ],
}

const base58Doc = {
  '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
  authentication: ['did:web:verifiable.ink#0'],
  controller: 'did:web:verifiable.ink',
  id: 'did:web:verifiable.ink',
  keyAgreement: ['did:web:verifiable.ink#1'],
  service: [
    {
      accept: ['didcomm/v2'],
      id: 'did:web:verifiable.ink#didcomm',
      routingKeys: [],
      serviceEndpoint: 'https://verifiable.ink/didcomm',
      type: 'DIDCommMessaging',
    },
  ],
  verificationMethod: [
    {
      controller: 'did:web:verifiable.ink',
      id: 'did:web:verifiable.ink#0',
      publicKeyBase58: 'JDTRH3N5xMFxRnDzn4NdZc1NPUm9w9Y4ZSehnscCKqBw',
      type: 'Ed25519VerificationKey2018',
    },
    {
      controller: 'did:web:verifiable.ink',
      id: 'did:web:verifiable.ink#1',
      publicKeyBase58: 'Djiwiqccx8kupbtbkMYioj3F4eL9GUcsPJ9LUmNJFN7n',
      type: 'X25519KeyAgreementKey2019',
    },
  ],
}

const hexDoc = {
  '@context': 'https://www.w3.org/ns/did/v1',
  id: 'did:web:iiw-demo.herokuapp.com',
  verificationMethod: [
    {
      id: 'did:web:iiw-demo.herokuapp.com#6eb094077b42b299c8ab5e1981e3dba7e9e331c26acdde4c6bd434dcb4bf856e',
      type: 'Ed25519VerificationKey2018',
      controller: 'did:web:iiw-demo.herokuapp.com',
      publicKeyHex: '6eb094077b42b299c8ab5e1981e3dba7e9e331c26acdde4c6bd434dcb4bf856e',
    },
    {
      id: 'did:web:iiw-demo.herokuapp.com#6e5db42d8d42bca9eee16fef45d41cd3cfaa52fa726ade05055f7d09dcfbf669',
      type: 'X25519KeyAgreementKey2019',
      controller: 'did:web:iiw-demo.herokuapp.com',
      publicKeyHex: '6e5db42d8d42bca9eee16fef45d41cd3cfaa52fa726ade05055f7d09dcfbf669',
    },
  ],
  authentication: [
    'did:web:iiw-demo.herokuapp.com#6eb094077b42b299c8ab5e1981e3dba7e9e331c26acdde4c6bd434dcb4bf856e',
  ],
  assertionMethod: [
    'did:web:iiw-demo.herokuapp.com#6eb094077b42b299c8ab5e1981e3dba7e9e331c26acdde4c6bd434dcb4bf856e',
  ],
  keyAgreement: [
    'did:web:iiw-demo.herokuapp.com#6eb094077b42b299c8ab5e1981e3dba7e9e331c26acdde4c6bd434dcb4bf856e',
    'did:web:iiw-demo.herokuapp.com#6e5db42d8d42bca9eee16fef45d41cd3cfaa52fa726ade05055f7d09dcfbf669',
  ],
  service: [
    {
      id: 'did:web:iiw-demo.herokuapp.com#msg',
      type: 'Messaging',
      serviceEndpoint: 'https://iiw-demo.herokuapp.com/messaging',
      description: 'Handles incoming POST messages',
    },
    {
      id: 'did:web:iiw-demo.herokuapp.com#msg-didcomm',
      type: 'DIDCommMessaging',
      serviceEndpoint: 'https://iiw-demo.herokuapp.com/messaging',
      description: 'Handles incoming DIDComm messages',
    },
  ],
}

// https://github.com/aviarytech/didcomm/blob/master/tests/fixtures/didDocs/alice.json
const jwkDocX = {
  '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
  id: 'did:example:alice',
  verificationMethod: [
    {
      id: 'did:example:alice#key-0',
      controller: 'did:example:alice',
      type: 'JsonWebKey2020',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'X25519',
        x: 'tsc9iYfy4hv2Mz5Q-ztGjKXeXzWUDWl5DLpfepJg4Wc',
      },
    },
  ],
  authentication: ['did:example:alice#key-0'],
  assertionMethod: ['did:example:alice#key-0'],
  keyAgreement: ['did:example:alice#key-0'],
  service: [
    {
      id: 'did:example:alice#didcomm',
      type: 'DIDCommMessaging',
      serviceEndpoint: 'http://example.com/didcomm',
      routingKeys: [],
    },
  ],
}

const jwkDocEd = {
  '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
  id: 'did:example:alice',
  verificationMethod: [
    {
      id: 'did:example:alice#key-0',
      controller: 'did:example:alice',
      type: 'JsonWebKey2020',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'CV-aGlld3nVdgnhoZK0D36Wk-9aIMlZjZOK2XhPMnkQ',
      },
    },
  ],
  authentication: ['did:example:alice#key-0'],
  assertionMethod: ['did:example:alice#key-0'],
  keyAgreement: ['did:example:alice#key-0'],
  service: [
    {
      id: 'did:example:alice#didcomm',
      type: 'DIDCommMessaging',
      serviceEndpoint: 'http://example.com/didcomm',
      routingKeys: [],
    },
  ],
}

describe('didComm', () => {
  let senderDID: IIdentifier
  let recipientDID: IIdentifier
  let agent: TAgent<IResolver & IKeyManager & IDIDManager & IDIDComm>

  beforeAll(async () => {
    agent = createAgent<IResolver & IKeyManager & IDIDManager & IDIDComm>({
      plugins: [
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: {
            local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
          },
        }),
        new DIDManager({
          providers: {
            'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
          },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:key',
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...getDidKeyResolver(),
            fake: async (did: string) => {
              let doc: DIDDocument
              if (did === 'did:fake:base58') {
                doc = base58Doc
              } else if (did === 'did:fake:multibase') {
                doc = multiBaseDoc
              } else if (did === 'did:fake:hex') {
                doc = hexDoc
              } else if (did === 'did:fake:jwkx') {
                doc = jwkDocX
              } else if (did === 'did:fake:jwked') {
                doc = jwkDocEd
              } else {
                throw new Error('Bad didUrl for fake resolver: ' + did)
              }

              // DIDResolutionResult
              return {
                didResolutionMetadata: {},
                didDocument: doc,
                didDocumentMetadata: {},
              }
            },
          }),
        }),
        new DIDComm(),
      ],
    })
    senderDID = await agent.didManagerGetOrCreate({
      provider: 'did:key',
      alias: 'did-comm packing sender DID',
    })
    recipientDID = await agent.didManagerGetOrCreate({
      provider: 'did:key',
      alias: 'did-comm packing receiver DID',
    })
  })

  const createTestMessage = (receiverDID: string) => {
    return {
      type: 'test',
      from: senderDID.did,
      to: [receiverDID],
      id: 'test',
      body: { hello: 'world' },
    }
  }

  describe('recipient key formats', () => {
    it('should pack message for public key as base58', async () => {
      const packedMessage = await agent.packDIDCommMessage({
        message: createTestMessage('did:fake:base58'),
        packing: 'authcrypt',
      })
      expect(packedMessage).toBeDefined()
    })

    it.todo('should unpack message packed for base58')

    it('should pack message for public key as multibase', async () => {
      const packedMessage = await agent.packDIDCommMessage({
        message: createTestMessage('did:fake:multibase'),
        packing: 'authcrypt',
      })
      expect(packedMessage).toBeDefined()
    })

    it.todo('should unpack message packed for multibase')

    it('should pack message for public key as hex', async () => {
      const packedMessage = await agent.packDIDCommMessage({
        message: createTestMessage('did:fake:hex'),
        packing: 'authcrypt',
      })
      expect(packedMessage).toBeDefined()
    })

    it.todo('should unpack message packed for hex')

    it('should pack message for public key as jwk with X25519 crv', async () => {
      const packedMessage = await agent.packDIDCommMessage({
        message: createTestMessage('did:fake:jwkx'),
        packing: 'authcrypt',
      })
      expect(packedMessage).toBeDefined()
    })

    it.todo('should unpack message packed for jwk with X25519 crv')

    it('should pack message for public key as jwk with Ed25519 crv', async () => {
      const packedMessage = await agent.packDIDCommMessage({
        message: createTestMessage('did:fake:jwked'),
        packing: 'authcrypt',
      })
      expect(packedMessage).toBeDefined()
    })

    it.todo('should unpack message packed for jwk with Ed25519 crv')
  })

  describe('packing and algorithms', () => {
    describe('anoncrypt packing', () => {
      const packing = 'anoncrypt'
      it(`should pack and unpack using ${packing}`, async () => {
        const message = createTestMessage(recipientDID.did)
        const packedMessage = await agent.packDIDCommMessage({
          message,
          packing: packing as any,
        })
        const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
        expect(unpackedMessage.message).toEqual(message)
      })

      describe.each(['XC20P', 'A256GCM', 'A256CBC-HS512'])(`%s enc`, (enc) => {
        it(`should pack and unpack using ${packing} packing and ${enc} enc`, async () => {
          const message = createTestMessage(recipientDID.did)
          const packedMessage = await agent.packDIDCommMessage({
            message,
            packing: packing as any,
            options: {
              enc: enc as any,
            },
          })
          const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
          expect(unpackedMessage.message).toEqual(message)
        })

        it.each(['ECDH-ES+A256KW', 'ECDH-ES+XC20PKW'])(
          `should pack and unpack using ${packing} packing and ${enc} enc and %s alg`,
          async (alg) => {
            const message = createTestMessage(recipientDID.did)
            const packedMessage = await agent.packDIDCommMessage({
              message,
              packing: packing as any,
              options: {
                enc: enc as any,
                alg: alg as any,
              },
            })
            const protectedHeader = JSON.parse(
              bytesToUtf8String(base64ToBytes(JSON.parse(packedMessage.message).protected)),
            )
            expect(protectedHeader.alg).toEqual(alg)
            expect(protectedHeader.enc).toEqual(enc)
            const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
            expect(unpackedMessage.metaData.packing).toEqual(packing)
            expect(unpackedMessage.message).toEqual(message)
          },
        )
      })
    })

    describe('authcrypt packing', () => {
      const packing = 'authcrypt'
      it(`should pack and unpack using ${packing}`, async () => {
        const message = createTestMessage(recipientDID.did)
        const packedMessage = await agent.packDIDCommMessage({
          message,
          packing: packing as any,
        })
        const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
        expect(unpackedMessage.message).toEqual(message)
      })

      describe.each(['XC20P', 'A256GCM', 'A256CBC-HS512'])(`%s enc`, (enc) => {
        it(`should pack and unpack using ${packing} packing and ${enc} enc`, async () => {
          const message = createTestMessage(recipientDID.did)
          const packedMessage = await agent.packDIDCommMessage({
            message,
            packing: packing as any,
            options: {
              enc: enc as any,
            },
          })
          const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
          expect(unpackedMessage.message).toEqual(message)
        })

        it.each(['ECDH-1PU+A256KW', 'ECDH-1PU+XC20PKW'])(
          `should pack and unpack using ${packing} packing and ${enc} enc and %s alg`,
          async (alg) => {
            const message = createTestMessage(recipientDID.did)
            const packedMessage = await agent.packDIDCommMessage({
              message,
              packing: packing as any,
              options: {
                enc: enc as any,
                alg: alg as any,
              },
            })
            const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
            expect(unpackedMessage.metaData.packing).toEqual(packing)
            expect(unpackedMessage.message).toEqual(message)
          },
        )
      })
    })
  })
})
