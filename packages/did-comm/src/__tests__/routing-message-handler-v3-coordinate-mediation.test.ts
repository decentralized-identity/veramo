import { DIDComm } from '../didcomm.js'
import { KeyValueStore } from '../../../kv-store/src'
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
  MediationResponse,
  IMediationManager,
  PreMediationRequestPolicy,
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
  CoordinateMediation,
  createV3RecipientUpdateMessage,
  Update,
  UpdateAction,
} from '../protocols/coordinate-mediation-v3-message-handler.js'
import { DIDCommMessageMediaType } from '../types/message-types.js'
import {
  RoutingMessageHandler,
  FORWARD_MESSAGE_TYPE,
  QUEUE_MESSAGE_TYPE,
} from '../protocols/routing-message-handler.js'
import { FakeDidProvider, FakeDidResolver } from '../../../test-utils/src'
import { MessagingRouter, RequestWithAgentRouter } from '../../../remote-server/src'
import { Entities, IDataStore, migrations } from '../../../data-store/src'
import express from 'express'
import { Server } from 'http'
import { DIDCommMessageHandler } from '../message-handler.js'
import { DataStore, DataStoreORM } from '../../../data-store/src'
import { DataSource } from 'typeorm'
import { v4 } from 'uuid'
import { MediationManagerPlugin } from '../../../mediation-manager/src'

import { jest } from '@jest/globals'
import 'cross-fetch/polyfill'

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received', 'DIDCommV2Message-forwardMessageQueued'],
  onEvent: jest.fn(() => Promise.resolve()),
}

const policyStore = new KeyValueStore<PreMediationRequestPolicy>({ store: new Map() })
const mediationStore = new KeyValueStore<MediationResponse>({ store: new Map() })
const recipientDidStore = new KeyValueStore<RequesterDid>({ store: new Map() })

describe('routing-message-handler [V3 CoordinateMediation]', () => {
  let recipient: IIdentifier
  let mediator: IIdentifier
  let agent: TAgent<
    IResolver & IKeyManager & IDIDManager & IDIDComm & IMessageHandler & IDataStore & IMediationManager
  >
  let didCommEndpointServer: Server
  let listeningPort = Math.round(Math.random() * 32000 + 2048)
  let dbConnection: DataSource

  beforeAll(async () => {
    dbConnection = new DataSource({
      name: 'test',
      type: 'sqlite',
      database: ':memory:',
      synchronize: false,
      migrations: migrations,
      migrationsRun: true,
      logging: false,
      entities: Entities,
    })
    agent = createAgent({
      plugins: [
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: {
            // @ts-ignore
            local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
          },
        }),
        new DIDManager({
          providers: {
            'did:fake': new FakeDidProvider(),
            // 'did:web': new WebDIDProvider({ defaultKms: 'local' })
          },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:fake',
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...new FakeDidResolver(() => agent).getDidFakeResolver(),
          }),
        }),
        new DIDComm({ transports: [new DIDCommHttpTransport()] }),
        new MessageHandler({
          messageHandlers: [
            new DIDCommMessageHandler(),
            new CoordinateMediationV3MediatorMessageHandler(),
            new CoordinateMediationV3RecipientMessageHandler(),
            new RoutingMessageHandler(),
          ],
        }),
        // @ts-ignore
        new MediationManagerPlugin(true, policyStore, mediationStore, recipientDidStore),
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
        DIDCommEventSniffer,
      ],
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
      // app.use(requestWithAgent)
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
      //nop
    }
    try {
      await dbConnection?.destroy()
    } catch (e: any) {
      // nop
    }
  })

  it('should save forward message in queue for recipient', async () => {
    expect.assertions(2)

    // 1. Request Mediation
    const mediateRequestMessage = createV3MediateRequestMessage(recipient.did, mediator.did)
    const mediateRequestMessageContents = { packing: 'authcrypt', message: mediateRequestMessage } as const
    const packedMediateRequestMessage = await agent.packDIDCommMessage(mediateRequestMessageContents)
    const recipientDidUrl = mediator.did
    await agent.sendDIDCommMessage({
      messageId: mediateRequestMessage.id,
      packedMessage: packedMediateRequestMessage,
      recipientDidUrl,
    })

    // 2. Recipient Update
    const update: Update = { recipient_did: recipient.did, action: UpdateAction.ADD }
    const updateMessage = createV3RecipientUpdateMessage(recipient.did, mediator.did, [update])
    const updateMessageContents = { packing: 'authcrypt', message: updateMessage } as const
    const packedUpdateMessage = await agent.packDIDCommMessage(updateMessageContents)
    await agent.sendDIDCommMessage({
      messageId: updateMessage.id,
      packedMessage: packedUpdateMessage,
      recipientDidUrl,
    })

    // 2. Forward message
    const innerMessage = await agent.packDIDCommMessage({
      packing: 'authcrypt',
      message: {
        type: 'test',
        to: [recipient.did],
        from: mediator.did,
        id: 'test',
        body: { hello: 'world' },
      },
    })
    const msgId = v4()
    const packedForwardMessage = await agent.packDIDCommMessage({
      packing: 'anoncrypt',
      message: {
        type: FORWARD_MESSAGE_TYPE,
        to: [mediator.did],
        id: msgId,
        body: {
          next: recipient.did,
        },
        attachments: [
          { media_type: DIDCommMessageMediaType.ENCRYPTED, data: { json: JSON.parse(innerMessage.message) } },
        ],
      },
    })
    await agent.sendDIDCommMessage({
      messageId: msgId,
      packedMessage: packedForwardMessage,
      recipientDidUrl: mediator.did,
    })

    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          message: {
            body: { next: recipient.did },
            id: msgId,
            to: [mediator.did],
            type: FORWARD_MESSAGE_TYPE,
            attachments: [
              {
                media_type: DIDCommMessageMediaType.ENCRYPTED,
                data: { json: JSON.parse(innerMessage.message) },
              },
            ],
          },
          metaData: { packing: 'anoncrypt' },
        },
        type: 'DIDCommV2Message-received',
      },
      expect.anything(),
    )

    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          id: expect.anything(),
          to: `${recipient.did}#${recipient.keys[0].kid}`,
          type: QUEUE_MESSAGE_TYPE,
          raw: innerMessage.message,
          createdAt: expect.anything(),
          metaData: [{ type: 'didCommForwardMsgId', value: msgId }],
        },
        type: 'DIDCommV2Message-forwardMessageQueued',
      },
      expect.anything(),
    )
  })

  it('should save forward message in queue for recipient previously denied', async () => {
    // set up agent to deny mediation
    agent.isMediateDefaultGrantAll = jest.fn(() => Promise.resolve(false))

    expect.assertions(1)
    // 1. Request Mediation
    const mediateRequestMessage = createV3MediateRequestMessage(recipient.did, mediator.did)
    const mediateRequestMessageContents = { packing: 'authcrypt', message: mediateRequestMessage } as const
    const packedMediateRequestMessage = await agent.packDIDCommMessage(mediateRequestMessageContents)
    const recipientDidUrl = mediator.did
    await agent.sendDIDCommMessage({
      messageId: mediateRequestMessage.id,
      packedMessage: packedMediateRequestMessage,
      recipientDidUrl,
    })

    // 2. Recipient Update
    const update: Update = { recipient_did: recipient.did, action: UpdateAction.ADD }
    const updateMessage = createV3RecipientUpdateMessage(recipient.did, mediator.did, [update])
    const updateMessageContents = { packing: 'authcrypt', message: updateMessage } as const
    const packedUpdateMessage = await agent.packDIDCommMessage(updateMessageContents)
    await agent.sendDIDCommMessage({
      messageId: updateMessage.id,
      packedMessage: packedUpdateMessage,
      recipientDidUrl,
    })

    // 3. Forward message
    const innerMessage = await agent.packDIDCommMessage({
      packing: 'authcrypt',
      message: {
        type: 'test',
        to: [recipient.did],
        from: mediator.did,
        id: 'test',
        body: { hello: 'world' },
      },
    })
    const msgId = v4()
    const packedForwardMessage = await agent.packDIDCommMessage({
      packing: 'anoncrypt',
      message: {
        type: FORWARD_MESSAGE_TYPE,
        to: [mediator.did],
        id: msgId,
        body: {
          next: recipient.did,
        },
        attachments: [
          { media_type: DIDCommMessageMediaType.ENCRYPTED, data: { json: JSON.parse(innerMessage.message) } },
        ],
      },
    })
    await agent.sendDIDCommMessage({
      messageId: msgId,
      packedMessage: packedForwardMessage,
      recipientDidUrl: mediator.did,
    })

    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          id: expect.anything(),
          to: `${recipient.did}#${recipient.keys[0].kid}`,
          type: QUEUE_MESSAGE_TYPE,
          raw: innerMessage.message,
          createdAt: expect.anything(),
          metaData: [{ type: 'didCommForwardMsgId', value: msgId }],
        },
        type: 'DIDCommV2Message-forwardMessageQueued',
      },
      expect.anything(),
    )
  })

  it('should not save forward message in queue for recipient denied', async () => {
    // set up agent to deny mediation
    agent.isMediateDefaultGrantAll = jest.fn(() => Promise.resolve(false))

    expect.assertions(1)
    // 1. Request Mediation
    const mediateRequestMessage = createV3MediateRequestMessage(recipient.did, mediator.did)
    const mediateRequestMessageContents = { packing: 'authcrypt', message: mediateRequestMessage } as const
    const packedMediateRequestMessage = await agent.packDIDCommMessage(mediateRequestMessageContents)
    const recipientDidUrl = mediator.did
    await agent.sendDIDCommMessage({
      messageId: mediateRequestMessage.id,
      packedMessage: packedMediateRequestMessage,
      recipientDidUrl,
    })

    // 2. Recipient Update
    const update: Update = { recipient_did: recipient.did, action: UpdateAction.ADD }
    const updateMessage = createV3RecipientUpdateMessage(recipient.did, mediator.did, [update])
    const updateMessageContents = { packing: 'authcrypt', message: updateMessage } as const
    const packedUpdateMessage = await agent.packDIDCommMessage(updateMessageContents)
    await agent.sendDIDCommMessage({
      messageId: updateMessage.id,
      packedMessage: packedUpdateMessage,
      recipientDidUrl,
    })

    // 3. Save deny message
    await agent.dataStoreSaveMessage({
      message: {
        type: CoordinateMediation.MEDIATE_DENY,
        from: mediator.did,
        to: recipient.did,
        id: v4(),
        createdAt: new Date().toISOString(),
        data: {},
      },
    })

    // 4. Forward message
    const innerMessage = await agent.packDIDCommMessage({
      packing: 'authcrypt',
      message: {
        type: 'test',
        to: [recipient.did],
        from: mediator.did,
        id: 'test',
        body: { hello: 'world' },
      },
    })
    const msgId = v4()
    const packedForwardMessage = await agent.packDIDCommMessage({
      packing: 'anoncrypt',
      message: {
        type: FORWARD_MESSAGE_TYPE,
        to: [mediator.did],
        id: msgId,
        body: {
          next: recipient.did,
        },
        attachments: [
          { media_type: DIDCommMessageMediaType.ENCRYPTED, data: { json: JSON.parse(innerMessage.message) } },
        ],
      },
    })
    await agent.sendDIDCommMessage({
      messageId: msgId,
      packedMessage: packedForwardMessage,
      recipientDidUrl: mediator.did,
    })

    expect(DIDCommEventSniffer.onEvent).not.toHaveBeenCalledWith(
      {
        data: {
          id: expect.anything(),
          to: `${recipient.did}#${recipient.keys[0].kid}`,
          type: QUEUE_MESSAGE_TYPE,
          raw: innerMessage,
          createdAt: expect.anything(),
          metaData: [{ type: 'didCommForwardMsgId', value: msgId }],
        },
        type: 'DIDCommV2Message-forwardMessageQueued',
      },
      expect.anything(),
    )
  })
})
