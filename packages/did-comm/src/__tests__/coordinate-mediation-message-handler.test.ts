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
  createRecipientUpdateMessage,
  UpdateAction,
  RecipientUpdateResult,
  MediationStatus,
} from '../protocols/coordinate-mediation-message-handler.js'
import type { Update } from '../protocols/coordinate-mediation-message-handler.js'
import { FakeDidProvider, FakeDidResolver } from '../../../test-utils/src'
import { MessagingRouter, RequestWithAgentRouter } from '../../../remote-server/src'
import { Entities, IDataStore, migrations } from '../../../data-store/src'

import express from 'express'
import { Server } from 'http'
import { DIDCommMessageHandler } from '../message-handler.js'
import { DataStore, DataStoreORM } from '../../../data-store/src'
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
        new DIDComm([new DIDCommHttpTransport()]),
        new MessageHandler({
          messageHandlers: [
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

  const expectMessageSent = (msgid: string) => {
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: msgid,
        type: 'DIDCommV2Message-sent',
      },
      expect.anything(),
    )
  }

  const expectReceiveRequest = (id: string, from = recipient.did) => {
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          message: {
            body: {},
            from,
            id,
            to: mediator.did,
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

  const expectRecipientRemovedResponse = (msgid: string, recipient_did: string) => {
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          message: {
            from: mediator.did,
            id: expect.anything(),
            thid: msgid,
            to: recipient.did,
            created_time: expect.anything(),
            type: 'https://didcomm.org/coordinate-mediation/3.0/recipient',
            body: {
              updates: [
                {
                  action: 'remove',
                  recipient_did,
                  result: RecipientUpdateResult.SUCCESS,
                },
              ],
            },
          },
          metaData: { packing: 'authcrypt' },
        },
        type: 'DIDCommV2Message-received',
      },
      expect.anything(),
    )
  }

  const expectRecipientNoChangeResponse = (msgid: string, recipient_did: string) => {
    expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      {
        data: {
          message: {
            from: mediator.did,
            id: expect.anything(),
            thid: msgid,
            to: recipient.did,
            created_time: expect.anything(),
            type: 'https://didcomm.org/coordinate-mediation/3.0/recipient',
            body: {
              updates: [
                {
                  action: 'add',
                  recipient_did,
                  result: RecipientUpdateResult.NO_CHANGE,
                },
              ],
            },
          },
          metaData: { packing: 'authcrypt' },
        },
        type: 'DIDCommV2Message-received',
      },
      expect.anything(),
    )
  }

  describe('mediator', () => {
    describe('MEDIATE REQUEST', () => {
      const expectGrantRequest = (msgid: string) => {
        expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
          {
            data: {
              message: {
                body: { routing_did: [mediator.did] },
                from: mediator.did,
                id: expect.anything(),
                thid: msgid,
                to: recipient.did,
                created_time: expect.anything(),
                type: 'https://didcomm.org/coordinate-mediation/3.0/mediate-grant',
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
                to,
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

      it('should receive a mediate request', async () => {
        const message = createMediateRequestMessage(recipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)

        expectReceiveRequest(message.id)
      })

      it('should save the mediation status to the db where request is GRANTED', async () => {
        const message = createMediateRequestMessage(recipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)
        const mediation = await agent.dataStoreGetMediation({
          did: recipient.did,
          status: MediationStatus.GRANTED,
        })

        expect(mediation.status).toBe(MediationStatus.GRANTED)
        expect(mediation.did).toBe('did:fake:z6MkgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo')
      })

      it('should record the mediation status to the db where request is DENIED', async () => {
        const message = createMediateRequestMessage(denyRecipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)
        const mediation = await agent.dataStoreGetMediation({
          did: denyRecipient.did,
          status: MediationStatus.DENIED,
        })

        expect(mediation.status).toBe(MediationStatus.DENIED)
        expect(mediation.did).toBe('did:fake:dENygbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo')
      })

      it('should respond correctly to a mediate request where GRANTED', async () => {
        const message = createMediateRequestMessage(recipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)

        expectMessageSent(messageId)
        expectReceiveRequest(messageId)
        expectMessageSent(messageId)
        expectGrantRequest(messageId)
      })

      it('should respond correctly to a mediate request where DENIED', async () => {
        const message = createMediateRequestMessage(denyRecipient.did, mediator.did)
        const messageId = message.id
        const packedMessageContents = { packing: 'authcrypt', message: message } as const
        const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
        const recipientDidUrl = mediator.did
        const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
        await agent.sendDIDCommMessage(didCommMessageContents)

        expectMessageSent(messageId)
        expectReceiveRequest(messageId, denyRecipient.did)
        expectMessageSent(messageId)
        expectDenyRequest(messageId, denyRecipient.did)
      })
    })
  })

  describe('RECIPIENT UPDATE', () => {
    const expectUpdateRequest = (msgid: string, updates: Update[]) => {
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { updates },
              return_route: 'all',
              from: recipient.did,
              id: msgid,
              to: mediator.did,
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

    it('should receive an update request', async () => {
      const messageId = '858b8fcb-2e8e-44db-a3aa-eac10a63bfa2l'
      const recipientDidToAdd = 'did:fake:testgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo'
      const update = { recipient_did: recipientDidToAdd, action: UpdateAction.ADD }
      const message = createRecipientUpdateMessage(recipient.did, mediator.did, [update])
      message.id = messageId
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)

      expectUpdateRequest(messageId, [update])
    })

    it('should add a new recipient_did', async () => {
      const recipient_did = 'did:fake:testgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo'
      const update = { recipient_did, action: UpdateAction.ADD }
      const message = createRecipientUpdateMessage(recipient.did, mediator.did, [update])
      const messageId = message.id
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)
      const [result] = await agent.dataStoreGetRecipientDids({ did: recipient.did })
      console.log('result', result)

      expect(result.recipient_did).toBe(recipient_did)
      expect(result.did).toBe(recipient.did)

      expect(true).toBe(false)
    })

    it.skip('should remove an existing recipient_did', async () => {
      const messageId = '228b8fcb-2e8e-44db-a3aa-eac10a63bfa2l'
      const recipient_did = 'did:fake:testgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo'
      const update = { recipient_did, action: UpdateAction.ADD }
      const message = createRecipientUpdateMessage(recipient.did, mediator.did, [update])
      message.id = messageId
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)
      const [result] = await agent.dataStoreGetRecipientDids({ did: recipient.did })

      expect(result).toBe(recipient_did)
    })

    it.skip('should respond correctly to a recipient update request on SUCCESS', async () => {
      const messageId = '228b8fcb-2e8e-44db-a3aa-eac10a63bfa2l'
      const recipient_did = 'did:fake:testgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo'
      const update = { recipient_did, action: UpdateAction.REMOVE }
      const message = createRecipientUpdateMessage(recipient.did, mediator.did, [update])
      message.id = messageId
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)

      expectRecipientRemovedResponse(messageId, recipient_did)
    })

    it.skip('should respond correctly to a recipient update request on NO_CHANGE', async () => {
      const messageId = '228b8fcb-2e8e-44db-a3aa-eac10a63bfa2l'
      const recipient_did = 'did:fake:testgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo'
      const update = { recipient_did, action: UpdateAction.ADD }
      const message = createRecipientUpdateMessage(recipient.did, mediator.did, [update])
      message.id = messageId
      const packedMessageContents = { packing: 'authcrypt', message } as const
      const packedMessage = await agent.packDIDCommMessage(packedMessageContents)
      const recipientDidUrl = mediator.did
      const didCommMessageContents = { messageId, packedMessage, recipientDidUrl }
      await agent.sendDIDCommMessage(didCommMessageContents)

      expectRecipientNoChangeResponse(messageId, recipient_did)
    })
  })

  describe('recipient', () => {
    describe('MEDIATE REQUEST RESPONSE', () => {
      it('should save new service on mediate grant', async () => {
        const messageId = '858b8fcb-2e8e-44db-a3aa-eac10a63bfa2l'
        const mediateRequestMessage = createMediateRequestMessage(recipient.did, mediator.did)
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
        const mediateRequestMessage = createMediateRequestMessage(recipient.did, mediator.did)
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
            to: recipient.did,
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
        const msgid = '158b8fcb-2e8e-44db-a3aa-eac10a63bfa2l'
        const packedMessage = await agent.packDIDCommMessage({
          packing: 'authcrypt',
          message: {
            type: 'https://didcomm.org/coordinate-mediation/3.0/mediate-grant',
            from: mediator.did,
            to: recipient.did,
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

    describe('UPDATE RECIPIENT RESPONSE', () => {
      // TODO: update recipient response tests
    })
  })
})
