import { DIDComm } from '../didcomm.js'
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
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'
import { DIDResolverPlugin } from '../../../did-resolver/src'
import { Resolver } from 'did-resolver'
import { DIDCommHttpTransport } from '../transports/transports.js'
import { IDIDComm } from '../types/IDIDComm.js'
import { MessageHandler } from '../../../message-handler/src'
import {
  CoordinateMediationMediatorMessageHandler,
  CoordinateMediationRecipientMessageHandler,
  createMediateRequestMessage,
  MEDIATE_DENY_MESSAGE_TYPE,
} from '../protocols/coordinate-mediation-message-handler.js'
import { DIDCommMessageMediaType } from '../types/message-types.js'
import {
  RoutingMessageHandler,
  FORWARD_MESSAGE_TYPE,
  QUEUE_MESSAGE_TYPE,
} from '../protocols/routing-message-handler.js'
import { FakeDidProvider, FakeDidResolver } from '../../../test-utils/src'
import { MessagingRouter, RequestWithAgentRouter } from '../../../remote-server/src'
import { Entities, IDataStore, migrations } from '../../../data-store/src'
// @ts-ignore
import express from 'express'
import { Server } from 'http'
import { DIDCommMessageHandler } from '../message-handler.js'
import { DataStore, DataStoreORM } from '../../../data-store/src'
import { DataSource } from 'typeorm'
import { v4 } from 'uuid'
import { jest } from '@jest/globals'
import 'cross-fetch/polyfill'

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received', 'DIDCommV2Message-forwardMessageQueued'],
  onEvent: jest.fn(() => Promise.resolve()),
}

describe('routing-message-handler', () => {
  let recipient: IIdentifier
  let mediator: IIdentifier
  let agent: TAgent<IResolver & IKeyManager & IDIDManager & IDIDComm & IMessageHandler & IDataStore>
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
        // @ts-ignore
        new DIDComm([new DIDCommHttpTransport()]),
        new MessageHandler({
          messageHandlers: [
            // @ts-ignore
            new DIDCommMessageHandler(),
            new CoordinateMediationMediatorMessageHandler(),
            new CoordinateMediationRecipientMessageHandler(),
            new RoutingMessageHandler(),
          ],
        }),
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
    // console.log('sender: ', sender)
    // console.log('recipient: ', recipient)

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

    // 1. Coordinate mediation
    const mediateRequestMessage = createMediateRequestMessage(recipient.did, mediator.did)
    const packedMessage = await agent.packDIDCommMessage({
      packing: 'authcrypt',
      message: mediateRequestMessage,
    })
    await agent.sendDIDCommMessage({
      messageId: mediateRequestMessage.id,
      packedMessage,
      recipientDidUrl: mediator.did,
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
    expect.assertions(1)

    // 1. Coordinate mediation
    const mediateRequestMessage = createMediateRequestMessage(recipient.did, mediator.did)
    const packedMessage = await agent.packDIDCommMessage({
      packing: 'authcrypt',
      message: mediateRequestMessage,
    })
    await agent.sendDIDCommMessage({
      messageId: mediateRequestMessage.id,
      packedMessage,
      recipientDidUrl: mediator.did,
    })

    // 2. Save deny message
    await agent.dataStoreSaveMessage({
      message: {
        type: MEDIATE_DENY_MESSAGE_TYPE,
        from: mediator.did,
        to: recipient.did,
        id: v4(),
        createdAt: new Date().toISOString(),
        data: {},
      },
    })

    // 3. Request again
    await agent.sendDIDCommMessage({
      messageId: mediateRequestMessage.id,
      packedMessage,
      recipientDidUrl: mediator.did,
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
    expect.assertions(1)

    // 1. Coordinate mediation
    const mediateRequestMessage = createMediateRequestMessage(recipient.did, mediator.did)
    const packedMessage = await agent.packDIDCommMessage({
      packing: 'authcrypt',
      message: mediateRequestMessage,
    })
    await agent.sendDIDCommMessage({
      messageId: mediateRequestMessage.id,
      packedMessage,
      recipientDidUrl: mediator.did,
    })

    // 2. Save deny message
    await agent.dataStoreSaveMessage({
      message: {
        type: MEDIATE_DENY_MESSAGE_TYPE,
        from: mediator.did,
        to: recipient.did,
        id: v4(),
        createdAt: new Date().toISOString(),
        data: {},
      },
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
