// noinspection ES6PreferShortImport

import {
  IAgentOptions,
  IDIDManager,
  IEventListener,
  IIdentifier,
  IKeyManager,
  IResolver,
  TAgent,
} from '../../packages/core/src'
import { IDIDComm } from '../../packages/did-comm/src'
import { jest } from '@jest/globals'

import { createLibp2pNode } from '../../packages/libp2p-client/src'
import { Libp2p } from 'libp2p'

import { pipe } from 'it-pipe'
// import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as lp from 'it-length-prefixed'
import map from 'it-map'
import { Uint8ArrayList } from 'uint8arraylist'

type ConfiguredAgent = TAgent<IDIDManager & IKeyManager & IResolver & IDIDComm>

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
  onEvent: jest.fn(),
}

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('DID comm using did:fake flow', () => {
    let agent: ConfiguredAgent
    let sender: IIdentifier
    let receiver: IIdentifier

    
    let listenerMultiAddr: string

    const streamChunkReceivedCb = (msg: any) => {
      console.log("called back msg: ", msg)
    }
    let didCommEndpointLibp2pNode: Libp2p

    beforeAll(async () => {
      await testContext.setup({ plugins: [DIDCommEventSniffer] })
      agent = testContext.getAgent()

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
        provider: 'did:fake',
        alias: 'sender',
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
          (source) => map(source, (buf: Uint8ArrayList) => uint8ArrayToString(buf.subarray())),
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

      console.log("prestart")
      await didCommEndpointLibp2pNode.start()
      console.log("post start")
      listenerMultiAddr = didCommEndpointLibp2pNode.getMultiaddrs()[0].toString()
      console.log("listenerMultiAddr: ", listenerMultiAddr)


      receiver = await agent.didManagerImport({
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
            serviceEndpoint: {
              transportType: 'libp2p',
              multiAddr: listenerMultiAddr
            },
          },
        ],
        provider: 'did:fake',
        alias: 'receiver',
      })

      return true
    })
    afterAll(async () => {
      await didCommEndpointLibp2pNode.stop()
      await testContext.tearDown()
    })

    it('should send a message', async () => {
      expect.assertions(1)

      const message = {
        type: 'test',
        to: receiver.did,
        from: sender.did,
        id: 'test',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'authcrypt',
        message,
      })
      const result = await agent.sendDIDCommMessage({
        messageId: '123',
        packedMessage,
        recipientDidUrl: receiver.did,
      })

      expect(result).toBeTruthy()
      // expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      //   { data: '123', type: 'DIDCommV2Message-sent' },
      //   expect.anything(),
      // )
      // // in our case, it is the same agent that is receiving the messages
      // expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
      //   {
      //     data: {
      //       message: {
      //         body: { hello: 'world' },
      //         from: 'did:fake:z6MkgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
      //         id: 'test',
      //         to: 'did:fake:z6MkrPhffVLBZpxH7xvKNyD4sRVZeZsNTWJkLdHdgWbfgNu3',
      //         type: 'test',
      //       },
      //       metaData: { packing: 'authcrypt' },
      //     },
      //     type: 'DIDCommV2Message-received',
      //   },
      //   expect.anything(),
      // )
    })
  })
}
