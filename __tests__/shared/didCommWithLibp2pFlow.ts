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

type ConfiguredAgent = TAgent<IDIDManager & IKeyManager & IResolver & IDIDComm & IMessageHandler>

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

    const streamChunkReceivedCb = (msg: any) => {
      console.log("called back msg: ", msg)
    }
    let didCommEndpointLibp2pNode: Libp2p

    // let didCommEndpointServer: Server
    // let listeningPort = Math.round(Math.random() * 32000 + 2048)

    beforeAll(async () => {
      await testContext.setup({ plugins: [DIDCommEventSniffer] })
      agent = testContext.getAgent()

      alice = await agent.didManagerImport({
        controllerKeyId: 'alice-controller-key',
        did: 'did:ethr:ganache:0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
        provider: 'did:ethr:ganache',
        alias: 'alice-did-ethr',
        keys: [
          {
            privateKeyHex: '0000000000000000000000000000000000000000000000000000000000000001',
            kms: 'local',
            type: 'Secp256k1',
            kid: 'alice-controller-key',
          },
        ],
      })

      bob = await agent.didManagerImport({
        controllerKeyId: 'bob-controller-key',
        did: 'did:ethr:ganache:0x02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
        provider: 'did:ethr:ganache',
        alias: 'bob-did-ethr',
        keys: [
          {
            privateKeyHex: '0000000000000000000000000000000000000000000000000000000000000002',
            kms: 'local',
            type: 'Secp256k1',
            kid: 'bob-controller-key',
          },
        ],
      })

      didCommEndpointLibp2pNode = await createLibp2pNode()
      console.log("didCommEndpointLibp2pNode: ", didCommEndpointLibp2pNode)
      didCommEndpointLibp2pNode.handle('didcomm/v2', async ({ stream }) => {
        // // Send stdin to the stream
        // stdinToStream(stream)
        // // Read the stream and output to console
        // streamToConsole(stream)
        console.log("handle stream: ", stream)
        console.log("HOLY CRAP")
    
    
        pipe(
          // Read from the stream (the source)
          stream.source,
          // Decode length-prefixed data
          lp.decode(),
          // Turn buffers into strings
          (source) => map(source, (buf: Uint8ArrayList) => uint8ArrayToString(buf.slice())),
          // Sink function
          async function (source) {
            // For each chunk of data
            let message = ""
            for await (const msg of source) {
              // console.log("msg of source: ", msg)
              message = message + (msg.toString().replace('\n',''))
            }
            streamChunkReceivedCb(message)
          }
        )
      })

      await didCommEndpointLibp2pNode.start()
      listenerMultiAddr = didCommEndpointLibp2pNode.getMultiaddrs()[0].toString()
      console.log("listenerMultiAddr: ", listenerMultiAddr)
    })

    afterAll(async () => {
      // shut down libp2p?
      await didCommEndpointLibp2pNode.stop()
      testContext.tearDown()
    })

    it('should have dummy test', async () => {
      expect(true).toBeTruthy()
    })
    it('should add DIDComm service to receiver DID with serviceEndpoint as string', async () => {
      const result = await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'alice-didcomm-endpoint',
          type: 'DIDCommMessaging',
          serviceEndpoint: {
            multiAddr: listenerMultiAddr,
            transportType: 'libp2p'
          },
          description: 'handles DIDComm messages',
        },
      })
      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })
      const service = resolution.didDocument?.service
      const serv = service![0]
      const endpoint = serv.serviceEndpoint
      const multiAddr = (endpoint as any).multiAddr
      expect(multiAddr).toEqual(listenerMultiAddr)
      // expect(service).toBeDefined()
      // expect(service?.length).toBeGreaterThanOrEqual(1)
      // console.log("service![0].serviceEndpoint['multiAddr']: ", service![0].serviceEndpoint['multiAddr'])
      // expect(service![0].serviceEndpoint['multiAddr']).toEqual(listenerMultiAddr)
      // expect(resolution?.didDocument?.service?[0].serviceEndpoint['multiAddr']).toEqual(
      //   listenerMultiAddr,
      // )
    })

    it('should send an signed message from bob to alice with serviceEndpoint as string', async () => {
      expect.assertions(2)

      const message = {
        type: 'test',
        to: alice.did,
        from: bob.did,
        id: 'test-jws-success',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'jws',
        message,
      })
      console.log("packedMessage: ", packedMessage)
      expect(packedMessage.message).toEqual(
        JSON.stringify({
          "protected":"eyJhbGciOiJFUzI1NksiLCJraWQiOiJkaWQ6ZXRocjpnYW5hY2hlOjB4MDJjNjA0N2Y5NDQxZWQ3ZDZkMzA0NTQwNmU5NWMwN2NkODVjNzc4ZTRiOGNlZjNjYTdhYmFjMDliOTVjNzA5ZWU1I2NvbnRyb2xsZXIiLCJ0eXAiOiJhcHBsaWNhdGlvbi9kaWRjb21tLXNpZ25lZCtqc29uIn0",
          "payload":"eyJ0eXBlIjoidGVzdCIsInRvIjoiZGlkOmV0aHI6Z2FuYWNoZToweDAyNzliZTY2N2VmOWRjYmJhYzU1YTA2Mjk1Y2U4NzBiMDcwMjliZmNkYjJkY2UyOGQ5NTlmMjgxNWIxNmY4MTc5OCIsImZyb20iOiJkaWQ6ZXRocjpnYW5hY2hlOjB4MDJjNjA0N2Y5NDQxZWQ3ZDZkMzA0NTQwNmU5NWMwN2NkODVjNzc4ZTRiOGNlZjNjYTdhYmFjMDliOTVjNzA5ZWU1IiwiaWQiOiJ0ZXN0LWp3cy1zdWNjZXNzIiwiYm9keSI6eyJoZWxsbyI6IndvcmxkIn19",
          "signature":"al8yQ2XqV8y7Sj99zPmG6bwQyS68c9Rqg_IkhWOp7_1_rVO1wGICUnas1Bt7h3MQSGbkgmYtJ3Br5LdLXpSfyg"
        })
      )
      const result = await agent.sendDIDCommMessage({
        messageId: 'test-jws-success',
        packedMessage,
        recipientDidUrl: alice.did,
      })
      console.log("result: ", result)
      expect(result).toBeTruthy()
      // expect(result).toBeTruthy()
      // expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      //   { data: 'test-jws-success', type: 'DIDCommV2Message-sent' },
      //   expect.anything(),
      // )
      // // in our case, it is the same agent that is receiving the messages
      // expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      //   {
      //     data: {
      //       message: {
      //         body: { hello: 'world' },
      //         from: bob.did,
      //         id: 'test-jws-success',
      //         to: alice.did,
      //         type: 'test',
      //       },
      //       metaData: { packing: 'jws' },
      //     },
      //     type: 'DIDCommV2Message-received',
      //   },
      //   expect.anything(),
      // )
    })

    // it('should remove DIDComm service from receiver', async () => {
    //   const result = await agent.didManagerRemoveService({
    //     did: alice.did,
    //     id: 'alice-didcomm-endpoint',
    //   })

    //   expect(result.substr(0, 2)).toEqual('0x')

    //   const resolution = await agent.resolveDid({ didUrl: alice.did })

    //   expect(resolution?.didDocument).not.toBeNull()
    //   expect([...(resolution?.didDocument?.service || [])]).toEqual([])
    // })


  //   it('should add encryption key to receiver DID', async () => {
  //     const newKey = await agent.keyManagerCreate({
  //       kms: 'local',
  //       type: 'X25519',
  //     })

  //     const result = await agent.didManagerAddKey({
  //       did: alice.did,
  //       key: newKey,
  //     })

  //     expect(result.substr(0, 2)).toEqual('0x')
  //     const resolution = await agent.resolveDid({ didUrl: alice.did })
  //     const expectedBase58Key = u8a.toString(u8a.fromString(newKey.publicKeyHex, 'base16'), 'base58btc')
  //     expect(resolution?.didDocument?.verificationMethod?.[2].publicKeyBase58).toEqual(expectedBase58Key)
  //     expect(resolution?.didDocument?.keyAgreement?.[0]).toEqual(
  //       resolution?.didDocument?.verificationMethod?.[2].id,
  //     )
  //   })

  //   it('should send an anoncrypt message from bob to alice', async () => {
  //     expect.assertions(3)

  //     const message = {
  //       type: 'test',
  //       to: alice.did,
  //       from: bob.did,
  //       id: 'test-anoncrypt-success',
  //       body: { hello: 'world' },
  //     }
  //     const packedMessage = await agent.packDIDCommMessage({
  //       packing: 'anoncrypt',
  //       message,
  //     })
  //     const result = await agent.sendDIDCommMessage({
  //       messageId: 'test-anoncrypt-success',
  //       packedMessage,
  //       recipientDidUrl: alice.did,
  //     })

  //     expect(result).toBeTruthy()
  //     expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
  //       { data: 'test-anoncrypt-success', type: 'DIDCommV2Message-sent' },
  //       expect.anything(),
  //     )
  //     // in our case, it is the same agent that is receiving the messages
  //     expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
  //       {
  //         data: {
  //           message: {
  //             body: { hello: 'world' },
  //             from: 'did:ethr:ganache:0x02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  //             id: 'test-anoncrypt-success',
  //             to: 'did:ethr:ganache:0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  //             type: 'test',
  //           },
  //           metaData: { packing: 'anoncrypt' },
  //         },
  //         type: 'DIDCommV2Message-received',
  //       },
  //       expect.anything(),
  //     )
  //   })

  //   it('should fail to send jws message from alice to bob (no service endpoint)', async () => {
  //     expect.assertions(1)

  //     const message = {
  //       type: 'test',
  //       to: bob.did,
  //       from: alice.did,
  //       id: 'test-endpoint-fail',
  //       body: { hello: 'world' },
  //     }
  //     const packedMessage = await agent.packDIDCommMessage({
  //       packing: 'jws',
  //       message,
  //     })
  //     await expect(
  //       agent.sendDIDCommMessage({
  //         messageId: 'test-endpoint-fail',
  //         packedMessage,
  //         recipientDidUrl: bob.did,
  //       }),
  //     ).rejects.toThrowError(/^not_found: could not find DIDComm Messaging service in DID document for/)
  //   })

  //   it('should fail to pack an authcrypt message from bob to alice (no skid)', async () => {
  //     expect.assertions(1)

  //     const message = {
  //       type: 'test',
  //       to: alice.did,
  //       from: bob.did,
  //       id: 'test-authcrypt-fail',
  //       body: { hello: 'world' },
  //     }
  //     const packedMessage = await expect(
  //       agent.packDIDCommMessage({
  //         packing: 'authcrypt',
  //         message,
  //       }),
  //     ).rejects.toThrowError(/^key_not_found: could not map an agent key to an skid for/)
  //   })

  //   it('should add encryption key to sender DID', async () => {
  //     const newKey = await agent.keyManagerCreate({
  //       kms: 'local',
  //       type: 'X25519',
  //     })

  //     const result = await agent.didManagerAddKey({
  //       did: bob.did,
  //       key: newKey,
  //     })

  //     expect(result.substr(0, 2)).toEqual('0x')
  //     const resolution = await agent.resolveDid({ didUrl: bob.did })
  //     const expectedBase58Key = u8a.toString(u8a.fromString(newKey.publicKeyHex, 'base16'), 'base58btc')
  //     expect(resolution?.didDocument?.verificationMethod?.[2].publicKeyBase58).toEqual(expectedBase58Key)
  //     expect(resolution?.didDocument?.keyAgreement?.[0]).toEqual(
  //       resolution?.didDocument?.verificationMethod?.[2].id,
  //     )
  //   })

  //   it('should send an authcrypt message from bob to alice', async () => {
  //     expect.assertions(3)

  //     const message = {
  //       type: 'test',
  //       to: alice.did,
  //       from: bob.did,
  //       id: 'test-authcrypt-success',
  //       body: { hello: 'world' },
  //     }
  //     const packedMessage = await agent.packDIDCommMessage({
  //       packing: 'authcrypt',
  //       message,
  //     })
  //     const result = await agent.sendDIDCommMessage({
  //       messageId: 'test-authcrypt-success',
  //       packedMessage,
  //       recipientDidUrl: alice.did,
  //     })

  //     expect(result).toBeTruthy()
  //     expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
  //       { data: 'test-authcrypt-success', type: 'DIDCommV2Message-sent' },
  //       expect.anything(),
  //     )
  //     // in our case, it is the same agent that is receiving the messages
  //     expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
  //       {
  //         data: {
  //           message: {
  //             body: { hello: 'world' },
  //             from: bob.did,
  //             id: 'test-authcrypt-success',
  //             to: alice.did,
  //             type: 'test',
  //           },
  //           metaData: { packing: 'authcrypt' },
  //         },
  //         type: 'DIDCommV2Message-received',
  //       },
  //       expect.anything(),
  //     )
  //   })
  })
}
