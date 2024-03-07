import { DIDComm } from '../didcomm.js'
import { IDIDManager, IIdentifier, IKeyManager, IResolver, TAgent } from '../../../core-types/src'
import { createAgent } from '../../../core/src'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'
import { DIDResolverPlugin } from '../../../did-resolver/src'
import { DIDDocument, Resolver } from 'did-resolver'
import { IDIDComm } from '../types/IDIDComm.js'
import { ExampleDidProvider } from '../../../test-utils/src'
import 'cross-fetch/polyfill'
import { base64ToBytes, bytesToHex } from '../../../utils/src'

import * as u8a from 'uint8arrays'

const aliceDoc = {
  '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/jws-2020/v1'],
  id: 'did:example:alice',
  authentication: [
    {
      id: 'did:example:alice#key-1',
      type: 'JsonWebKey2020',
      controller: 'did:example:alice',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'G-boxFB6vOZBu-wXkm-9Lh79I8nf9Z50cILaOgKKGww',
      },
    },
    {
      id: 'did:example:alice#key-2',
      type: 'JsonWebKey2020',
      controller: 'did:example:alice',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'P-256',
        x: '2syLh57B-dGpa0F8p1JrO6JU7UUSF6j7qL-vfk1eOoY',
        y: 'BgsGtI7UPsObMRjdElxLOrgAO9JggNMjOcfzEPox18w',
      },
    },
    {
      id: 'did:example:alice#key-3',
      type: 'JsonWebKey2020',
      controller: 'did:example:alice',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'secp256k1',
        x: 'aToW5EaTq5mlAf8C5ECYDSkqsJycrW-e1SQ6_GJcAOk',
        y: 'JAGX94caA21WKreXwYUaOCYTBMrqaX4KWIlsQZTHWCk',
      },
    },
  ],
  keyAgreement: [
    {
      id: 'did:example:alice#key-x25519-1',
      type: 'JsonWebKey2020',
      controller: 'did:example:alice',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'X25519',
        x: 'avH0O2Y4tqLAq8y9zpianr8ajii5m4F_mICrzNlatXs',
      },
    },
    {
      id: 'did:example:alice#key-p256-1',
      type: 'JsonWebKey2020',
      controller: 'did:example:alice',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'P-256',
        x: 'L0crjMN1g0Ih4sYAJ_nGoHUck2cloltUpUVQDhF2nHE',
        y: 'SxYgE7CmEJYi7IDhgK5jI4ZiajO8jPRZDldVhqFpYoo',
      },
    },
    {
      id: 'did:example:alice#key-p521-1',
      type: 'JsonWebKey2020',
      controller: 'did:example:alice',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'P-521',
        x: 'AHBEVPRhAv-WHDEvxVM9S0px9WxxwHL641Pemgk9sDdxvli9VpKCBdra5gg_4kupBDhz__AlaBgKOC_15J2Byptz',
        y: 'AciGcHJCD_yMikQvlmqpkBbVqqbg93mMVcgvXBYAQPP-u9AF7adybwZrNfHWCKAQwGF9ugd0Zhg7mLMEszIONFRk',
      },
    },
  ],
}

const bobDoc = {
  '@context': ['https://www.w3.org/ns/did/v2'],
  id: 'did:example:bob',
  keyAgreement: [
    {
      id: 'did:example:bob#key-x25519-1',
      type: 'JsonWebKey2020',
      controller: 'did:example:bob',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'X25519',
        x: 'GDTrI66K0pFfO54tlCSvfjjNapIs44dzpneBgyx0S3E',
      },
    },
    {
      id: 'did:example:bob#key-x25519-2',
      type: 'JsonWebKey2020',
      controller: 'did:example:bob',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'X25519',
        x: 'UT9S3F5ep16KSNBBShU2wh3qSfqYjlasZimn0mB8_VM',
      },
    },
    {
      id: 'did:example:bob#key-x25519-3',
      type: 'JsonWebKey2020',
      controller: 'did:example:bob',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'X25519',
        x: '82k2BTUiywKv49fKLZa-WwDi8RBf0tB0M8bvSAUQ3yY',
      },
    },
    {
      id: 'did:example:bob#key-p256-1',
      type: 'JsonWebKey2020',
      controller: 'did:example:bob',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'P-256',
        x: 'FQVaTOksf-XsCUrt4J1L2UGvtWaDwpboVlqbKBY2AIo',
        y: '6XFB9PYo7dyC5ViJSO9uXNYkxTJWn0d_mqJ__ZYhcNY',
      },
    },
    {
      id: 'did:example:bob#key-p256-2',
      type: 'JsonWebKey2020',
      controller: 'did:example:bob',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'P-256',
        x: 'n0yBsGrwGZup9ywKhzD4KoORGicilzIUyfcXb1CSwe0',
        y: 'ov0buZJ8GHzV128jmCw1CaFbajZoFFmiJDbMrceCXIw',
      },
    },
    {
      id: 'did:example:bob#key-p384-1',
      type: 'JsonWebKey2020',
      controller: 'did:example:bob',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'P-384',
        x: 'MvnE_OwKoTcJVfHyTX-DLSRhhNwlu5LNoQ5UWD9Jmgtdxp_kpjsMuTTBnxg5RF_Y',
        y: 'X_3HJBcKFQEG35PZbEOBn8u9_z8V1F9V1Kv-Vh0aSzmH-y9aOuDJUE3D4Hvmi5l7',
      },
    },
    {
      id: 'did:example:bob#key-p384-2',
      type: 'JsonWebKey2020',
      controller: 'did:example:bob',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'P-384',
        x: '2x3HOTvR8e-Tu6U4UqMd1wUWsNXMD0RgIunZTMcZsS-zWOwDgsrhYVHmv3k_DjV3',
        y: 'W9LLaBjlWYcXUxOf6ECSfcXKaC3-K9z4hCoP0PS87Q_4ExMgIwxVCXUEB6nf0GDd',
      },
    },
    {
      id: 'did:example:bob#key-p521-1',
      type: 'JsonWebKey2020',
      controller: 'did:example:bob',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'P-521',
        x: 'Af9O5THFENlqQbh2Ehipt1Yf4gAd9RCa3QzPktfcgUIFADMc4kAaYVViTaDOuvVS2vMS1KZe0D5kXedSXPQ3QbHi',
        y: 'ATZVigRQ7UdGsQ9j-omyff6JIeeUv3CBWYsZ0l6x3C_SYqhqVV7dEG-TafCCNiIxs8qeUiXQ8cHWVclqkH4Lo1qH',
      },
    },
    {
      id: 'did:example:bob#key-p521-2',
      type: 'JsonWebKey2020',
      controller: 'did:example:bob',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'P-521',
        x: 'ATp_WxCfIK_SriBoStmA0QrJc2pUR1djpen0VdpmogtnKxJbitiPq-HJXYXDKriXfVnkrl2i952MsIOMfD2j0Ots',
        y: 'AEJipR0Dc-aBZYDqN51SKHYSWs9hM58SmRY1MxgXANgZrPaq1EeGMGOjkbLMEJtBThdjXhkS5VlXMkF0cYhZELiH',
      },
    },
  ],
}

const trustPingMessage = {
  type: 'https://didcomm.org/trust-ping/2.0/ping',
  from: 'did:example:alice',
  to: ['did:example:bob'],
  id: 'trust-ping-test',
  body: {
    responseRequested: true,
  },
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
            example: async (did: string) => {
              let doc: DIDDocument
              if (did === 'did:example:alice') {
                doc = aliceDoc
              } else if (did === 'did:example:bob') {
                doc = bobDoc
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
          // we use stablelib/nacl for ed25519, and the preferred encoding for the privateKey there is a 64 byte
          // string, where the second half is the precomputed 32 byte encoding of the publicKey. This seems to be the
          // preferred encoding in other related libraries too, as the pre-computation speeds up the signing by a few
          // milliseconds.
          // https://github.com/StableLib/stablelib/blob/a89a438fcbf855de6b2e9faa2630f03c3f3b3a54/packages/ed25519/ed25519.ts#L669
          // https://crypto.stackexchange.com/a/54367
          // https://github.com/libp2p/specs/blob/master/peer-ids/peer-ids.md#ed25519
          privateKeyHex: bytesToHex(
            u8a.concat([base64ToBytes(senderSecretEd25519D), base64ToBytes(senderSecretEd25519X)]),
          ),
          kms: 'local',
        },
        {
          type: 'X25519',
          kid: 'did:example:alice#key-x25519-1',
          publicKeyHex: bytesToHex(base64ToBytes(senderSecretX25519X)),
          privateKeyHex: bytesToHex(base64ToBytes(senderSecretX25519D)),
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
          privateKeyHex: bytesToHex(base64ToBytes('b9NnuOCB0hm7YGNvaE9DMhwH_wjZA1-gWD6dA0JWdL0')),
          kms: 'local',
        },
        {
          type: 'X25519',
          kid: 'did:example:bob#key-x25519-2',
          publicKeyHex: bytesToHex(base64ToBytes('UT9S3F5ep16KSNBBShU2wh3qSfqYjlasZimn0mB8_VM')),
          privateKeyHex: bytesToHex(base64ToBytes('p-vteoF1gopny1HXywt76xz_uC83UUmrgszsI-ThBKk')),
          kms: 'local',
        },
        {
          type: 'X25519',
          kid: 'did:example:bob#key-x25519-3',
          publicKeyHex: bytesToHex(base64ToBytes('82k2BTUiywKv49fKLZa-WwDi8RBf0tB0M8bvSAUQ3yY')),
          privateKeyHex: bytesToHex(base64ToBytes('f9WJeuQXEItkGM8shN4dqFr5fLQLBasHnWZ-8dPaSo0')),
          kms: 'local',
        },
      ],
      provider: 'did:example',
      alias: 'bob',
    })
  })

  it('should pack and unpack trust ping message with authcrypt packing', async () => {
    const packedMessage = await agent.packDIDCommMessage({ message: trustPingMessage, packing: 'authcrypt' })
    const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
    expect(unpackedMessage.message.id).toEqual(trustPingMessage.id)
  })

  it('should unpack encrypted message from test vector', async () => {
    const unpackedMessage = await agent.unpackDIDCommMessage({
      message:
        '{"protected":"eyJ0eXAiOiJhcHBsaWNhdGlvbi9kaWRjb21tLWVuY3J5cHRlZCtqc29uIiwic2tpZCI6ImRpZDpleGFtcGxlOmFsaWNlI2tleS14MjU1MTktMSIsImVuYyI6IlhDMjBQIn0","iv":"VfXAqOwRdCqkCOXtCZmM7xRY6b2cTT5K","ciphertext":"_urtE_Pqw8rGEVkR4iKZiR9qs7U7CCiY5T5sujlSwJnI9V6l4MqXAkfQ_EmSS0bKqrpvB1kXT0vgQQUEfwUeqkXBGiNqd-lBopM1zbaUFIr8x7AobjiVlhDkoA0KVQqICuTUhmt3po5h3wTfNZtB1wiQPF3cYeXg9y6sUVAQ7DyAJdItFcYKiboB3b15nIIP1ld6Bb9r50KD3Gm_DQ","tag":"oq6URRWgtmXePhwQXLeZow","recipients":[{"encrypted_key":"iI92IB_c6z-z9OKbK6GMS54uPJrGefJ9BY5papAvc00","header":{"alg":"ECDH-1PU+XC20PKW","iv":"04K4bQO4q0-x3oiSwvx1vjfIo7DEggyl","tag":"q5DzsirJ4Qrnqr0zosx-sg","epk":{"kty":"OKP","crv":"X25519","x":"KqNpwX_5bvCFMpMwB-ww1z8mJB7jq8Sy1jSbQPHqHxA"},"kid":"did:example:bob#key-x25519-1"}},{"encrypted_key":"Z8mGUR1Q-UIOts1LxIhZNIzbcyp5vj_8ZTWuJ6CxWJE","header":{"alg":"ECDH-1PU+XC20PKW","iv":"g1LwvctMeKDtEcJKQGepuevJnho9WdnX","tag":"up_m3F6B-8RAWvlNEhD4Cg","epk":{"kty":"OKP","crv":"X25519","x":"11cPGXIykWfZBVyCIcn7CisnxXgIS988MtHYD9d3HlM"},"kid":"did:example:bob#key-x25519-2"}},{"encrypted_key":"CsnDZ8TEfeIa5Tu7XqYdxx3r5SnzQDssvhTcmkvzA8g","header":{"alg":"ECDH-1PU+XC20PKW","iv":"-2i2CV7T5ylzk7TLK81lKO1xlvRefIMW","tag":"RtaehpY4C6HxXSuy-PSd6w","epk":{"kty":"OKP","crv":"X25519","x":"nH9Pdu9RCm8znYmhCtGp9hPR_VuS6kcf5zJndTYBVzI"},"kid":"did:example:bob#key-x25519-3"}}]}',
    })
    expect(unpackedMessage.message.id).toEqual(trustPingMessage.id)
  })

  it('should pack and unpack trust ping message with anoncrypt packing', async () => {
    const packedMessage = await agent.packDIDCommMessage({ message: trustPingMessage, packing: 'anoncrypt' })
    const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
    expect(unpackedMessage.message.id).toEqual(trustPingMessage.id)
  })

  it('should unpack encrypted message from test vector', async () => {
    const unpackedMessage = await agent.unpackDIDCommMessage({
      message:
        '{"protected":"eyJ0eXAiOiJhcHBsaWNhdGlvbi9kaWRjb21tLWVuY3J5cHRlZCtqc29uIiwic2tpZCI6ImRpZDpleGFtcGxlOmFsaWNlI2tleS14MjU1MTktMSIsImVuYyI6IlhDMjBQIn0","iv":"8e7Q16uLi4YL7VCEw2E2B9vlC9O7IVn4","ciphertext":"aE0DnTMiiPVxo0WaUNqma4qXnTzPojXnJOkv2vvJ36hoXc5gf5kyCXV8JGVmuR0ib62bZt8RhZCzt-2dmyJc9qot2oz7VesSfrxNOFb1-LB4Tfp2d1KVi96wCeQ_Ca5gr5RPRiQIBuoHHQsuZ2P1_9o49txTlt1AlCS4GwY4QCTnLVNyQTfDweQLwp-OJTMlDoKKgHzBljfovHv4yQ","tag":"ZeItOIGZS3-NvGMbDDKu3w","recipients":[{"encrypted_key":"wDMR_DerdPHrua7edijfseiVsTXKkHXou-U3y_XH2VE","header":{"alg":"ECDH-1PU+XC20PKW","iv":"K8twVbKqWnmISiiwnrCK8308vy0g0By9","tag":"fcgKH3VwAjpSnz-T0UP4bw","epk":{"kty":"OKP","crv":"X25519","x":"zN8qTfSPmxA_OwTnK-JOmVrpwvPTlhFuOXm9qlFsozc"},"kid":"did:example:bob#key-x25519-1"}},{"encrypted_key":"eEJ62Naux0w2xUz-5u2aA-Bt4mcxyeZDOUJS16PxUj8","header":{"alg":"ECDH-1PU+XC20PKW","iv":"uvkmZEbeJ-ThAYTcZHIdSW1O4diVWgTM","tag":"PKxx4DWaPAzWBW_pizYckw","epk":{"kty":"OKP","crv":"X25519","x":"90TtJUXASLgYRUctFByDBUNULqsB47W0-QisRdiDOhg"},"kid":"did:example:bob#key-x25519-2"}},{"encrypted_key":"GEYY8xb9e07x7mmJGrPAJssoZayTBUgDrF9RO2FWHEE","header":{"alg":"ECDH-1PU+XC20PKW","iv":"rp9Oi7vEkD0gJjPe3LMU_IR1Yq5_2umv","tag":"zvFBqklSbyRP4Lsp_eyQEg","epk":{"kty":"OKP","crv":"X25519","x":"R9AkOBdF4nN489pQgqI_NstsdrSpnNsGGEgjgNhdeE8"},"kid":"did:example:bob#key-x25519-3"}}]}',
    })
    expect(unpackedMessage.message.id).toEqual(trustPingMessage.id)
  })
})
