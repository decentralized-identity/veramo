import { beforeAll, jest } from '@jest/globals'

// @ts-ignore
import express from 'express'
// import cors from 'cors'
import {
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '../packages/core-types/src'
import { MessagingRouter, RequestWithAgentRouter } from '../packages/remote-server/src'

import { createAgent, IAgentOptions } from '../packages/core/src'

import { DIDResolverPlugin } from '../packages/did-resolver/src'
import { MessageHandler } from '../packages/message-handler/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../packages/key-manager/src'
import { DIDManager, MemoryDIDStore } from '../packages/did-manager/src'
import { getResolver as getDidPeerResolver, PeerDIDProvider } from '../packages/did-provider-peer/src'
import {
  CoordinateMediation,
  CoordinateMediationV3MediatorMessageHandler,
  createV3DeliveryRequestMessage,
  createV3MediateRequestMessage,
  createV3RecipientQueryMessage,
  createV3RecipientUpdateMessage,
  DIDComm,
  DIDCommMessageHandler,
  IDIDComm,
  PickupMediatorMessageHandler,
  PickupRecipientMessageHandler,
  RoutingMessageHandler,
  UpdateAction,
} from '../packages/did-comm/src'
import {
  IMediationManager,
  MediationManagerPlugin,
  MediationResponse,
  PreMediationRequestPolicy,
  RequesterDid,
} from '../packages/mediation-manager/src'
import { KeyManagementSystem } from '../packages/kms-local/src'
import { DataStoreJson } from '../packages/data-store-json/src'
import { KeyValueStore } from '../packages/kv-store/src'
import { Server } from 'http'
import { DELIVERY_MESSAGE_TYPE } from '../packages/did-comm/src/protocols/messagepickup-message-handler'

const MEDIATOR_PORT = 3333
jest.fn(() => Promise.resolve())
// minimum set of plugins for users
type UserAgentPlugins = IResolver & IKeyManager & IDIDManager & IMessageHandler & IDIDComm

// minimum set of plugins for mediator
type MediatorPlugins = UserAgentPlugins & IMediationManager & IDataStoreORM & IDataStore

const defaultKms = 'local'

function createMediatorAgent(options?: IAgentOptions): TAgent<MediatorPlugins> {
  let memoryJsonStore = { notifyUpdate: () => Promise.resolve() }

  let policyStore = new KeyValueStore<PreMediationRequestPolicy>({
    namespace: 'mediation_policy',
    store: new Map<string, PreMediationRequestPolicy>(),
  })

  let mediationStore = new KeyValueStore<MediationResponse>({
    namespace: 'mediation_response',
    store: new Map<string, MediationResponse>(),
  })

  let recipientDidStore = new KeyValueStore<RequesterDid>({
    namespace: 'recipient_did',
    store: new Map<string, RequesterDid>(),
  })

  return createAgent<MediatorPlugins>({
    ...options,
    plugins: [
      new DIDResolverPlugin({
        ...getDidPeerResolver(),
      }),
      new KeyManager({
        store: new MemoryKeyStore(),
        kms: {
          [defaultKms]: new KeyManagementSystem(
            new MemoryPrivateKeyStore(),
          ),
        },
      }),
      new DIDManager({
        store: new MemoryDIDStore(),
        defaultProvider: 'did:peer',
        providers: {
          'did:peer': new PeerDIDProvider({ defaultKms }),
        },
      }),
      new DataStoreJson(memoryJsonStore),
      new MessageHandler({
        messageHandlers: [
          new DIDCommMessageHandler(),
          // new TrustPingMessageHandler(),
          new CoordinateMediationV3MediatorMessageHandler(),
          new RoutingMessageHandler(),
          new PickupMediatorMessageHandler(),
        ],
      }),
      new DIDComm(),
      // @ts-ignore
      new MediationManagerPlugin(true, policyStore, mediationStore, recipientDidStore),
      ...(options?.plugins || []),
    ],
  })
}

function createUserAgent(options?: IAgentOptions): TAgent<UserAgentPlugins> {

  return createAgent<UserAgentPlugins>({
    ...options,
    plugins: [
      new DIDResolverPlugin({
        ...getDidPeerResolver(),
      }),
      new KeyManager({
        store: new MemoryKeyStore(),
        kms: {
          [defaultKms]: new KeyManagementSystem(new MemoryPrivateKeyStore()),
        },
      }),
      new DIDManager({
        store: new MemoryDIDStore(),
        defaultProvider: 'did:peer',
        providers: {
          'did:peer': new PeerDIDProvider({ defaultKms }),
        },
      }),
      // new DataStoreJson(memoryJsonStore),
      new MessageHandler({
        messageHandlers: [
          new DIDCommMessageHandler(),
          // new TrustPingMessageHandler(),
          // new CoordinateMediationV3RecipientMessageHandler(), // not needed for did:peer:2
          new PickupRecipientMessageHandler(),
        ],
      }),
      new DIDComm(),
    ],
  })
}

/**
 * This test suite demonstrates how to use the did-comm mediation to send messages between two agents.
 *
 *
 */
describe('did-comm mediation', () => {
  let didCommEndpointServer: Server
  let mediatorDID: string
  let aliceDID: string
  let aliceAgent: TAgent<UserAgentPlugins>
  let bobDID: string
  let bobAgent: TAgent<UserAgentPlugins>

  beforeAll(async () => {
    const mediator = createMediatorAgent()
    const messagingPath = '/messaging'

    const mediatorIdentifier = await mediator.didManagerCreate({
      provider: 'did:peer',
      options: {
        num_algo: 2,
        service: {
          id: '#messaging1',
          type: 'DIDCommMessaging',
          serviceEndpoint: `http://localhost:${MEDIATOR_PORT}${messagingPath}`,
        },
      },
    })
    mediatorDID = mediatorIdentifier.did
    console.log(`mediator DID: ${mediatorDID}`)

    // start a mediator service
    await new Promise((resolve) => {
      const requestWithAgent = RequestWithAgentRouter({ agent: mediator })
      // set up a server to receive HTTP messages and pipe them to the mediator as DIDComm messages
      const app = express()
      // app.use(cors()) // Use this for real servers
      app.use(
        messagingPath,
        requestWithAgent,
        MessagingRouter({
          metaData: { type: 'mediator-incoming' },
          save: false,
        }),
      )
      didCommEndpointServer = app.listen(MEDIATOR_PORT, () => {
        console.log(`Mediator listening on port ${MEDIATOR_PORT}`)
        resolve(true)
      })
    })

    aliceAgent = createUserAgent()
    const aliceIdentifier = await aliceAgent.didManagerCreate({
      provider: 'did:peer',
      options: { num_algo: 2, service: { type: 'DIDCommMessaging', serviceEndpoint: mediatorDID } },
    })
    aliceDID = aliceIdentifier.did

    bobAgent = createUserAgent()
    const bobIdentifier = await bobAgent.didManagerCreate({
      provider: 'did:peer',
      options: { num_algo: 2 },
    })
    bobDID = bobIdentifier.did
  })

  afterAll(async () => {
    try {
      await new Promise((resolve, reject) => didCommEndpointServer?.close(resolve) ?? reject('no server'))
    } catch (e) {
      //nop
    }
  })

  it('should query for mediation for Alice', async () => {
    const msg = createV3RecipientQueryMessage(aliceDID, mediatorDID)
    const packed = await aliceAgent.packDIDCommMessage({ packing: 'anoncrypt', message: msg })
    const res = await aliceAgent.sendDIDCommMessage({
      packedMessage: packed,
      recipientDidUrl: mediatorDID,
      messageId: msg.id,
    })
    expect(res.returnMessage?.type).toBe(CoordinateMediation.RECIPIENT_QUERY_RESPONSE)
    expect((res.returnMessage?.data as any)?.dids).toEqual([])
  })

  it('should request for mediation and update the DID for Alice', async () => {
    const request = createV3MediateRequestMessage(aliceDID, mediatorDID)
    const packedRequest = await aliceAgent.packDIDCommMessage({ packing: 'anoncrypt', message: request })
    const mediationResponse = await aliceAgent.sendDIDCommMessage({
      packedMessage: packedRequest,
      recipientDidUrl: mediatorDID,
      messageId: request.id,
    })
    expect(mediationResponse.returnMessage?.type).toBe(CoordinateMediation.MEDIATE_GRANT)
    expect((mediationResponse.returnMessage?.data as any)?.routing_did).toEqual([mediatorDID])

    const update = createV3RecipientUpdateMessage(aliceDID, mediatorDID, [
      {
        recipient_did: aliceDID,
        action: UpdateAction.ADD,
      },
    ])
    const packedUpdate = await aliceAgent.packDIDCommMessage({ packing: 'anoncrypt', message: update })
    const updateResponse = await aliceAgent.sendDIDCommMessage({
      packedMessage: packedUpdate,
      recipientDidUrl: mediatorDID,
      messageId: update.id,
    })
    expect(updateResponse.returnMessage?.type).toBe(CoordinateMediation.RECIPIENT_UPDATE_RESPONSE)
    expect((updateResponse.returnMessage?.data as any)?.updates).toEqual([
      {
        recipient_did: aliceDID,
        action: UpdateAction.ADD,
        result: 'success',
      },
    ])

    const query = createV3RecipientQueryMessage(aliceDID, mediatorDID)
    const packedQuery = await aliceAgent.packDIDCommMessage({ packing: 'anoncrypt', message: query })
    const queryResponse = await aliceAgent.sendDIDCommMessage({
      packedMessage: packedQuery,
      recipientDidUrl: mediatorDID,
      messageId: query.id,
    })
    expect(queryResponse.returnMessage?.type).toBe(CoordinateMediation.RECIPIENT_QUERY_RESPONSE)
    // mediator is finally aware of the mediation. Alice can now tell everyone about her new inbox
    expect((queryResponse.returnMessage?.data as any)?.dids).toEqual([{ recipient_did: aliceDID }])
  })

  async function ensureMediationGranted(aliceAgent: TAgent<UserAgentPlugins>, aliceDID: string) {
    const request = createV3MediateRequestMessage(aliceDID, mediatorDID)
    const packedRequest = await aliceAgent.packDIDCommMessage({ packing: 'anoncrypt', message: request })
    const mediationResponse = await aliceAgent.sendDIDCommMessage({
      packedMessage: packedRequest,
      recipientDidUrl: mediatorDID,
      messageId: request.id,
    })
    if (mediationResponse.returnMessage?.type !== CoordinateMediation.MEDIATE_GRANT) {
      throw new Error('mediation not granted')
    }
    const update = createV3RecipientUpdateMessage(aliceDID, mediatorDID, [
      {
        recipient_did: aliceDID,
        action: UpdateAction.ADD,
      },
    ])
    const packedUpdate = await aliceAgent.packDIDCommMessage({ packing: 'anoncrypt', message: update })
    const updateResponse = await aliceAgent.sendDIDCommMessage({
      packedMessage: packedUpdate,
      recipientDidUrl: mediatorDID,
      messageId: update.id,
    })
    if (
      updateResponse.returnMessage?.type !== CoordinateMediation.RECIPIENT_UPDATE_RESPONSE ||
      (updateResponse.returnMessage?.data as any)?.updates[0].result !== 'success'
    ) {
      throw new Error('mediation update failed')
    }
  }

  it('should send a message from Bob to Alice', async () => {
    await ensureMediationGranted(aliceAgent, aliceDID)

    // bob sends the message
    const msg = {
      type: 'https://didcomm.org/basicmessage/2.0/message',
      from: bobDID,
      to: [aliceDID], // Bob doesn't care that alice is using a mediator
      id: 'test-message',
      body: 'Hi Alice, this is Bob!',
    }
    const packed = await bobAgent.packDIDCommMessage({ packing: 'anoncrypt', message: msg })
    const res = await bobAgent.sendDIDCommMessage({
      packedMessage: packed,
      recipientDidUrl: aliceDID,
      messageId: msg.id,
    })
    expect(res.transportId).toBeDefined()

    // Alice checks her messages
    const deliveryRequest = createV3DeliveryRequestMessage(aliceDID, mediatorDID)
    const packedRequest = await aliceAgent.packDIDCommMessage({
      packing: 'anoncrypt',
      message: deliveryRequest,
    })
    const deliveryResponse = await aliceAgent.sendDIDCommMessage({
      packedMessage: packedRequest,
      recipientDidUrl: mediatorDID,
      messageId: deliveryRequest.id,
    })

    expect(deliveryResponse.returnMessage?.type).toBe(DELIVERY_MESSAGE_TYPE)
    expect(deliveryResponse.returnMessage?.attachments?.length).toBeGreaterThan(0)

    // Alice processes her messages.

    // Technically the messages are already processed by the PickupRecipientMessageHandler,
    // but that doesn't automatically save them.
    // You'd need to listen for the DIDCommV2Message-received event and save the messages manually if you need them
    // later. OR you can use this if you want to process them in-line:
    for (const attachment of deliveryResponse?.returnMessage?.attachments ?? []) {
      const msg = await aliceAgent.handleMessage({ raw: JSON.stringify(attachment.data.json) })
      expect(msg.data).toEqual('Hi Alice, this is Bob!')
    }
  })
})
