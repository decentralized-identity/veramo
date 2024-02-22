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
  createMediateGrantMessage,
} from '../protocols/coordinate-mediation-message-handler.js'
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
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
  onEvent: jest.fn(() => Promise.resolve()),
}

describe('coordinate-mediation-message-handler', () => {
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
      await new Promise((resolve, reject) => didCommEndpointServer?.close(resolve))
    } catch (e: any) {
      // nop
    }

    try {
      await dbConnection?.destroy()
    } catch (e: any) {
      // nop
    }
  })

  const expectMsg = (msgid: string) => {
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: msgid,
        type: 'DIDCommV2Message-sent',
      },
      expect.anything(),
    )
  }

  const expectReceiveRequest = (msgid: string) => {
    // mediator receives request
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          message: {
            body: {},
            from: recipient.did,
            return_route: 'all',
            id: msgid,
            to: [mediator.did],
            created_time: expect.anything(),
            type: 'https://didcomm.org/coordinate-mediation/2.0/mediate-request',
          },
          metaData: { packing: 'authcrypt' },
        },
        type: 'DIDCommV2Message-received',
      },
      expect.anything(),
    )
  }

  const expectGrantRequest = (msgid: string) => {
    // mediator receives request
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          message: {
            body: {
              routing_did: [mediator.did],
            },
            from: mediator.did,
            id: expect.anything(),
            thid: msgid,
            to: [recipient.did],
            created_time: expect.anything(),
            type: 'https://didcomm.org/coordinate-mediation/2.0/mediate-grant',
          },
          metaData: { packing: 'authcrypt' },
        },
        type: 'DIDCommV2Message-received',
      },
      expect.anything(),
    )
  }

  describe('mediator', () => {
    it('should grant mediation to valid request via return_route', async () => {
      expect.assertions(4)

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
      expectMsg(mediateRequestMessage.id)
      expectReceiveRequest(mediateRequestMessage.id)
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: expect.anything(),
          type: 'DIDCommV2Message-sent',
        },
        expect.anything(),
      )
      expectGrantRequest(mediateRequestMessage.id)
    })
  })

  describe('recipient', () => {
    it('should save new service on mediate grant', async () => {
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

      const didDoc = (await agent.resolveDid({ didUrl: recipient.did })).didDocument
      const service = didDoc?.service?.find((s) => s.id === `${recipient.did}#didcomm-mediator`)
      expect(service?.serviceEndpoint).toEqual([{ uri: mediator.did }])
    })

    it('should remove service on mediate deny', async () => {
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

      const msgid = v4()
      const packedDenyMessage = await agent.packDIDCommMessage({
        packing: 'authcrypt',
        message: {
          type: 'https://didcomm.org/coordinate-mediation/2.0/mediate-deny',
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
      const mediateGrantMessage = createMediateGrantMessage(recipient.did, mediator.did, '')
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
      const msgid = v4()
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'authcrypt',
        message: {
          type: 'https://didcomm.org/coordinate-mediation/2.0/mediate-grant',
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
