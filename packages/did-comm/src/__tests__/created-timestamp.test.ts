import { beforeAll, describe, expect, it } from 'vitest'
import { DIDComm } from '../didcomm.js'
import { IDIDManager, IIdentifier, IKeyManager, IResolver, TAgent } from '../../../core-types/src/index.js'
import { createAgent } from '../../../core/src/index.js'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src/index.js'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src/index.js'
import { KeyManagementSystem } from '../../../kms-local/src/index.js'
import { getDidKeyResolver, KeyDIDProvider } from '../../../did-provider-key/src/index.js'
import { DIDResolverPlugin } from '../../../did-resolver/src/index.js'
import { Resolver } from 'did-resolver'
import { type IDIDComm } from '../types/IDIDComm.js'
import {
  createMediateRequestMessage,
  createMediateGrantMessage,
} from '../protocols/coordinate-mediation-message-handler.js'
import {
  createV3MediateRequestMessage,
  createV3MediateGrantMessage,
  createV3RecipientUpdateMessage,
  createV3RecipientQueryMessage,
  createV3RecipientUpdateResponseMessage,
  createV3RecipientQueryResponseMessage,
} from '../protocols/coordinate-mediation-v3-message-handler.js'
import type { Update, UpdateResult } from '../protocols/coordinate-mediation-v3-message-handler.js'
import { RecipientDid } from '@veramo/mediation-manager'

// Issue #1499: DIDComm v2 message headers `created_time` / `expires_time` must be
// UTC epoch seconds (an integer), per https://identity.foundation/didcomm-messaging/spec/v2.0/#message-headers
// Previously Veramo emitted `new Date().toISOString()`, which didcomm-rust (and the spec) reject.

const nowEpochSeconds = () => Math.floor(Date.now() / 1000)

// allow a few seconds of drift between "now" and the value the producer captured
const isRecentEpoch = (value: unknown) =>
  typeof value === 'number' && Math.abs(value - nowEpochSeconds()) <= 5

describe('did-comm created_time / expires_time (issue #1499)', () => {
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
            fake: async () => {
              throw new Error('fake resolver not used in these tests')
            },
          }),
        }),
        new DIDComm(),
      ],
    })
    senderDID = await agent.didManagerGetOrCreate({
      provider: 'did:key',
      alias: 'did-comm timestamp sender DID',
    })
    recipientDID = await agent.didManagerGetOrCreate({
      provider: 'did:key',
      alias: 'did-comm timestamp receiver DID',
    })
  })

  describe('protocol message factories emit integer epoch seconds', () => {
    // The value is born in these pure factory functions — assert its type/shape directly.
    it('createMediateRequestMessage emits a numeric created_time', () => {
      const message = createMediateRequestMessage(senderDID.did, recipientDID.did)
      expect(message.created_time).toBeTypeOf('number')
      expect(isRecentEpoch(message.created_time)).toBe(true)
    })

    it('createMediateGrantMessage emits a numeric created_time', () => {
      const message = createMediateGrantMessage(senderDID.did, recipientDID.did, 'thread-id')
      expect(message.created_time).toBeTypeOf('number')
      expect(isRecentEpoch(message.created_time)).toBe(true)
    })

    it('createV3MediateRequestMessage emits a numeric created_time', () => {
      const message = createV3MediateRequestMessage(senderDID.did, recipientDID.did)
      expect(message.created_time).toBeTypeOf('number')
      expect(isRecentEpoch(message.created_time)).toBe(true)
    })

    it('createV3MediateGrantMessage emits a numeric created_time', () => {
      const message = createV3MediateGrantMessage(senderDID.did, recipientDID.did, 'thread-id')
      expect(message.created_time).toBeTypeOf('number')
      expect(isRecentEpoch(message.created_time)).toBe(true)
    })

    it('createV3RecipientUpdateMessage emits a numeric created_time', () => {
      const updates: Update[] = []
      const message = createV3RecipientUpdateMessage(senderDID.did, recipientDID.did, updates)
      expect(message.created_time).toBeTypeOf('number')
      expect(isRecentEpoch(message.created_time)).toBe(true)
    })

    it('createV3RecipientQueryMessage emits a numeric created_time', () => {
      const message = createV3RecipientQueryMessage(senderDID.did, recipientDID.did)
      expect(message.created_time).toBeTypeOf('number')
      expect(isRecentEpoch(message.created_time)).toBe(true)
    })

    it('createV3RecipientUpdateResponseMessage emits a numeric created_time', () => {
      const updates: UpdateResult[] = []
      const message = createV3RecipientUpdateResponseMessage(
        senderDID.did,
        recipientDID.did,
        'thread-id',
        updates,
      )
      expect(message.created_time).toBeTypeOf('number')
      expect(isRecentEpoch(message.created_time)).toBe(true)
    })

    it('createV3RecipientQueryResponseMessage emits a numeric created_time', () => {
      const dids: Record<'recipient_did', RecipientDid>[] = []
      const message = createV3RecipientQueryResponseMessage(
        senderDID.did,
        recipientDID.did,
        'thread-id',
        dids,
      )
      expect(message.created_time).toBeTypeOf('number')
      expect(isRecentEpoch(message.created_time)).toBe(true)
    })
  })

  describe('pack -> unpack round-trip', () => {
    it('round-trips a numeric created_time / expires_time unchanged', async () => {
      const created = Math.floor(Date.now() / 1000)
      const expires = created + 3600
      const message = {
        type: 'test',
        from: senderDID.did,
        to: [recipientDID.did],
        id: 'created-time-round-trip',
        created_time: created,
        expires_time: expires,
        body: { hello: 'world' },
      }
      const packed = await agent.packDIDCommMessage({ message, packing: 'anoncrypt' })
      const { message: unpacked } = await agent.unpackDIDCommMessage(packed)
      expect(unpacked.created_time).toEqual(created)
      expect(unpacked.expires_time).toEqual(expires)
      expect(unpacked.created_time).toBeTypeOf('number')
      expect(unpacked.expires_time).toBeTypeOf('number')
    })

    it('accepts a legacy ISO-string created_time on unpack without throwing', async () => {
      // Backwards compatibility: older Veramo versions emitted ISO 8601 strings.
      // The value must pass through unpack unmodified (no normalization).
      const legacyCreated = new Date().toISOString()
      const legacyExpires = new Date().toISOString()
      const message = {
        type: 'test',
        from: senderDID.did,
        to: [recipientDID.did],
        id: 'legacy-timestamp-tolerance',
        created_time: legacyCreated,
        expires_time: legacyExpires,
        body: { hello: 'world' },
      }
      const packed = await agent.packDIDCommMessage({ message, packing: 'anoncrypt' })
      const { message: unpacked } = await agent.unpackDIDCommMessage(packed)
      expect(unpacked.created_time).toEqual(legacyCreated)
      expect(unpacked.expires_time).toEqual(legacyExpires)
    })
  })
})
