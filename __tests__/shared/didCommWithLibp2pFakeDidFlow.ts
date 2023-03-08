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
import { IAgentLibp2pClient } from '../../packages/libp2p-client/src'

type ConfiguredAgent = TAgent<IDIDManager & IKeyManager & IResolver & IDIDComm & IAgentLibp2pClient>

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
  onEvent: jest.fn(() => Promise.resolve()),
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

      const addrs = await agent.getListenerMultiAddrs()
      listenerMultiAddr = addrs[0].toString()
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
      await testContext.tearDown()
    })

    it('should send a message', async () => {
      expect.assertions(3)

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
      await new Promise(r => setTimeout(r, 2000));
      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: '123', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { hello: 'world' },
              from: 'did:fake:z6MkgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
              id: 'test',
              to: 'did:fake:z6MkrPhffVLBZpxH7xvKNyD4sRVZeZsNTWJkLdHdgWbfgNu3',
              type: 'test',
            },
            metaData: { packing: 'authcrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })
  })
}
