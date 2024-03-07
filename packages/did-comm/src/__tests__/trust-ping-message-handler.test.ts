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
import { Resolver } from 'did-resolver'
import { DIDCommHttpTransport } from '../transports/transports.js'
import { IDIDComm } from '../types/IDIDComm.js'
import { MessageHandler } from '../../../message-handler/src'
import { createTrustPingMessage, TrustPingMessageHandler } from '../protocols/trust-ping-message-handler.js'
import { FakeDidProvider, FakeDidResolver } from '../../../test-utils/src'
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
import { asArray } from '../../../utils/src'

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
  onEvent: jest.fn(() => Promise.resolve()),
}


describe('trust-ping-message-handler', () => {
  let sender: IIdentifier
  let recipient: IIdentifier
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
    agent = createAgent<IResolver & IKeyManager & IDIDManager & IDIDComm & IMessageHandler & IDataStore>({
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
        new DIDComm({ transports: [new DIDCommHttpTransport()]}),
        new MessageHandler({
          messageHandlers: [
            // @ts-ignore
            new DIDCommMessageHandler(),
            // @ts-ignore
            new TrustPingMessageHandler(),
          ],
        }),
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
        DIDCommEventSniffer,
      ],
    })

    sender = await agent.didManagerImport({
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

    recipient = await agent.didManagerImport({
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
    } catch (e: any) {
      // nop
    }
    try {
      dbConnection?.destroy()
    } catch (e: any) {
      // nop
    }
  })

  const expectResponse = (tpid: string) => {
    // recipient sends response
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: `${tpid}-response`,
        type: 'DIDCommV2Message-sent',
      },
      expect.anything(),
    )

    // original sender receives response
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          message: {
            body: {},
            from: recipient.did,
            id: `${tpid}-response`,
            thid: tpid,
            to: [sender.did],
            type: 'https://didcomm.org/trust-ping/2.0/ping-response',
          },
          metaData: { packing: 'authcrypt' },
        },
        type: 'DIDCommV2Message-received',
      },
      expect.anything(),
    )
  }

  const expectPing = (tpid: string, packing: string) => {
    // recipient sends response
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: `${tpid}`,
        type: 'DIDCommV2Message-sent',
      },
      expect.anything(),
    )

    // original sender receives response
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          message: {
            body: {
              responseRequested: true,
            },
            from: sender.did,
            id: `${tpid}`,
            to: [recipient.did],
            type: 'https://didcomm.org/trust-ping/2.0/ping',
          },
          metaData: { packing },
        },
        type: 'DIDCommV2Message-received',
      },
      expect.anything(),
    )
  }

  // this test should cover message handler directly without any DIDCommMessageHandler 'pre-processing'
  it('should handle trust ping message directly', async () => {
    const trustPingMessage = createTrustPingMessage(sender.did, recipient.did)
    const {to, ...messageContent} = trustPingMessage
    const tpid = trustPingMessage.id
    let metaData: MetaData[] = []
    await new TrustPingMessageHandler().handle(
      {
        ...messageContent,
        to: asArray(to)[0],
        isValid: () => true,
        addMetaData: (meta) => {
          metaData.push(meta)
        },
        getLastMetaData: () => {
          return { type: 'fake', value: 'fake' }
        },
      },
      { agent },
    )
    expectResponse(tpid)
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledTimes(2)
  })

  it('should pack and unpack trust ping message with none packing', async () => {
    const trustPingMessage = createTrustPingMessage(sender.did, recipient.did)
    const packedMessage = await agent.packDIDCommMessage({ message: trustPingMessage, packing: 'none' })
    const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
    expect(unpackedMessage.message.id).toEqual(trustPingMessage.id)
  })

  it('should pack and unpack trust ping message with authcrypt packing', async () => {
    const trustPingMessage = createTrustPingMessage(sender.did, recipient.did)
    const packedMessage = await agent.packDIDCommMessage({ message: trustPingMessage, packing: 'authcrypt' })
    const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
    expect(unpackedMessage.message.id).toEqual(trustPingMessage.id)
  })

  it('should handle packed (with authcrypt) trust ping message directly', async () => {
    const trustPingMessage = createTrustPingMessage(sender.did, recipient.did)
    const packedMessage = await agent.packDIDCommMessage({ message: trustPingMessage, packing: 'authcrypt' })
    const tpid = trustPingMessage.id
    await agent.handleMessage({ raw: packedMessage.message })

    expectResponse(tpid)
  })

  it('should handle none-packed trust ping message sent via didcomm', async () => {
    const trustPingMessage = createTrustPingMessage(sender.did, recipient.did)
    const packedMessage = await agent.packDIDCommMessage({ packing: 'none', message: trustPingMessage })
    const tpid = trustPingMessage.id
    await agent.sendDIDCommMessage({
      messageId: trustPingMessage.id,
      packedMessage,
      recipientDidUrl: recipient.did,
    })

    // recipient sends response
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: `${tpid}`,
        type: 'DIDCommV2Message-sent',
      },
      expect.anything(),
    )

    // original sender receives response
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          message: {
            body: {
              responseRequested: true,
            },
            from: sender.did,
            id: `${tpid}`,
            to: [recipient.did],
            type: 'https://didcomm.org/trust-ping/2.0/ping',
            typ: 'application/didcomm-plain+json',
          },
          metaData: { packing: 'none' },
        },
        type: 'DIDCommV2Message-received',
      },
      expect.anything(),
    )
  })

  it('should handle authcrypt-packed trust ping message sent via didcomm', async () => {
    const trustPingMessage = createTrustPingMessage(sender.did, recipient.did)
    const tpid = trustPingMessage.id
    const packedMessage = await agent.packDIDCommMessage({ packing: 'authcrypt', message: trustPingMessage })
    await agent.sendDIDCommMessage({
      messageId: trustPingMessage.id,
      packedMessage,
      recipientDidUrl: recipient.did,
    })

    expectPing(tpid, 'authcrypt')
    expectResponse(tpid)
  })
})
