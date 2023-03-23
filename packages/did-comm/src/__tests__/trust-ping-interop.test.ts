import { DIDComm } from '../didcomm.js'
import {
  IDIDManager,
  IEventListener,
  IIdentifier,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '../../../core-types/src'
import { createAgent } from '../../../core/src'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'
import { DIDResolverPlugin } from '../../../did-resolver/src'
import { DIDDocument, Resolver } from 'did-resolver'
import { DIDCommHttpTransport } from '../transports/transports.js'
import { IDIDComm } from '../types/IDIDComm.js'
import { MessageHandler } from '../../../message-handler/src'
import { createTrustPingMessage, TrustPingMessageHandler } from '../protocols/trust-ping-message-handler.js'
import { ExampleDidProvider, FakeDidProvider, FakeDidResolver } from '../../../test-utils/src'
import { MessagingRouter, RequestWithAgentRouter } from '../../../remote-server/src'
import { Entities, IDataStore, MetaData, migrations } from '../../../data-store/src'
// @ts-ignore
import express from 'express'
import { Server } from 'http'
import { DIDCommMessageHandler } from '../message-handler.js'
import { DataStore, DataStoreORM } from '../../../data-store/src'
import { DataSource } from 'typeorm'

import { jest } from '@jest/globals'
import 'cross-fetch/polyfill'
import { base64ToBytes, bytesToHex } from '@veramo/utils'

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
  onEvent: jest.fn(() => Promise.resolve()),
}

const aliceDoc = {
  "@context":[
     "https://www.w3.org/ns/did/v1",
     "https://w3id.org/security/suites/jws-2020/v1"
  ],
  "id":"did:example:alice",
  "authentication":[
     {
        "id":"did:example:alice#key-1",
        "type":"JsonWebKey2020",
        "controller":"did:example:alice",
        "publicKeyJwk":{
           "kty":"OKP",
           "crv":"Ed25519",
           "x":"G-boxFB6vOZBu-wXkm-9Lh79I8nf9Z50cILaOgKKGww"
        }
     },
     {
        "id":"did:example:alice#key-2",
        "type":"JsonWebKey2020",
        "controller":"did:example:alice",
        "publicKeyJwk":{
           "kty":"EC",
           "crv":"P-256",
           "x":"2syLh57B-dGpa0F8p1JrO6JU7UUSF6j7qL-vfk1eOoY",
           "y":"BgsGtI7UPsObMRjdElxLOrgAO9JggNMjOcfzEPox18w"
        }
     },
     {
        "id":"did:example:alice#key-3",
        "type":"JsonWebKey2020",
        "controller":"did:example:alice",
        "publicKeyJwk":{
           "kty":"EC",
           "crv":"secp256k1",
           "x":"aToW5EaTq5mlAf8C5ECYDSkqsJycrW-e1SQ6_GJcAOk",
           "y":"JAGX94caA21WKreXwYUaOCYTBMrqaX4KWIlsQZTHWCk"
        }
     }
  ],
  "keyAgreement":[
     {
        "id":"did:example:alice#key-x25519-1",
        "type":"JsonWebKey2020",
        "controller":"did:example:alice",
        "publicKeyJwk":{
           "kty":"OKP",
           "crv":"X25519",
           "x":"avH0O2Y4tqLAq8y9zpianr8ajii5m4F_mICrzNlatXs"
        }
     },
     {
        "id":"did:example:alice#key-p256-1",
        "type":"JsonWebKey2020",
        "controller":"did:example:alice",
        "publicKeyJwk":{
           "kty":"EC",
           "crv":"P-256",
           "x":"L0crjMN1g0Ih4sYAJ_nGoHUck2cloltUpUVQDhF2nHE",
           "y":"SxYgE7CmEJYi7IDhgK5jI4ZiajO8jPRZDldVhqFpYoo"
        }
     },
     {
        "id":"did:example:alice#key-p521-1",
        "type":"JsonWebKey2020",
        "controller":"did:example:alice",
        "publicKeyJwk":{
           "kty":"EC",
           "crv":"P-521",
           "x":"AHBEVPRhAv-WHDEvxVM9S0px9WxxwHL641Pemgk9sDdxvli9VpKCBdra5gg_4kupBDhz__AlaBgKOC_15J2Byptz",
           "y":"AciGcHJCD_yMikQvlmqpkBbVqqbg93mMVcgvXBYAQPP-u9AF7adybwZrNfHWCKAQwGF9ugd0Zhg7mLMEszIONFRk"
        }
     }
  ]
}

const bobDoc = {
  "@context":[
     "https://www.w3.org/ns/did/v2"
  ],
  "id":"did:example:bob",
  "keyAgreement":[
     {
        "id":"did:example:bob#key-x25519-1",
        "type":"JsonWebKey2020",
        "controller":"did:example:bob",
        "publicKeyJwk":{
           "kty":"OKP",
           "crv":"X25519",
           "x":"GDTrI66K0pFfO54tlCSvfjjNapIs44dzpneBgyx0S3E"
        }
     },
     {
        "id":"did:example:bob#key-x25519-2",
        "type":"JsonWebKey2020",
        "controller":"did:example:bob",
        "publicKeyJwk":{
           "kty":"OKP",
           "crv":"X25519",
           "x":"UT9S3F5ep16KSNBBShU2wh3qSfqYjlasZimn0mB8_VM"
        }
     },
     {
        "id":"did:example:bob#key-x25519-3",
        "type":"JsonWebKey2020",
        "controller":"did:example:bob",
        "publicKeyJwk":{
           "kty":"OKP",
           "crv":"X25519",
           "x":"82k2BTUiywKv49fKLZa-WwDi8RBf0tB0M8bvSAUQ3yY"
        }
     },
     {
        "id":"did:example:bob#key-p256-1",
        "type":"JsonWebKey2020",
        "controller":"did:example:bob",
        "publicKeyJwk":{
           "kty":"EC",
           "crv":"P-256",
           "x":"FQVaTOksf-XsCUrt4J1L2UGvtWaDwpboVlqbKBY2AIo",
           "y":"6XFB9PYo7dyC5ViJSO9uXNYkxTJWn0d_mqJ__ZYhcNY"
        }
     },
     {
        "id":"did:example:bob#key-p256-2",
        "type":"JsonWebKey2020",
        "controller":"did:example:bob",
        "publicKeyJwk":{
           "kty":"EC",
           "crv":"P-256",
           "x":"n0yBsGrwGZup9ywKhzD4KoORGicilzIUyfcXb1CSwe0",
           "y":"ov0buZJ8GHzV128jmCw1CaFbajZoFFmiJDbMrceCXIw"
        }
     },
     {
        "id":"did:example:bob#key-p384-1",
        "type":"JsonWebKey2020",
        "controller":"did:example:bob",
        "publicKeyJwk":{
           "kty":"EC",
           "crv":"P-384",
           "x":"MvnE_OwKoTcJVfHyTX-DLSRhhNwlu5LNoQ5UWD9Jmgtdxp_kpjsMuTTBnxg5RF_Y",
           "y":"X_3HJBcKFQEG35PZbEOBn8u9_z8V1F9V1Kv-Vh0aSzmH-y9aOuDJUE3D4Hvmi5l7"
        }
     },
     {
        "id":"did:example:bob#key-p384-2",
        "type":"JsonWebKey2020",
        "controller":"did:example:bob",
        "publicKeyJwk":{
           "kty":"EC",
           "crv":"P-384",
           "x":"2x3HOTvR8e-Tu6U4UqMd1wUWsNXMD0RgIunZTMcZsS-zWOwDgsrhYVHmv3k_DjV3",
           "y":"W9LLaBjlWYcXUxOf6ECSfcXKaC3-K9z4hCoP0PS87Q_4ExMgIwxVCXUEB6nf0GDd"
        }
     },
     {
        "id":"did:example:bob#key-p521-1",
        "type":"JsonWebKey2020",
        "controller":"did:example:bob",
        "publicKeyJwk":{
           "kty":"EC",
           "crv":"P-521",
           "x":"Af9O5THFENlqQbh2Ehipt1Yf4gAd9RCa3QzPktfcgUIFADMc4kAaYVViTaDOuvVS2vMS1KZe0D5kXedSXPQ3QbHi",
           "y":"ATZVigRQ7UdGsQ9j-omyff6JIeeUv3CBWYsZ0l6x3C_SYqhqVV7dEG-TafCCNiIxs8qeUiXQ8cHWVclqkH4Lo1qH"
        }
     },
     {
        "id":"did:example:bob#key-p521-2",
        "type":"JsonWebKey2020",
        "controller":"did:example:bob",
        "publicKeyJwk":{
           "kty":"EC",
           "crv":"P-521",
           "x":"ATp_WxCfIK_SriBoStmA0QrJc2pUR1djpen0VdpmogtnKxJbitiPq-HJXYXDKriXfVnkrl2i952MsIOMfD2j0Ots",
           "y":"AEJipR0Dc-aBZYDqN51SKHYSWs9hM58SmRY1MxgXANgZrPaq1EeGMGOjkbLMEJtBThdjXhkS5VlXMkF0cYhZELiH"
        }
     }
  ]
}


describe('trust-ping-interop', () => {
  let sender: IIdentifier
  let recipient: IIdentifier
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
            'did:example': new ExampleDidProvider(),
          },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:example',
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            'example': async (did: string) => {
              let doc: DIDDocument
              if (did === "did:example:alice") {
                doc = aliceDoc
              } else if (did === "did:example:box") {
                doc = bobDoc
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


    // https://identity.foundation/didcomm-messaging/spec/#a1-sender-secrets
    const senderSecretEd25519X = 'G-boxFB6vOZBu-wXkm-9Lh79I8nf9Z50cILaOgKKGww'
    const senderSecretEd25519D = 'pFRUKkyzx4kHdJtFSnlPA9WzqkDT1HWV0xZ5OYZd2SY'

    const senderSecretX25519X = 'avH0O2Y4tqLAq8y9zpianr8ajii5m4F_mICrzNlatXs'
    const senderSecretX25519D = 'r-jK2cO3taR8LQnJB1_ikLBTAnOtShJOsHXRUWT-aZA'

    sender = await agent.didManagerImport({
      did: 'did:example:alice',
      keys: [
        {
          type: 'Ed25519',
          kid: 'did:example:alice#key-1',
          publicKeyHex: bytesToHex(base64ToBytes(senderSecretEd25519X)),
          privateKeyHex:
            bytesToHex(base64ToBytes(senderSecretEd25519D)),
          kms: 'local',
        },
        {
          type: 'X25519',
          kid: 'did:example:alice#key-x25519-1',
          publicKeyHex: bytesToHex(base64ToBytes(senderSecretX25519X)),
          privateKeyHex:
            bytesToHex(base64ToBytes(senderSecretX25519D)),
          kms: 'local',
        },
      ],
      provider: 'did:example',
      alias: 'alice',
    })

    recipient = await agent.didManagerImport({
      did: 'did:example:bob',
      keys: [
        {
          type: 'X25519',
          kid: 'did:example:bob#key-x25519-1',
          publicKeyHex: bytesToHex(base64ToBytes('GDTrI66K0pFfO54tlCSvfjjNapIs44dzpneBgyx0S3E')),
          privateKeyHex:
            bytesToHex(base64ToBytes('b9NnuOCB0hm7YGNvaE9DMhwH_wjZA1-gWD6dA0JWdL0')),
          kms: 'local',
        },        
        {
          type: 'X25519',
          kid: 'did:example:bob#key-x25519-2',
          publicKeyHex: bytesToHex(base64ToBytes('UT9S3F5ep16KSNBBShU2wh3qSfqYjlasZimn0mB8_VM')),
          privateKeyHex:
            bytesToHex(base64ToBytes('p-vteoF1gopny1HXywt76xz_uC83UUmrgszsI-ThBKk')),
          kms: 'local',
        },
        {
          type: 'X25519',
          kid: 'did:example:bob#key-x25519-3',
          publicKeyHex: bytesToHex(base64ToBytes('82k2BTUiywKv49fKLZa-WwDi8RBf0tB0M8bvSAUQ3yY')),
          privateKeyHex:
            bytesToHex(base64ToBytes('f9WJeuQXEItkGM8shN4dqFr5fLQLBasHnWZ-8dPaSo0')),
          kms: 'local',
        },
      ],
      provider: 'did:example',
      alias: 'bob',
    })
  })

  it('should pack and unpack trust ping message with authcrypt packing', async () => {
    const trustPingMessage = createTrustPingMessage(sender.did, recipient.did)
    console.log("trustPingMessage: ", trustPingMessage)
    const packedMessage = await agent.packDIDCommMessage({ message: trustPingMessage, packing: 'authcrypt' })
    console.log("packedMessage: ", packedMessage)
    const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
    console.log("unpackedMessage: ", unpackedMessage)
    expect(unpackedMessage.message.id).toEqual(trustPingMessage.id)
  })
})
