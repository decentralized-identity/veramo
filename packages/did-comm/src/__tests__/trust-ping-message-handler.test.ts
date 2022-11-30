import { DIDComm } from "../didcomm"
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
import { DIDCommHttpTransport } from "../transports/transports"
import { IDIDComm } from "../types/IDIDComm"
import { MessageHandler } from "../../../message-handler/src"
import { createTrustPingMessage, TrustPingMessageHandler } from "../protocols/trust-ping-message-handler"
import { FakeDidProvider, FakeDidResolver } from "../../../test-utils/src"
import { MessagingRouter, RequestWithAgentRouter } from '../../../remote-server/src'
import { Entities, IDataStore, migrations } from '../../../data-store/src'
import express from 'express'
import { Server } from 'http'
import { DIDCommMessageHandler } from "../message-handler"
import { DataStore, DataStoreORM } from "../../../data-store/src"
import { DataSource } from 'typeorm'


const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
  onEvent: jest.fn(),
}

const databaseFile = `./tmp/local-database2-${Math.random().toPrecision(5)}.sqlite`


describe('didComm', () => {
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
          })
        }),
        // @ts-ignore
        new DIDComm([new DIDCommHttpTransport()]),
        new MessageHandler({
          messageHandlers: [
            // @ts-ignore
            new DIDCommMessageHandler(),
            // @ts-ignore
            new TrustPingMessageHandler()
          ]
        }),
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
        DIDCommEventSniffer
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
    // console.log("sender: ", sender)
    // console.log("recipient: ", recipient)

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


  it('should handle trust ping message directly', async () => {
    const tpid = "518be002-de8e-456e-b3d5-8fe472477a86"
    const trustPingMessage = {
      type: 'https://didcomm.org/trust-ping/2.0/ping',
      id: tpid,
      from: sender.did,
      to: recipient.did,
      body: {
          "response_requested": true
      },
      raw: ''
    }
    console.log("go handle trustPingMessage: ", trustPingMessage)
    const handled = await agent.handleMessage({raw: JSON.stringify(trustPingMessage)})
    console.log("handled: ", handled)
    console.log("handled.metaData: ", handled.metaData)
    
    // recipient sends response
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      { 
        data: `${tpid}-response`, 
        type: 'DIDCommV2Message-sent' 
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
            to: sender.did,
            type: 'https://didcomm.org/trust-ping/2.0/ping-response',
          },
          metaData: { packing: 'authcrypt' },
        },
        type: 'DIDCommV2Message-received'
      },
      expect.anything(),
    )

    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledTimes(2)
  })

  it('should handle packed (with authcrypt) trust ping message directly', async () => {
    const trustPingMessage = createTrustPingMessage(sender.did, recipient.did)
    const packedMessage = await agent.packDIDCommMessage({ message: trustPingMessage, packing: 'authcrypt'})
    console.log("go handle trustPingMessage: ", trustPingMessage)
    const handled = await agent.handleMessage({raw: JSON.stringify(packedMessage)})
    console.log("handled 2: ", handled)
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledTimes(4)
  })

  
  it('should handle trust ping message sent via didcomm', async () => {
    const trustPingMessage = createTrustPingMessage(sender.did, recipient.did)
    const packedMessage = await agent.packDIDCommMessage({ packing: 'none', message: trustPingMessage})
    const result = await agent.sendDIDCommMessage({ messageId: trustPingMessage.id, packedMessage, recipientDidUrl: recipient.did })
    console.log("result: ", result)

    // this counts the 2 calls from previous as well, this is not a good way to check this!
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledTimes(8)
  })

   
  it('should handle trust ping message sent via didcomm', async () => {
    const trustPingMessage = createTrustPingMessage(sender.did, recipient.did)
    const packedMessage = await agent.packDIDCommMessage({ packing: 'authcrypt', message: trustPingMessage})
    const result = await agent.sendDIDCommMessage({ messageId: trustPingMessage.id, packedMessage, recipientDidUrl: recipient.did })
    console.log("result: ", result)

    // this counts the 2 calls from fisrt test, 4 from previous (and then 4 from current test), this is not a good way to check this!
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledTimes(12)
  })

})
