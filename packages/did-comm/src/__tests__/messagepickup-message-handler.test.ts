import { DIDComm } from '../didcomm'
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
import { DIDCommHttpTransport } from '../transports/transports'
import { IDIDComm } from '../types/IDIDComm'
import { MessageHandler } from '../../../message-handler/src'
import { IDIDCommMessage } from '../types/message-types'
import { QUEUE_MESSAGE_TYPE } from '../protocols/routing-message-handler'
import {
  PickupMediatorMessageHandler,
  STATUS_REQUEST_MESSAGE_TYPE,
  STATUS_MESSAGE_TYPE,
} from '../protocols/messagepickup-message-handler'
import { FakeDidProvider, FakeDidResolver } from '../../../test-utils/src'
import { MessagingRouter, RequestWithAgentRouter } from '../../../remote-server/src'
import { Entities, IDataStore, migrations } from '../../../data-store/src'
import express from 'express'
import { Server } from 'http'
import { DIDCommMessageHandler } from '../message-handler'
import { DataStore, DataStoreORM } from '../../../data-store/src'
import { DataSource } from 'typeorm'
import { v4 } from 'uuid'
import { Message } from '@veramo/message-handler'

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received', 'DIDCommV2Message-forwardMessageQueued'],
  onEvent: jest.fn(),
}

const databaseFile = `./tmp/local-database2-${Math.random().toPrecision(5)}.sqlite`

describe('messagepickup-message-handler', () => {
  let recipient: IIdentifier
  let recipient2: IIdentifier
  let mediator: IIdentifier
  let agent: TAgent<IResolver & IKeyManager & IDIDManager & IDIDComm & IMessageHandler & IDataStore>
  let didCommEndpointServer: Server
  let listeningPort = Math.round(Math.random() * 32000 + 2048)
  let dbConnection: DataSource

  beforeAll(async () => {
    dbConnection = new DataSource({
      name: 'test',
      type: 'sqlite',
      database: databaseFile,
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
            new PickupMediatorMessageHandler(),
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

    recipient2 = await agent.didManagerImport({
      did: 'did:fake:recipient2',
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
      alias: 'recipient2',
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
      await new Promise((resolve, reject) => didCommEndpointServer?.close(resolve))
    } catch (e) {
      //nop
    }
  })

  it('should respond to StatusRequest with no recipient_key', async () => {
    expect.assertions(1)

    // 1. Save message in queue
    const innerMessage = await agent.packDIDCommMessage({
      packing: 'authcrypt',
      message: {
        type: 'test',
        to: recipient.did,
        from: mediator.did,
        id: 'test',
        body: { hello: 'world' },
      },
    })

    const messageToQueue = new Message({ raw: innerMessage.message })
    messageToQueue.id = v4()
    messageToQueue.type = QUEUE_MESSAGE_TYPE
    messageToQueue.to = `${recipient.did}#${recipient.keys[0].kid}`
    messageToQueue.createdAt = new Date().toISOString()
    await agent.dataStoreSaveMessage({ message: messageToQueue })

    const messageToQueue1 = new Message({ raw: innerMessage.message })
    messageToQueue1.id = v4()
    messageToQueue1.type = QUEUE_MESSAGE_TYPE
    messageToQueue1.to = `${recipient.did}#some-other-key`
    messageToQueue1.createdAt = new Date().toISOString()
    await agent.dataStoreSaveMessage({ message: messageToQueue1 })

    // 2. Send StatusRequest
    const statusRequestMessage: IDIDCommMessage = {
      id: v4(),
      type: STATUS_REQUEST_MESSAGE_TYPE,
      to: mediator.did,
      from: recipient.did,
      return_route: 'all',
      body: {},
    }
    const packedMessage = await agent.packDIDCommMessage({
      packing: 'authcrypt',
      message: statusRequestMessage,
    })
    await agent.sendDIDCommMessage({
      messageId: statusRequestMessage.id,
      packedMessage,
      recipientDidUrl: mediator.did,
    })

    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          message: {
            body: { message_count: 2, live_delivery: false },
            id: expect.anything(),
            created_time: expect.anything(),
            thid: statusRequestMessage.id,
            to: recipient.did,
            from: mediator.did,
            type: STATUS_MESSAGE_TYPE,
          },
          metaData: { packing: 'authcrypt' },
        },
        type: 'DIDCommV2Message-received',
      },
      expect.anything(),
    )
  })

  it('should respond to StatusRequest with recipient_key', async () => {
    expect.assertions(1)

    // 1. Save messages in queue
    const innerMessage = await agent.packDIDCommMessage({
      packing: 'authcrypt',
      message: {
        type: 'test',
        to: recipient2.did,
        from: mediator.did,
        id: 'test',
        body: { hello: 'world' },
      },
    })

    const messageToQueue = new Message({ raw: innerMessage.message })
    messageToQueue.id = v4()
    messageToQueue.type = QUEUE_MESSAGE_TYPE
    messageToQueue.to = `${recipient2.did}#${recipient2.keys[0].kid}`
    messageToQueue.createdAt = new Date().toISOString()
    await agent.dataStoreSaveMessage({ message: messageToQueue })

    const messageToQueue1 = new Message({ raw: innerMessage.message })
    messageToQueue1.id = v4()
    messageToQueue1.type = QUEUE_MESSAGE_TYPE
    messageToQueue1.to = `${recipient2.did}#some-other-key`
    messageToQueue1.createdAt = new Date().toISOString()
    await agent.dataStoreSaveMessage({ message: messageToQueue1 })

    // 2. Send StatusRequest
    const statusRequestMessage: IDIDCommMessage = {
      id: v4(),
      type: STATUS_REQUEST_MESSAGE_TYPE,
      to: mediator.did,
      from: recipient2.did,
      return_route: 'all',
      body: {
        recipient_key: `${recipient2.did}#${recipient2.keys[0].kid}`,
      },
    }
    const packedMessage = await agent.packDIDCommMessage({
      packing: 'authcrypt',
      message: statusRequestMessage,
    })
    await agent.sendDIDCommMessage({
      messageId: statusRequestMessage.id,
      packedMessage,
      recipientDidUrl: mediator.did,
    })

    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          message: {
            body: {
              message_count: 1,
              live_delivery: false,
              recipient_key: `${recipient2.did}#${recipient2.keys[0].kid}`,
            },
            id: expect.anything(),
            created_time: expect.anything(),
            thid: statusRequestMessage.id,
            to: recipient2.did,
            from: mediator.did,
            type: STATUS_MESSAGE_TYPE,
          },
          metaData: { packing: 'authcrypt' },
        },
        type: 'DIDCommV2Message-received',
      },
      expect.anything(),
    )
  })
  
  it('should not respond to StatusRequest with no return_route', async () => {
	  expect.assertions(1)
  	  const statusRequestMessage: IDIDCommMessage = {
		id: v4(),
		type: STATUS_REQUEST_MESSAGE_TYPE,
		to: mediator.did,
		from: recipient2.did,
		body: {},
	  }
	  const packedMessage = await agent.packDIDCommMessage({
		packing: 'authcrypt',
		message: statusRequestMessage,
	  })
	  await agent.sendDIDCommMessage({
		messageId: statusRequestMessage.id,
		packedMessage,
		recipientDidUrl: mediator.did,
	  })
  
	  expect(DIDCommEventSniffer.onEvent).not.toHaveBeenCalledWith(
		{
		  data: {
			message: {
			  body: expect.anything(),
			  id: expect.anything(),
			  created_time: expect.anything(),
			  thid: statusRequestMessage.id,
			  to: recipient2.did,
			  from: mediator.did,
			  type: STATUS_MESSAGE_TYPE,
			},
			metaData: { packing: 'authcrypt' },
		  },
		  type: 'DIDCommV2Message-received',
		},
		expect.anything(),
	  )
	})
})
