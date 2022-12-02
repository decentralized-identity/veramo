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

// https://github.com/aviarytech/didcomm/blob/master/tests/fixtures/didDocs/alice.json
const jwkDocX = {
	"@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/suites/jws-2020/v1"],
	"id": "did:example:alice",
	"verificationMethod": [
		{
			"id": "did:example:alice#key-0",
			"controller": "did:example:alice",
			"type": "JsonWebKey2020",
			"publicKeyJwk": {
				"kty": "OKP",
				"crv": "X25519",
				"x": "tsc9iYfy4hv2Mz5Q-ztGjKXeXzWUDWl5DLpfepJg4Wc"
			}
		}
	],
	"authentication": ["did:example:alice#key-0"],
	"assertionMethod": ["did:example:alice#key-0"],
	"keyAgreement": ["did:example:alice#key-0"],
	"service": [
		{
			"id": "did:example:alice#didcomm",
			"type": "DIDCommMessaging",
			"serviceEndpoint": "http://example.com/didcomm",
			"routingKeys": []
		}
	]
}

const jwkDocEd = {
	"@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/suites/jws-2020/v1"],
	"id": "did:example:alice",
	"verificationMethod": [
		{
			"id": "did:example:alice#key-0",
			"controller": "did:example:alice",
			"type": "JsonWebKey2020",
			"publicKeyJwk": {
				"kty": "OKP",
				"crv": "Ed25519",
				"x": "CV-aGlld3nVdgnhoZK0D36Wk-9aIMlZjZOK2XhPMnkQ"
			}
		}
	],
	"authentication": ["did:example:alice#key-0"],
	"assertionMethod": ["did:example:alice#key-0"],
	"keyAgreement": ["did:example:alice#key-0"],
	"service": [
		{
			"id": "did:example:alice#didcomm",
			"type": "DIDCommMessaging",
			"serviceEndpoint": "http://example.com/didcomm",
			"routingKeys": []
		}
	]
}

const authcryptX25519A256CBC = {
  "ciphertext":"MJezmxJ8DzUB01rMjiW6JViSaUhsZBhMvYtezkhmwts1qXWtDB63i4-FHZP6cJSyCI7eU-gqH8lBXO_UVuviWIqnIUrTRLaumanZ4q1dNKAnxNL-dHmb3coOqSvy3ZZn6W17lsVudjw7hUUpMbeMbQ5W8GokK9ZCGaaWnqAzd1ZcuGXDuemWeA8BerQsfQw_IQm-aUKancldedHSGrOjVWgozVL97MH966j3i9CJc3k9jS9xDuE0owoWVZa7SxTmhl1PDetmzLnYIIIt-peJtNYGdpd-FcYxIFycQNRUoFEr77h4GBTLbC-vqbQHJC1vW4O2LEKhnhOAVlGyDYkNbA4DSL-LMwKxenQXRARsKSIMn7z-ZIqTE-VCNj9vbtgR",
  "protected":"eyJlcGsiOnsia3R5IjoiT0tQIiwiY3J2IjoiWDI1NTE5IiwieCI6IkdGY01vcEpsamY0cExaZmNoNGFfR2hUTV9ZQWY2aU5JMWRXREd5VkNhdzAifSwiYXB2IjoiTmNzdUFuclJmUEs2OUEtcmtaMEw5WFdVRzRqTXZOQzNaZzc0QlB6NTNQQSIsInNraWQiOiJkaWQ6ZXhhbXBsZTphbGljZSNrZXkteDI1NTE5LTEiLCJhcHUiOiJaR2xrT21WNFlXMXdiR1U2WVd4cFkyVWphMlY1TFhneU5UVXhPUzB4IiwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1lbmNyeXB0ZWQranNvbiIsImVuYyI6IkEyNTZDQkMtSFM1MTIiLCJhbGciOiJFQ0RILTFQVStBMjU2S1cifQ",
  "recipients":[
     {
        "encrypted_key":"o0FJASHkQKhnFo_rTMHTI9qTm_m2mkJp-wv96mKyT5TP7QjBDuiQ0AMKaPI_RLLB7jpyE-Q80Mwos7CvwbMJDhIEBnk2qHVB",
        "header":{
           "kid":"did:example:bob#key-x25519-1"
        }
     },
     {
        "encrypted_key":"rYlafW0XkNd8kaXCqVbtGJ9GhwBC3lZ9AihHK4B6J6V2kT7vjbSYuIpr1IlAjvxYQOw08yqEJNIwrPpB0ouDzKqk98FVN7rK",
        "header":{
           "kid":"did:example:bob#key-x25519-2"
        }
     },
     {
        "encrypted_key":"aqfxMY2sV-njsVo-_9Ke9QbOf6hxhGrUVh_m-h_Aq530w3e_4IokChfKWG1tVJvXYv_AffY7vxj0k5aIfKZUxiNmBwC_QsNo",
        "header":{
           "kid":"did:example:bob#key-x25519-3"
        }
     }
  ],
  "tag":"uYeo7IsZjN7AnvBjUZE5lNryNENbf6_zew_VC-d4b3U",
  "iv":"o02OXDQ6_-sKz2PX_6oyJg"
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
              } else if (did === "did:fake:jwkx") {
                doc = jwkDocX
              } else if (did === "did:fake:jwked") {
                doc = jwkDocEd
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

  it.todo('should unpack message packed for base58')

  it('should pack message for public key as multibase', async () => {
    const packedMessage = await agent.packDIDCommMessage({
      message: testMessage("did:fake:multibase"),
      packing: 'authcrypt'
    })
    expect(packedMessage).toBeDefined()
  })

  it.todo('should unpack message packed for multibase')

  it('should pack message for public key as hex', async () => {
    const packedMessage = await agent.packDIDCommMessage({
      message: testMessage("did:fake:hex"),
      packing: 'authcrypt'
    })
    expect(packedMessage).toBeDefined()
  })

  it.todo('should unpack message packed for hex')

  it('should pack message for public key as jwk with X25519 crv', async () => {
    const packedMessage = await agent.packDIDCommMessage({
      message: testMessage("did:fake:jwkx"),
      packing: 'authcrypt'
    })
    expect(packedMessage).toBeDefined()
  })

  it.todo('should unpack message packed for jwk with X25519 crv')

  it('should pack message for public key as jwk with Ed25519 crv', async () => {
    const packedMessage = await agent.packDIDCommMessage({
      message: testMessage("did:fake:jwked"),
      packing: 'authcrypt'
    })
    expect(packedMessage).toBeDefined()
  })

  it.todo('should unpack message packed for jwk with Ed25519 crv')
})
