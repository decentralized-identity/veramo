// noinspection ES6PreferShortImport

import {
  IAgentOptions,
  IDIDManager,
  IEventListener,
  IIdentifier,
  IKeyManager,
  IResolver,
  TAgent,
} from '../../packages/core-types/src'
import { IDIDComm } from '../../packages/did-comm/src'
import { jest } from '@jest/globals'

type ConfiguredAgent = TAgent<IDIDManager & IKeyManager & IResolver & IDIDComm>

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received', 'DIDCommV2Message-forwarded'],
  onEvent: jest.fn(() => Promise.resolve()),
}

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('DID comm using did:peer flow', () => {
    let agent: ConfiguredAgent
    let sender: IIdentifier
    let receiver: IIdentifier

    beforeAll(async () => {
      await testContext.setup({ plugins: [DIDCommEventSniffer] })
      agent = testContext.getAgent()

      sender = await agent.didManagerCreate({
        "alias": "sender",
        "provider": "did:peer",
        "kms": "local",
        "options": {"num_algo":2 , "service" : {"id":"12344","type":"didcommv2","serviceEndpoint":"alexexxxxx","description":"an endpoint"}
      }
      })

      receiver = await agent.didManagerCreate({
        "alias": "receiver",
        "provider": "did:peer",
        "kms": "local",
        "options": {"num_algo":2 , "service" : {"id":"12345","type":"didcommv2","serviceEndpoint":"alexexxxxx","description":"an endpoint"}
      }
      })

      return true
    })
    afterAll(testContext.tearDown)

    it('should pack and unpack a message', async () => {
      expect.assertions(2)

      const message = {
        type: 'test',
        to: [receiver.did],
        from: sender.did,
        id: 'test',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'authcrypt',
        message,
      })
      expect(packedMessage).toBeDefined()

      const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
      expect(unpackedMessage.message.id).toEqual('test')
    })
  })
}
