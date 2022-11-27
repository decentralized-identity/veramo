import { DIDComm } from "../didcomm"
import {
  createAgent,
  IDIDManager,
  IIdentifier,
  IKeyManager,
  IResolver,
  TAgent,
} from '../../../core/src'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'
import { getDidKeyResolver, KeyDIDProvider } from '../../../did-provider-key/src'
import { DIDResolverPlugin, getUniversalResolver } from '../../../did-resolver/src'
import { DIDDocument, Resolver } from 'did-resolver'

const multiBaseDoc = {
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/jws-2020/v1"
  ],
  "controller": "did:web:portcullis.1keep.com",
  "id": "did:web:portcullis.1keep.com",
  "keyAgreement": [
    "did:web:portcullis.1keep.com#1"
  ],
  "service": [
    {
      "accept": [
        "didcomm/v2"
      ],
      "id": "#didcomm",
      "routingKeys": [],
      "serviceEndpoint": "https://portcullis.1keep.com/didcomm",
      "type": "DIDCommMessaging"
    }
  ],
  "verificationMethod": [
    {
      "controller": "did:web:portcullis.1keep.com",
      "id": "did:web:portcullis.1keep.com#0",
      "publicKeyMultibase": "z8FRmkyRH9xAsLCk51yXN2Qy6uq4eN4iAesa3v3Hv889v",
      "type": "Ed25519VerificationKey2020"
    },
    {
      "controller": "did:web:portcullis.1keep.com",
      "id": "did:web:portcullis.1keep.com#1",
      "publicKeyMultibase": "z7bNjXnt3EXhpy7UdzZUANa2CsBFpzKGFXsgvkBd9iHGo",
      "type": "X25519KeyAgreementKey2020"
    }
  ]
}

const base58Doc = {
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/jws-2020/v1"
  ],
  "authentication": [
    "did:web:verifiable.ink#0"
  ],
  "controller": "did:web:verifiable.ink",
  "id": "did:web:verifiable.ink",
  "keyAgreement": [
    "did:web:verifiable.ink#1"
  ],
  "service": [
    {
      "accept": [
        "didcomm/v2"
      ],
      "id": "did:web:verifiable.ink#didcomm",
      "routingKeys": [],
      "serviceEndpoint": "https://verifiable.ink/didcomm",
      "type": "DIDCommMessaging"
    }
  ],
  "verificationMethod": [
    {
      "controller": "did:web:verifiable.ink",
      "id": "did:web:verifiable.ink#0",
      "publicKeyBase58": "JDTRH3N5xMFxRnDzn4NdZc1NPUm9w9Y4ZSehnscCKqBw",
      "type": "Ed25519VerificationKey2018"
    },
    {
      "controller": "did:web:verifiable.ink",
      "id": "did:web:verifiable.ink#1",
      "publicKeyBase58": "Djiwiqccx8kupbtbkMYioj3F4eL9GUcsPJ9LUmNJFN7n",
      "type": "X25519KeyAgreementKey2019"
    }
  ]
}

const hexDoc = {
  "@context": "https://w3id.org/did/v1",
  "id": "did:web:iiw-demo.herokuapp.com",
  "verificationMethod": [
    {
      "id": "did:web:iiw-demo.herokuapp.com#6eb094077b42b299c8ab5e1981e3dba7e9e331c26acdde4c6bd434dcb4bf856e",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:web:iiw-demo.herokuapp.com",
      "publicKeyHex": "6eb094077b42b299c8ab5e1981e3dba7e9e331c26acdde4c6bd434dcb4bf856e"
    },
    {
      "id": "did:web:iiw-demo.herokuapp.com#6e5db42d8d42bca9eee16fef45d41cd3cfaa52fa726ade05055f7d09dcfbf669",
      "type": "X25519KeyAgreementKey2019",
      "controller": "did:web:iiw-demo.herokuapp.com",
      "publicKeyHex": "6e5db42d8d42bca9eee16fef45d41cd3cfaa52fa726ade05055f7d09dcfbf669"
    }
  ],
  "authentication": [
    "did:web:iiw-demo.herokuapp.com#6eb094077b42b299c8ab5e1981e3dba7e9e331c26acdde4c6bd434dcb4bf856e"
  ],
  "assertionMethod": [
    "did:web:iiw-demo.herokuapp.com#6eb094077b42b299c8ab5e1981e3dba7e9e331c26acdde4c6bd434dcb4bf856e"
  ],
  "keyAgreement": [
    "did:web:iiw-demo.herokuapp.com#6eb094077b42b299c8ab5e1981e3dba7e9e331c26acdde4c6bd434dcb4bf856e",
    "did:web:iiw-demo.herokuapp.com#6e5db42d8d42bca9eee16fef45d41cd3cfaa52fa726ade05055f7d09dcfbf669"
  ],
  "service": [
    {
      "id": "did:web:iiw-demo.herokuapp.com#msg",
      "type": "Messaging",
      "serviceEndpoint": "https://iiw-demo.herokuapp.com/messaging",
      "description": "Handles incoming POST messages"
    },
    {
      "id": "did:web:iiw-demo.herokuapp.com#msg-didcomm",
      "type": "DIDCommMessaging",
      "serviceEndpoint": "https://iiw-demo.herokuapp.com/messaging",
      "description": "Handles incoming DIDComm messages"
    }
  ]
}

describe('didComm', () => {
  let didKeyIdentifier: IIdentifier
  let agent: TAgent<IResolver & IKeyManager & IDIDManager>

  beforeAll(async () => {
    agent = createAgent({
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
            'fake': async (did: string) => {
              let doc: DIDDocument
              if (did === "did:fake:base58") {
                doc = base58Doc
              } else if (did === "did:fake:multibase") {
                doc = multiBaseDoc
              } else if (did === "did:fake:hex") {
                doc = hexDoc
              } else {
                throw new Error("Bad didUrl for fake resolver: " + did)
              }

              // DIDResolutionResult
              return { 
                didResolutionMetadata: {},
                didDocument: doc,
                didDocumentMetadata: {}
              }
            }
          })
        }),
        new DIDComm()
      ],
    })
    didKeyIdentifier = await agent.didManagerCreate()
  })

  const testMessage = (receiverDID: string) => {
    return {
      type: 'test',
      from: didKeyIdentifier.did,
      to: receiverDID,
      id: 'test',
      body: { hello: 'world' },
    }
  }

  it('should pack message for public key as base58', async () => {
    const packedMessage = await agent.packDIDCommMessage({
      message: testMessage("did:fake:base58"),
      packing: 'authcrypt'
    })
    expect(packedMessage).toBeDefined()
  })

  it('should pack message for public key as multibase', async () => {
    const packedMessage = await agent.packDIDCommMessage({
      message: testMessage("did:fake:multibase"),
      packing: 'authcrypt'
    })
    expect(packedMessage).toBeDefined()
  })

  it('should pack message for public key as hex', async () => {
    const packedMessage = await agent.packDIDCommMessage({
      message: testMessage("did:fake:hex"),
      packing: 'authcrypt'
    })
    expect(packedMessage).toBeDefined()
  })
})
