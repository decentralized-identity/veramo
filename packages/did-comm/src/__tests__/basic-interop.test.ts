import { DIDComm } from '../didcomm.js'
import { IDIDManager, IIdentifier, IKeyManager, IResolver, TAgent } from '../../../core-types/src'
import { createAgent } from '../../../core/src'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'
import { DIDResolverPlugin } from '../../../did-resolver/src'
import { Resolver } from 'did-resolver'
import { IDIDComm } from '../types/IDIDComm.js'
import 'cross-fetch/polyfill'
import { base64ToBytes, bytesToHex } from '../../../utils/src'
import { getResolver as getDidPeerResolver, PeerDIDProvider } from '../../../did-provider-peer/src'

import * as u8a from 'uint8arrays'
import { v4 as uuidv4 } from 'uuid'

describe('basic didcomm interop', () => {
  let sender: IIdentifier
  let recipient: IIdentifier
  let agent: TAgent<IResolver & IKeyManager & IDIDManager & IDIDComm>
  const defaultKms = 'local'

  beforeAll(async () => {
    agent = createAgent<IResolver & IKeyManager & IDIDManager & IDIDComm>({
      plugins: [
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: {
            [defaultKms]: new KeyManagementSystem(new MemoryPrivateKeyStore()),
          },
        }),
        new DIDManager({
          providers: {
            'did:peer': new PeerDIDProvider({ defaultKms }),
          },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:example',
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...getDidPeerResolver(),
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

  it.skip('should send message to peer', async () => {
    const remote =
      // 'did:peer:2.Vz6MkiJHK4pcuKcsjUEbLTJu2qwKSzCXmKCWbjeYbnXJFYHt9.Ez6LSfy7HtbLKYn8mcxGs3D5VvLg3SQjicKSMhzknqr2T6aVu.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6ImRpZDpwZWVyOjIuRXo2TFN0a1pnMTRvRzVMQ3hqYTNSaG90V0I3bTk0YWZFUjRFaUJMaFlwVVNva2J5Ui5WejZNa2dTWUJNNjNpSE5laVQyVlNRdTdiYnRYaEdZQ1FyUEo4dUVHdXJiZkdiYmdFLlNXM3NpZENJNkltUnRJaXdpY3lJNkltaDBkSEJ6T2k4dmRYTXRaV0Z6ZEM1d2RXSnNhV011YldWa2FXRjBiM0l1YVc1a2FXTnBiM1JsWTJndWFXOHZiV1Z6YzJGblpTSXNJbklpT2x0ZExDSmhJanBiSW1ScFpHTnZiVzB2ZGpJaUxDSmthV1JqYjIxdEwyRnBjREk3Wlc1MlBYSm1ZekU1SWwxOUxIc2lkQ0k2SW1SdElpd2ljeUk2SW5kemN6b3ZMM2R6TG5WekxXVmhjM1F1Y0hWaWJHbGpMbTFsWkdsaGRHOXlMbWx1WkdsamFXOTBaV05vTG1sdkwzZHpJaXdpY2lJNlcxMHNJbUVpT2xzaVpHbGtZMjl0YlM5Mk1pSXNJbVJwWkdOdmJXMHZZV2x3TWp0bGJuWTljbVpqTVRraVhYMWQiLCJhIjpbImRpZGNvbW0vdjIiXX19'
      'did:peer:2.Ez6LStkZg14oG5LCxja3RhotWB7m94afER4EiBLhYpUSokbyR.Vz6MkgSYBM63iHNeiT2VSQu7bbtXhGYCQrPJ8uEGurbfGbbgE.SW3sidCI6ImRtIiwicyI6Imh0dHBzOi8vdXMtZWFzdC5wdWJsaWMubWVkaWF0b3IuaW5kaWNpb3RlY2guaW8vbWVzc2FnZSIsInIiOltdLCJhIjpbImRpZGNvbW0vdjIiLCJkaWRjb21tL2FpcDI7ZW52PXJmYzE5Il19LHsidCI6ImRtIiwicyI6IndzczovL3dzLnVzLWVhc3QucHVibGljLm1lZGlhdG9yLmluZGljaW90ZWNoLmlvL3dzIiwiciI6W10sImEiOlsiZGlkY29tbS92MiIsImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXX1d'
    console.log(`\n\n\nremote:\n${remote}\n\n\n`)
    const msg1 = await agent.packDIDCommMessage({
      packing: 'none',
      message: {
        // type: 'https://didcomm.org/basicmessage/2.0/message',
        type: 'https://didcomm.org/trust-ping/2.0/ping',
        id: uuidv4(),
        body: {
          response_requested: true,
        },
        to: [remote],
      },
    })

    const rr = await agent.sendDIDCommMessage({
      messageId: uuidv4(),
      packedMessage: msg1,
      recipientDidUrl: remote,
    })

    console.log(JSON.stringify(rr, null, 2))
  })
})
