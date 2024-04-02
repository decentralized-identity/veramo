import { DIDComm } from '../didcomm.js'
import {
  KeyValueStore,
  KeyValueTypeORMStoreAdapter,
  Entities as KVStoreEntities,
  kvStoreMigrations,
} from '@veramo/kv-store'
import {
  createAgent,
  IDIDManager,
  IEventListener,
  IIdentifier,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '../../../core/src'
import {
  RequesterDid,
  IMediationManager,
  PreMediationRequestPolicy,
  MediationResponse,
} from '../../../mediation-manager'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'
import { DIDResolverPlugin } from '../../../did-resolver/src'
import { Resolver } from 'did-resolver'
import { DIDCommHttpTransport } from '../transports/transports.js'
import { IDIDComm } from '../types/IDIDComm.js'
import { MessageHandler } from '../../../message-handler/src'
import {
  CoordinateMediationV3MediatorMessageHandler,
  CoordinateMediationV3RecipientMessageHandler,
  createV3MediateRequestMessage,
  createV3MediateGrantMessage,
  createV3RecipientUpdateMessage,
  UpdateAction,
  RecipientUpdateResult,
  CoordinateMediation,
  createV3RecipientQueryMessage,
} from '../protocols/coordinate-mediation-v3-message-handler.js'
import type { Update, UpdateResult } from '../protocols/coordinate-mediation-v3-message-handler.js'
import { FakeDidProvider, FakeDidResolver } from '../../../test-utils/src'
import { MessagingRouter, RequestWithAgentRouter } from '../../../remote-server/src'
import {
  Entities as DataStoreEntities,
  IDataStore,
  migrations as dataStoreMigrations,
} from '../../../data-store/src'

// @ts-ignore
import express from 'express'
import { Server } from 'http'
import { DIDCommMessageHandler } from '../message-handler.js'
import { DataStore, DataStoreORM } from '../../../data-store/src'
import { MediationManagerPlugin } from '../../../mediation-manager/src'
import { DataSource } from 'typeorm'

import { jest } from '@jest/globals'
import 'cross-fetch/polyfill'

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
  onEvent: jest.fn(() => Promise.resolve()),
}

describe('coordinate-mediation-message-handler', () => {
  let recipient: IIdentifier
  let mediator: IIdentifier
  let denyRecipient: IIdentifier
  let agent: TAgent<
    IResolver & IKeyManager & IDIDManager & IDIDComm & IMessageHandler & IDataStore & IMediationManager
  >
  let didCommEndpointServer: Server
  let listeningPort = Math.round(Math.random() * 32000 + 2048)
  let dbConnection: DataSource
  let policyStore: KeyValueStore<PreMediationRequestPolicy>
  let mediationStore: KeyValueStore<MediationResponse>
  let recipientDidStore: KeyValueStore<RequesterDid>

  beforeAll(async () => {
    dbConnection = new DataSource({
      name: 'test',
      type: 'sqlite',
      database: ':memory:',
      synchronize: false,
      migrations: dataStoreMigrations.concat(kvStoreMigrations),
      migrationsRun: true,
      logging: false,
      entities: (KVStoreEntities as any).concat(DataStoreEntities),
    })

    policyStore = new KeyValueStore<PreMediationRequestPolicy>({
      namespace: 'mediation_policy',
      store: new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'mediation_policy' }),
    })

    mediationStore = new KeyValueStore<MediationResponse>({
      namespace: 'mediation_response',
      store: new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'mediation_response' }),
    })

    recipientDidStore = new KeyValueStore<RequesterDid>({
      namespace: 'recipient_did',
      store: new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'recipient_did' }),
    })

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
            'did:fake': new FakeDidProvider(),
          },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:fake',
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...new FakeDidResolver(() => agent).getDidFakeResolver(),
          }),
        }),
        new MessageHandler({
          messageHandlers: [
            new DIDCommMessageHandler(),
            new CoordinateMediationV3MediatorMessageHandler(),
            new CoordinateMediationV3RecipientMessageHandler(),
          ],
        }),
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
        DIDCommEventSniffer,
        new DIDComm({ transports: [new DIDCommHttpTransport()] }),
        new MediationManagerPlugin(true, policyStore, mediationStore, recipientDidStore),
      ],
    })

    denyRecipient = await agent.didManagerImport({
      did: 'did:fake:dENygbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
      keys: [
        {
          type: 'Ed25519',
          kid: 'didcomm-senderKey-1',
          publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
          privateKeyHex:
            'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
          kms: 'local',
        },
      ],
      services: [
        {
          id: 'msg1',
          type: 'DIDCommMessaging',
          serviceEndpoint: `http://localhost:${listeningPort}/messaging`,
        },
      ],
      provider: 'did:fake',
      alias: 'sender',
    })

    recipient = await agent.didManagerImport({
      did: 'did:fake:z6MkgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
      keys: [
        {
          type: 'Ed25519',
          kid: 'didcomm-senderKey-1',
          publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
          privateKeyHex:
            'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
          kms: 'local',
        },
      ],
      services: [
        {
          id: 'msg1',
          type: 'DIDCommMessaging',
          serviceEndpoint: `http://localhost:${listeningPort}/messaging`,
        },
      ],
      provider: 'did:fake',
      alias: 'sender',
    })

    mediator = await agent.didManagerImport({
      did: 'did:fake:z6MkrPhffVLBZpxH7xvKNyD4sRVZeZsNTWJkLdHdgWbfgNu3',
      keys: [
        {
          type: 'Ed25519',
          kid: 'didcomm-receiverKey-1',
          publicKeyHex: 'b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
          privateKeyHex:
            '19ed9b6949cfd0f9a57e30f0927839a985fa699491886ebcdda6a954d869732ab162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
          kms: 'local',
        },
      ],
      services: [
        {
          id: 'msg2',
          type: 'DIDCommMessaging',
          serviceEndpoint: `http://localhost:${listeningPort}/messaging`,
        },
      ],
      provider: 'did:fake',
      alias: 'receiver',
    })

    const requestWithAgent = RequestWithAgentRouter({ agent })

    await new Promise((resolve) => {
      //setup a server to receive HTTP messages and forward them to this agent to be processed as DIDComm messages
      const app = express()
      app.use(
        '/messaging',
        requestWithAgent,
        MessagingRouter({
          metaData: { type: 'DIDComm', value: 'integration test' },
        }),
      )
      didCommEndpointServer = app.listen(listeningPort, () => {
        resolve(true)
      })
    })
  })

  afterAll(async () => {
    try {
      await new Promise((resolve, _reject) => didCommEndpointServer?.close(resolve))
    } catch (e: any) {
      // nop
    }

    try {
      await dbConnection?.destroy()
    } catch (e: any) {
      // nop
    }
  })

  const expectMessageSent = (msgid: string) => {
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: msgid,
        type: 'DIDCommV2Message-sent',
      },
      expect.anything(),
    )
  }

  describe('mediator', () => {
    describe('MEDIATE REQUEST', () => {
      const expectRecieveMediationRequest = (id: string, from = recipient.did) => {
        expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
          {
            data: {
              message: {
                body: {},
                from,
                id,
                to: [mediator.did],
                created_time: expect.anything(),
                type: 'https://didcomm.org/coordinate-mediation/3.0/mediate-request',
              },
              metaData: { packing: 'authcrypt' },
            },
            type: 'DIDCommV2Message-received',
          },
          expect.anything(),
        )
      }

      const expectGrantRequest = (msgid: string) => {
        expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
          {
            data: {
              message: {
                body: { routing_did: [mediator.did] },
                from: mediator.did,
                to: [recipient.did],
                id: expect.anything(),
                thid: msgid,
                created_time: expect.anything(),
                type: CoordinateMediation.MEDIATE_GRANT,
              },
              metaData: { packing: 'authcrypt' },
            },
            type: 'DIDCommV2Message-received',
          },
          expect.anything(),
        )
      }

      const expectDenyRequest = (msgid: string, to = recipient.did) => {
        expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
          {
            data: {
              message: {
                from: mediator.did,
                id: expect.anything(),
                thid: msgid,
                to: [to],
                created_time: expect.anything(),
                type: 'https://didcomm.org/coordinate-mediation/3.0/mediate-deny',
                body: null,
              },
              metaData: { packing: 'authcrypt' },
            },
            type: 'DIDCommV2Message-received',
          },
          expect.anything(),
        )
      }

      it('should default to mediate grant all', async () => {
        const isMediateDefaultGrantAll = await agent.isMediateDefaultGrantAll()
        expect(isMediateDefaultGrantAll).toBeTruthy()
      })

      it('should correctly update the data store MediationPolicy for dids to deny', async () => {
        const policy = 'DENY'
        const requesterDid = denyRecipient.did
        const insertedMediationPolicyDid = await agent.mediationManagerSaveMediationPolicy({
          requesterDid,
          policy,
        })
        expect(insertedMediationPolicyDid).toBe(denyRecipient.did)
        const insertedPolicy = await agent.mediationManagerGetMediationPolicy({ requesterDid })
        expect(insertedPolicy).toBe('DENY')
      })

      it('should receive a mediate request', async () => {
        const message = createV3MediateRequestMessage(recipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)

        expectRecieveMediationRequest(message.id)
      })

      it('should save the mediation status to the db where request is GRANTED', async () => {
        const message = createV3MediateRequestMessage(recipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)
        const mediationSaveResult = await agent.mediationManagerSaveMediation({
          requesterDid: recipient.did,
          status: 'GRANTED',
        })
        expect(mediationSaveResult).toBe('GRANTED')
        const readMediation = await agent.mediationManagerGetMediation({ requesterDid: recipient.did })
        expect(readMediation).toBe('GRANTED')
      })

      it('should record the mediation status to the db where request is DENIED', async () => {
        const message = createV3MediateRequestMessage(denyRecipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)
        const mediation = await agent.mediationManagerGetMediation({ requesterDid: denyRecipient.did })
        expect(mediation).toBe('DENIED')
      })

      it('should respond correctly to a mediate request where GRANTED', async () => {
        const message = createV3MediateRequestMessage(recipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)

        expectMessageSent(messageId)
        expectRecieveMediationRequest(messageId)
        expectMessageSent(messageId)
        expectGrantRequest(messageId)
      })

      it('should respond correctly to a mediate request where DENIED', async () => {
        const message = createV3MediateRequestMessage(denyRecipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)

        expectMessageSent(messageId)
        expectRecieveMediationRequest(messageId, denyRecipient.did)
        expectMessageSent(messageId)
        expectDenyRequest(messageId, denyRecipient.did)
      })

      it('should correctly update the data store MediationPolicy for dids to allow', async () => {
        const policy = 'ALLOW'
        const requesterDid = recipient.did
        const insertedMediationPolicyDid = await agent.mediationManagerSaveMediationPolicy({
          requesterDid,
          policy,
        })

        expect(insertedMediationPolicyDid).toBe(recipient.did)

        const savedPolicy = await agent.mediationManagerGetMediationPolicy({ requesterDid })

        expect(savedPolicy).toBe('ALLOW')
      })

      it('should only allow mediation for dids with a MediationPolicy of ALLOW where isMediateDefaultGrantAll === false', async () => {
        agent.isMediateDefaultGrantAll = jest.fn(() => Promise.resolve(false))

        expect(await agent.isMediateDefaultGrantAll()).toBeFalsy()

        const message = createV3MediateRequestMessage(recipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)

        expectMessageSent(messageId)
        expectRecieveMediationRequest(messageId)
        expectMessageSent(messageId)
        expectGrantRequest(messageId)
      })

      it('should deny mediation for dids with no MediationPolicy of ALLOW where isMediateDefaultGrantAll === false', async () => {
        agent.isMediateDefaultGrantAll = jest.fn(() => Promise.resolve(false))

        expect(await agent.isMediateDefaultGrantAll()).toBeFalsy()

        const policy = await agent.mediationManagerGetMediationPolicy({ requesterDid: denyRecipient.did })
        const didIsAllowed = policy === 'ALLOW'

        expect(didIsAllowed).toBeFalsy()

        const message = createV3MediateRequestMessage(denyRecipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)

        expectMessageSent(messageId)
        expectRecieveMediationRequest(messageId, denyRecipient.did)
        expectMessageSent(messageId)
        expectDenyRequest(messageId, denyRecipient.did)
      })
    })
  })

  const mockRecipientDids = {
    mockRecipientDid_00: 'did:fake:testgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
    mockRecipientDid_01: 'did:fake:test888NU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
    mockRecipientDid_02: 'did:fake:testt88NU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
    mockRecipientDid_03: 'did:fake:test889NU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
    mockRecipientDid_04: 'did:fake:deny889NU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
  } as const

  describe('RECIPIENT UPDATE', () => {
    const expectRecieveUpdateRequest = (msgid: string, updates: Update[]) => {
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { updates },
              return_route: 'all',
              from: recipient.did,
              id: msgid,
              to: [mediator.did],
              created_time: expect.anything(),
              type: 'https://didcomm.org/coordinate-mediation/3.0/recipient-update',
            },
            metaData: { packing: 'authcrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    }

    const expectRecipientUpdateReponse = (msgid: string, updates: UpdateResult[]) => {
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { updates },
              from: mediator.did,
              to: [recipient.did],
              id: expect.anything(),
              thid: msgid,
              created_time: expect.anything(),
              type: CoordinateMediation.RECIPIENT_UPDATE_RESPONSE,
            },
            metaData: { packing: 'authcrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    }

    it('should receive an update request', async () => {
      const { mockRecipientDid_00: recipient_did } = mockRecipientDids
      const update = { recipient_did, action: UpdateAction.ADD }
      const message = createV3RecipientUpdateMessage(recipient.did, mediator.did, [update])
      const messageId = message.id
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)

      expectRecieveUpdateRequest(messageId, [update])
    })

    it('should add a new recipient_did to the data store', async () => {
      const { mockRecipientDid_00: recipient_did } = mockRecipientDids
      const update = { recipient_did, action: UpdateAction.ADD }
      const message = createV3RecipientUpdateMessage(recipient.did, mediator.did, [update])
      const messageId = message.id
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)
      const result = await agent.mediationManagerGetRecipientDid({ recipientDid: recipient_did })

      expect(result).toBe(recipient.did)
    })

    it('should remove an existing recipient_did from the data store', async () => {
      const { mockRecipientDid_00: recipientDid } = mockRecipientDids
      await agent.mediationManagerAddRecipientDid({ requesterDid: recipient.did, recipientDid })
      const existingRecipientDid = await agent.mediationManagerGetRecipientDid({ recipientDid })

      /* ensure the recipient_did exists in the data store so that it can be removed */
      expect(existingRecipientDid).toBe(recipient.did)

      const update = { recipient_did: recipientDid, action: UpdateAction.REMOVE }
      const message = createV3RecipientUpdateMessage(recipient.did, mediator.did, [update])
      const messageId = message.id
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)
      const did = await agent.mediationManagerGetRecipientDid({ recipientDid })

      expect(did).toBe(null)
    })

    it('should respond correctly to a recipient update request on add SUCCESS', async () => {
      const updates = [
        { recipient_did: mockRecipientDids.mockRecipientDid_01, action: UpdateAction.ADD },
        { recipient_did: mockRecipientDids.mockRecipientDid_02, action: UpdateAction.ADD },
      ]
      const message = createV3RecipientUpdateMessage(recipient.did, mediator.did, updates)
      const messageId = message.id
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)
      const results = [
        { ...updates[0], result: RecipientUpdateResult.SUCCESS },
        { ...updates[1], result: RecipientUpdateResult.SUCCESS },
      ]
      expectMessageSent(messageId)
      expectRecieveUpdateRequest(messageId, updates)
      expectMessageSent(messageId)
      expectRecipientUpdateReponse(messageId, results)
    })

    it('should respond correctly to a recipient update request on remove NO_CHANGE', async () => {
      /**
       * NOTE: we are removing a non-existent recipient_did so should recieve "NO_CHANGE"
       */
      const { mockRecipientDid_03: recipient_did } = mockRecipientDids
      const update = { recipient_did, action: UpdateAction.REMOVE }
      const message = createV3RecipientUpdateMessage(recipient.did, mediator.did, [update])
      const messageId = message.id
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)

      expectMessageSent(messageId)
      expectRecieveUpdateRequest(messageId, [update])
      expectMessageSent(messageId)
      expectRecipientUpdateReponse(messageId, [{ ...update, result: RecipientUpdateResult.NO_CHANGE }])
    })

    it('should respond correctly to a recipient update request on remove SUCCESS', async () => {
      await agent.mediationManagerAddRecipientDid({
        requesterDid: recipient.did,
        recipientDid: mockRecipientDids.mockRecipientDid_01,
      })

      const { mockRecipientDid_01: recipient_did } = mockRecipientDids
      const update = { recipient_did, action: UpdateAction.REMOVE }
      const message = createV3RecipientUpdateMessage(recipient.did, mediator.did, [update])
      const messageId = message.id
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)

      expectMessageSent(messageId)
      expectRecieveUpdateRequest(messageId, [update])
      expectMessageSent(messageId)
      expectRecipientUpdateReponse(messageId, [{ ...update, result: RecipientUpdateResult.SUCCESS }])
    })
  })

  describe('RECIPIENT QUERY', () => {
    const expectRecieveRecipientQuery = (msgid: string) => {
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: {},
              from: recipient.did,
              id: msgid,
              to: [mediator.did],
              created_time: expect.anything(),
              type: CoordinateMediation.RECIPIENT_QUERY,
            },
            metaData: { packing: 'authcrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    }

    const expectRecipientQueryReponse = (msgid: string, dids: Omit<Update, 'action'>[] = []) => {
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { dids },
              from: mediator.did,
              to: [recipient.did],
              id: expect.anything(),
              thid: msgid,
              created_time: expect.anything(),
              type: CoordinateMediation.RECIPIENT_QUERY_RESPONSE,
            },
            metaData: { packing: 'authcrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    }

    it('should receive a query request', async () => {
      const message = createV3RecipientQueryMessage(recipient.did, mediator.did)
      const messageId = message.id
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)

      expectRecieveRecipientQuery(messageId)
    })

    it('should respond correctly to a recipient query request on no recipient_dids', async () => {
      await agent.mediationManagerRemoveRecipientDid({ recipientDid: mockRecipientDids.mockRecipientDid_00 })
      await agent.mediationManagerRemoveRecipientDid({ recipientDid: mockRecipientDids.mockRecipientDid_01 })
      await agent.mediationManagerRemoveRecipientDid({ recipientDid: mockRecipientDids.mockRecipientDid_02 })
      await agent.mediationManagerRemoveRecipientDid({ recipientDid: mockRecipientDids.mockRecipientDid_03 })

      const message = createV3RecipientQueryMessage(recipient.did, mediator.did)
      const messageId = message.id
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)

      expectMessageSent(messageId)
      expectRecieveRecipientQuery(messageId)
      expectMessageSent(messageId)
      expectRecipientQueryReponse(messageId)
    })

    it('should respond correctly to a recipient query request on available recipient_dids', async () => {
      /**
       * NOTE: we need to insert a recipient_did into the data store to ensure a populated query
       */
      const insertOperationOne = {
        recipientDid: mockRecipientDids.mockRecipientDid_00,
        requesterDid: recipient.did,
      }
      const insertOperationTwo = {
        recipientDid: mockRecipientDids.mockRecipientDid_01,
        requesterDid: recipient.did,
      }
      await agent.mediationManagerAddRecipientDid(insertOperationOne)
      await agent.mediationManagerAddRecipientDid(insertOperationTwo)

      /**
       * NOTE: we add a recipient did on another requester did to ensure that the query response
       * only contains the inserted recipient_dids that it controls and not all recipient_dids
       * that exist in the data store
       **/
      const insertOperationThree = {
        recipientDid: mockRecipientDids.mockRecipientDid_02,
        requesterDid: denyRecipient.did,
      }
      await agent.mediationManagerAddRecipientDid(insertOperationThree)
      const recipientDidOne = await agent.mediationManagerGetRecipientDid({
        recipientDid: insertOperationOne.recipientDid,
      })
      const recipientDidTwo = await agent.mediationManagerGetRecipientDid({
        recipientDid: insertOperationTwo.recipientDid,
      })
      const recipientDidThree = await agent.mediationManagerGetRecipientDid({
        recipientDid: insertOperationThree.recipientDid,
      })
      expect(recipientDidOne).toBe(recipient.did)
      expect(recipientDidTwo).toBe(recipient.did)
      expect(recipientDidThree).toBe(denyRecipient.did)

      /**
       * NOTE: now we query the recipient dids and expect the response to contain the inserted recipient_dids
       */
      const message = createV3RecipientQueryMessage(recipient.did, mediator.did)
      const messageId = message.id
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)
      const dids = [
        { recipient_did: mockRecipientDids.mockRecipientDid_00 },
        { recipient_did: mockRecipientDids.mockRecipientDid_01 },
      ]

      expectMessageSent(messageId)
      expectRecieveRecipientQuery(messageId)
      expectMessageSent(messageId)
      expectRecipientQueryReponse(messageId, dids)
    })
  })

  describe('recipient', () => {
    describe('MEDIATE REQUEST RESPONSE', () => {
      it('should save new service on mediate grant', async () => {
        const messageId = '858b8fcb-2e8e-44db-a3aa-eac10a63bfa2l'
        const mediateRequestMessage = createV3MediateRequestMessage(recipient.did, mediator.did)
        mediateRequestMessage.id = messageId
        const packedMessage = await agent.packDIDCommMessage({
          packing: 'authcrypt',
          message: mediateRequestMessage,
        })
        await agent.sendDIDCommMessage({
          messageId: mediateRequestMessage.id,
          packedMessage,
          recipientDidUrl: mediator.did,
        })

        const didDoc = (await agent.resolveDid({ didUrl: recipient.did })).didDocument
        const service = didDoc?.service?.find((s) => s.id === `${recipient.did}#didcomm-mediator`)
        expect(service?.serviceEndpoint).toEqual([{ uri: mediator.did }])
      })

      it('should remove service on mediate deny', async () => {
        const messageId = '858b8fcb-2e8e-44db-a3aa-eac10a63bfa2l'
        const mediateRequestMessage = createV3MediateRequestMessage(recipient.did, mediator.did)
        mediateRequestMessage.id = messageId
        const packedMessage = await agent.packDIDCommMessage({
          packing: 'authcrypt',
          message: mediateRequestMessage,
        })
        await agent.sendDIDCommMessage({
          messageId: mediateRequestMessage.id,
          packedMessage,
          recipientDidUrl: mediator.did,
        })

        const msgid = '158b8fcb-2e8e-44db-a3aa-eac10a63bfa2l'
        const packedDenyMessage = await agent.packDIDCommMessage({
          packing: 'authcrypt',
          message: {
            type: 'https://didcomm.org/coordinate-mediation/3.0/mediate-deny',
            from: mediator.did,
            to: [recipient.did],
            id: msgid,
            thid: '',
            body: {},
          },
        })
        await agent.sendDIDCommMessage({
          messageId: msgid,
          packedMessage: packedDenyMessage,
          recipientDidUrl: recipient.did,
        })

        const didDoc = (await agent.resolveDid({ didUrl: recipient.did })).didDocument
        const service = didDoc?.service?.find((s) => s.id === `${recipient.did}#didcomm-mediator`)
        expect(service).toBeUndefined()
      })

      it('should not save service if mediate request cannot be found', async () => {
        const mediateGrantMessage = createV3MediateGrantMessage(recipient.did, mediator.did, '')
        const packedMessage = await agent.packDIDCommMessage({
          packing: 'authcrypt',
          message: mediateGrantMessage,
        })
        await agent.sendDIDCommMessage({
          messageId: mediateGrantMessage.id,
          packedMessage,
          recipientDidUrl: recipient.did,
        })

        const didDoc = (await agent.resolveDid({ didUrl: recipient.did })).didDocument
        const service = didDoc?.service?.find((s) => s.id === `${recipient.did}#didcomm-mediator`)
        expect(service).toBeUndefined()
      })

      it('should not save service if mediate grant message has bad routing_did', async () => {
        const msgid = '158b8fcb-2e8e-44db-a3aa-eac10a63bfa2l'
        const packedMessage = await agent.packDIDCommMessage({
          packing: 'authcrypt',
          message: {
            type: 'https://didcomm.org/coordinate-mediation/3.0/mediate-grant',
            from: mediator.did,
            to: [recipient.did],
            id: msgid,
            thid: '',
            body: {},
          },
        })
        await agent.sendDIDCommMessage({
          messageId: msgid,
          packedMessage,
          recipientDidUrl: recipient.did,
        })

        const didDoc = (await agent.resolveDid({ didUrl: recipient.did })).didDocument
        const service = didDoc?.service?.find((s) => s.id === `${recipient.did}#didcomm-mediator`)
        expect(service).toBeUndefined()
      })
    })
  })
})
