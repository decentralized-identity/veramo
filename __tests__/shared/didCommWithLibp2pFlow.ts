// noinspection ES6PreferShortImport

import {
  IAgentOptions,
  IDIDManager,
  IEventListener,
  IIdentifier,
  IKey,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '../../packages/core/src'
import { IDIDComm } from '../../packages/did-comm/src'
import { MessagingRouter, RequestWithAgentRouter } from '../../packages/remote-server/src'
import { createLibp2pNode } from '../../packages/libp2p-client/src'
import * as u8a from 'uint8arrays'
// @ts-ignore
import express from 'express'
import { Server } from 'http'
import { jest } from '@jest/globals'
import { Libp2p } from 'libp2p'

import { pipe } from 'it-pipe'
// import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as lp from 'it-length-prefixed'
import map from 'it-map'
import { Uint8ArrayList } from 'uint8arraylist'
import { IAgentLibp2pClient } from '../../packages/libp2p-client/src/types/IAgentLibp2pClient.js'

type ConfiguredAgent = TAgent<IDIDManager & IKeyManager & IResolver & IDIDComm & IMessageHandler & IAgentLibp2pClient>

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
  onEvent: jest.fn(),
}

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('DIDComm using libp2p flow', () => {
    let agent: ConfiguredAgent

    let alice: IIdentifier
    let bob: IIdentifier

    let listenerMultiAddr: string

    // const streamChunkReceivedCb = (msg: any) => {
    //   console.log("called back msg: ", msg)
    // }
    // let didCommEndpointLibp2pNode: Libp2p

    // let didCommEndpointServer: Server
    // let listeningPort = Math.round(Math.random() * 32000 + 2048)

    beforeAll(async () => {
      await testContext.setup({ plugins: [DIDCommEventSniffer] })
      // agent = testContext.getAgent()
      // console.log("agent: ", agent)
      // alice = await agent.didManagerImport({
      //   controllerKeyId: 'alice-controller-key',
      //   did: 'did:ethr:ganache:0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      //   provider: 'did:ethr:ganache',
      //   alias: 'alice-did-ethr',
      //   keys: [
      //     {
      //       privateKeyHex: '0000000000000000000000000000000000000000000000000000000000000001',
      //       kms: 'local',
      //       type: 'Secp256k1',
      //       kid: 'alice-controller-key',
      //     },
      //   ],
      // })

    //   bob = await agent.didManagerImport({
    //     controllerKeyId: 'bob-controller-key',
    //     did: 'did:ethr:ganache:0x02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
    //     provider: 'did:ethr:ganache',
    //     alias: 'bob-did-ethr',
    //     keys: [
    //       {
    //         privateKeyHex: '0000000000000000000000000000000000000000000000000000000000000002',
    //         kms: 'local',
    //         type: 'Secp256k1',
    //         kid: 'bob-controller-key',
    //       },
    //     ],
    //   })
    //   listenerMultiAddr = agent.getListenerMultiAddrs()[0].toString()
    })

    it('should run dummy test', async () => {
      expect(true).toBeTruthy()
    })

    afterAll(async () => {
      // await didCommEndpointLibp2pNode.stop()
      await testContext.tearDown()
    })

    // it('should add DIDComm service to receiver DID with serviceEndpoint as string', async () => {
    //   const result = await agent.didManagerAddService({
    //     did: alice.did,
    //     service: {
    //       id: 'alice-didcomm-endpoint',
    //       type: 'DIDCommMessaging',
    //       serviceEndpoint: {
    //         multiAddr: listenerMultiAddr,
    //         transportType: 'libp2p'
    //       },
    //       description: 'handles DIDComm messages',
    //     },
    //   })
    //   expect(result.substr(0, 2)).toEqual('0x')

    //   const resolution = await agent.resolveDid({ didUrl: alice.did })
    //   const service = resolution.didDocument?.service
    //   const serv = service![0]
    //   const endpoint = serv.serviceEndpoint
    //   const multiAddr = (endpoint as any).multiAddr
    //   expect(multiAddr).toEqual(listenerMultiAddr)
    //   // expect(service).toBeDefined()
    //   // expect(service?.length).toBeGreaterThanOrEqual(1)
    //   // console.log("service![0].serviceEndpoint['multiAddr']: ", service![0].serviceEndpoint['multiAddr'])
    //   // expect(service![0].serviceEndpoint['multiAddr']).toEqual(listenerMultiAddr)
    //   // expect(resolution?.didDocument?.service?[0].serviceEndpoint['multiAddr']).toEqual(
    //   //   listenerMultiAddr,
    //   // )
    // })

    // it('should send an signed message from bob to alice with serviceEndpoint as string', async () => {
    //   console.log("expect 2.")
    //   expect.assertions(2)
    //   const message = {
    //     type: 'test',
    //     to: alice.did,
    //     from: bob.did,
    //     id: 'test-jws-success',
    //     body: { hello: 'world' },
    //   }
    //   const packedMessage = await agent.packDIDCommMessage({
    //     packing: 'jws',
    //     message,
    //   })
    //   console.log("packedMessage: ", packedMessage)
    //   expect(packedMessage.message).toEqual(
    //     JSON.stringify({
    //       "protected":"eyJhbGciOiJFUzI1NksiLCJraWQiOiJkaWQ6ZXRocjpnYW5hY2hlOjB4MDJjNjA0N2Y5NDQxZWQ3ZDZkMzA0NTQwNmU5NWMwN2NkODVjNzc4ZTRiOGNlZjNjYTdhYmFjMDliOTVjNzA5ZWU1I2NvbnRyb2xsZXIiLCJ0eXAiOiJhcHBsaWNhdGlvbi9kaWRjb21tLXNpZ25lZCtqc29uIn0",
    //       "payload":"eyJ0eXBlIjoidGVzdCIsInRvIjoiZGlkOmV0aHI6Z2FuYWNoZToweDAyNzliZTY2N2VmOWRjYmJhYzU1YTA2Mjk1Y2U4NzBiMDcwMjliZmNkYjJkY2UyOGQ5NTlmMjgxNWIxNmY4MTc5OCIsImZyb20iOiJkaWQ6ZXRocjpnYW5hY2hlOjB4MDJjNjA0N2Y5NDQxZWQ3ZDZkMzA0NTQwNmU5NWMwN2NkODVjNzc4ZTRiOGNlZjNjYTdhYmFjMDliOTVjNzA5ZWU1IiwiaWQiOiJ0ZXN0LWp3cy1zdWNjZXNzIiwiYm9keSI6eyJoZWxsbyI6IndvcmxkIn19",
    //       "signature":"al8yQ2XqV8y7Sj99zPmG6bwQyS68c9Rqg_IkhWOp7_1_rVO1wGICUnas1Bt7h3MQSGbkgmYtJ3Br5LdLXpSfyg"
    //     })
    //   )
    //   const result = await agent.sendDIDCommMessage({
    //     messageId: 'test-jws-success',
    //     packedMessage,
    //     recipientDidUrl: alice.did,
    //   })
    //   console.log("result: ", result)
    //   await new Promise(r => setTimeout(r, 200));
    //   expect(result).toBeTruthy()
    // })

    
    // it('should receive a message', async () => {
    //   expect.assertions(1)
    //   const multiAddrs = await agent.getListenerMultiAddrs()
    //   console.log("multiAddrs: ", multiAddrs)
    //   const result = await agent.didManagerAddService({
    //     did: bob.did,
    //     service: {
    //       id: 'bob-didcomm-endpoint',
    //       type: 'DIDCommMessaging',
    //       serviceEndpoint: {
    //         multiAddr: multiAddrs[0].toString(),
    //         transportType: 'libp2p'
    //       },
    //       description: 'handles DIDComm messages',
    //     },
    //   })

    //   const message = {
    //     type: 'test',
    //     to: bob.did,
    //     from: alice.did,
    //     id: 'test-jws-success',
    //     body: { hello: 'world' },
    //   }
    //   const packedMessage = await agent.packDIDCommMessage({
    //     packing: 'jws',
    //     message,
    //   })
    //   console.log("packedMessage: ", packedMessage)
    //   // expect(packedMessage.message).toEqual(
    //   //   JSON.stringify({
    //   //     "protected":"eyJhbGciOiJFUzI1NksiLCJraWQiOiJkaWQ6ZXRocjpnYW5hY2hlOjB4MDJjNjA0N2Y5NDQxZWQ3ZDZkMzA0NTQwNmU5NWMwN2NkODVjNzc4ZTRiOGNlZjNjYTdhYmFjMDliOTVjNzA5ZWU1I2NvbnRyb2xsZXIiLCJ0eXAiOiJhcHBsaWNhdGlvbi9kaWRjb21tLXNpZ25lZCtqc29uIn0",
    //   //     "payload":"eyJ0eXBlIjoidGVzdCIsInRvIjoiZGlkOmV0aHI6Z2FuYWNoZToweDAyNzliZTY2N2VmOWRjYmJhYzU1YTA2Mjk1Y2U4NzBiMDcwMjliZmNkYjJkY2UyOGQ5NTlmMjgxNWIxNmY4MTc5OCIsImZyb20iOiJkaWQ6ZXRocjpnYW5hY2hlOjB4MDJjNjA0N2Y5NDQxZWQ3ZDZkMzA0NTQwNmU5NWMwN2NkODVjNzc4ZTRiOGNlZjNjYTdhYmFjMDliOTVjNzA5ZWU1IiwiaWQiOiJ0ZXN0LWp3cy1zdWNjZXNzIiwiYm9keSI6eyJoZWxsbyI6IndvcmxkIn19",
    //   //     "signature":"al8yQ2XqV8y7Sj99zPmG6bwQyS68c9Rqg_IkhWOp7_1_rVO1wGICUnas1Bt7h3MQSGbkgmYtJ3Br5LdLXpSfyg"
    //   //   })
    //   // )

    //   // send over libp2p manually
      

    //   // receive in agent

    //   const result2 = await agent.sendDIDCommMessage({
    //     messageId: 'test-jws-success',
    //     packedMessage,
    //     recipientDidUrl: bob.did,
    //   })
    //   console.log("result2 ", result2)
    //   await new Promise(r => setTimeout(r, 200));
    //   expect(result).toBeTruthy()
    // })

  })
}
