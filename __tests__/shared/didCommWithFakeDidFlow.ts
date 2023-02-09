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
  describe('DID comm using did:fake flow', () => {
    let agent: ConfiguredAgent
    let sender: IIdentifier
    let mediator: IIdentifier
    let mediator2: IIdentifier
    let receiver: IIdentifier
    let receiverWithMediation: IIdentifier
    let receiverWithMediation2: IIdentifier
    let receiverWithMediation3: IIdentifier
    let receiverWithMediation4: IIdentifier
    let receiverWithMediation5: IIdentifier

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
        services: [
          {
            id: 'msg1',
            type: 'DIDCommMessaging',
            serviceEndpoint: 'http://localhost:3002/messaging',
          },
        ],
        provider: 'did:fake',
        alias: 'sender',
      })

      mediator = await agent.didManagerImport({
        did: 'did:fake:mediator',
        keys: [
          {
            type: 'Ed25519',
            kid: 'didcomm-mediatorKey-1',
            publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
            privateKeyHex:
              'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
            kms: 'local',
          },
        ],
        services: [
          {
            id: 'msgM1',
            type: 'DIDCommMessaging',
            serviceEndpoint: 'http://localhost:3002/messaging',
          },
        ],
        provider: 'did:fake',
        alias: 'mediator',
      })

      mediator2 = await agent.didManagerImport({
        did: 'did:fake:mediator2',
        keys: [
          {
            type: 'Ed25519',
            kid: 'didcomm-mediator2Key-1',
            publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
            privateKeyHex:
              'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
            kms: 'local',
          },
        ],
        services: [
          {
            id: 'msgM2',
            type: 'DIDCommMessaging',
            serviceEndpoint: 'http://localhost:3002/messaging',
          },
        ],
        provider: 'did:fake',
        alias: 'mediator2',
      })

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
            serviceEndpoint: 'http://localhost:3002/messaging',
          },
        ],
        provider: 'did:fake',
        alias: 'receiver',
      })

      receiverWithMediation = await agent.didManagerImport({
        did: 'did:fake:receiverWithMediation',
        keys: [
          {
            type: 'Ed25519',
            kid: 'didcomm-receiverWithMediationKey-1',
            publicKeyHex: 'b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            privateKeyHex:
              '19ed9b6949cfd0f9a57e30f0927839a985fa699491886ebcdda6a954d869732ab162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            kms: 'local',
          },
        ],
        services: [
          {
            id: 'msg3',
            type: 'DIDCommMessaging',
            serviceEndpoint: [
              {
                uri: 'http://localhost:3002/messaging',
                routingKeys: [`${mediator.did}#${mediator.keys[0].kid}`],
              },
            ],
          },
        ],
        provider: 'did:fake',
        alias: 'receiverWithMediation',
      })

      receiverWithMediation2 = await agent.didManagerImport({
        did: 'did:fake:receiverWithMediation2',
        keys: [
          {
            type: 'Ed25519',
            kid: 'didcomm-receiverWithMediation2Key-1',
            publicKeyHex: 'b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            privateKeyHex:
              '19ed9b6949cfd0f9a57e30f0927839a985fa699491886ebcdda6a954d869732ab162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            kms: 'local',
          },
        ],
        services: [
          {
            id: 'msg4',
            type: 'DIDCommMessaging',
            serviceEndpoint: [
              {
                uri: 'http://localhost:3002/messaging',
                routingKeys: [
                  `${mediator2.did}#${mediator2.keys[0].kid}`,
                  `${mediator.did}#${mediator.keys[0].kid}`,
                ],
              },
            ],
          },
        ],
        provider: 'did:fake',
        alias: 'receiverWithMediation2',
      })

      receiverWithMediation3 = await agent.didManagerImport({
        did: 'did:fake:receiverWithMediation3',
        keys: [
          {
            type: 'Ed25519',
            kid: 'didcomm-receiverWithMediation3Key-1',
            publicKeyHex: 'b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            privateKeyHex:
              '19ed9b6949cfd0f9a57e30f0927839a985fa699491886ebcdda6a954d869732ab162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            kms: 'local',
          },
        ],
        services: [
          {
            id: 'msg5',
            type: 'DIDCommMessaging',
            serviceEndpoint: [{ uri: mediator.did }],
          },
        ],
        provider: 'did:fake',
        alias: 'receiverWithMediation3',
      })

      receiverWithMediation4 = await agent.didManagerImport({
        did: 'did:fake:receiverWithMediation4',
        keys: [
          {
            type: 'Ed25519',
            kid: 'didcomm-receiverWithMediation4Key-1',
            publicKeyHex: 'b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            privateKeyHex:
              '19ed9b6949cfd0f9a57e30f0927839a985fa699491886ebcdda6a954d869732ab162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            kms: 'local',
          },
        ],
        services: [
          {
            id: 'msg6',
            type: 'DIDCommMessaging',
            serviceEndpoint: [
              { uri: mediator2.did, routingKeys: [`${mediator.did}#${mediator.keys[0].kid}`] },
            ],
          },
        ],
        provider: 'did:fake',
        alias: 'receiverWithMediation4',
      })

      receiverWithMediation5 = await agent.didManagerImport({
        did: 'did:fake:receiverWithMediation5',
        keys: [
          {
            type: 'Ed25519',
            kid: 'didcomm-receiverWithMediation5Key-1',
            publicKeyHex: 'b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            privateKeyHex:
              '19ed9b6949cfd0f9a57e30f0927839a985fa699491886ebcdda6a954d869732ab162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            kms: 'local',
          },
        ],
        services: [
          {
            id: 'msg7',
            type: 'DIDCommMessaging',
            serviceEndpoint: {
              uri: 'http://localhost:3002/messaging',
              routingKeys: [`${mediator.did}#${mediator.keys[0].kid}`],
            },
          },
        ],
        provider: 'did:fake',
        alias: 'receiverWithMediation5',
      })

      return true
    })
    afterAll(testContext.tearDown)

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

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: '123', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
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

    it('should wrap and forward a message to single mediator via routingKeys', async () => {
      expect.assertions(4)

      const message = {
        type: 'test',
        to: receiverWithMediation.did,
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
        recipientDidUrl: receiverWithMediation.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            messageId: '123',
            next: receiverWithMediation.did,
            routingKey: 'did:fake:mediator#didcomm-mediatorKey-1',
          },
          type: 'DIDCommV2Message-forwarded',
        },
        expect.anything(),
      )
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: '123', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { next: receiverWithMediation.did },
              id: expect.anything(),
              to: mediator.did,
              type: 'https://didcomm.org/routing/2.0/forward',
              attachments: expect.anything(),
            },
            metaData: { packing: 'anoncrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })

    it('should wrap and forward a message to single mediator via routingKeys in single service endpoint', async () => {
      expect.assertions(4)

      const message = {
        type: 'test',
        to: receiverWithMediation5.did,
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
        recipientDidUrl: receiverWithMediation5.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            messageId: '123',
            next: receiverWithMediation5.did,
            routingKey: 'did:fake:mediator#didcomm-mediatorKey-1',
          },
          type: 'DIDCommV2Message-forwarded',
        },
        expect.anything(),
      )
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: '123', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { next: receiverWithMediation5.did },
              id: expect.anything(),
              to: mediator.did,
              type: 'https://didcomm.org/routing/2.0/forward',
              attachments: expect.anything(),
            },
            metaData: { packing: 'anoncrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })

    it('should wrap and forward a message to multiple mediators via routingKeys', async () => {
      expect.assertions(5)

      const message = {
        type: 'test',
        to: receiverWithMediation2.did,
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
        recipientDidUrl: receiverWithMediation2.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            messageId: '123',
            next: receiverWithMediation2.did,
            routingKey: 'did:fake:mediator#didcomm-mediatorKey-1',
          },
          type: 'DIDCommV2Message-forwarded',
        },
        expect.anything(),
      )
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            messageId: '123',
            next: mediator.did,
            routingKey: 'did:fake:mediator2#didcomm-mediator2Key-1',
          },
          type: 'DIDCommV2Message-forwarded',
        },
        expect.anything(),
      )
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: '123', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { next: mediator.did },
              id: expect.anything(),
              to: mediator2.did,
              type: 'https://didcomm.org/routing/2.0/forward',
              attachments: expect.anything(),
            },
            metaData: { packing: 'anoncrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })

    it('should wrap and forward a message to single mediator via DID as URI', async () => {
      expect.assertions(4)

      const message = {
        type: 'test',
        to: receiverWithMediation3.did,
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
        recipientDidUrl: receiverWithMediation3.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            messageId: '123',
            next: receiverWithMediation3.did,
            routingKey: 'did:fake:mediator',
          },
          type: 'DIDCommV2Message-forwarded',
        },
        expect.anything(),
      )
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: '123', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { next: receiverWithMediation3.did },
              id: expect.anything(),
              to: mediator.did,
              type: 'https://didcomm.org/routing/2.0/forward',
              attachments: expect.anything(),
            },
            metaData: { packing: 'anoncrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })

    it('should wrap and forward a message to multiple mediators via DID as URI and routingKeys', async () => {
      expect.assertions(5)

      const message = {
        type: 'test',
        to: receiverWithMediation4.did,
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
        recipientDidUrl: receiverWithMediation4.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            messageId: '123',
            next: receiverWithMediation4.did,
            routingKey: 'did:fake:mediator#didcomm-mediatorKey-1',
          },
          type: 'DIDCommV2Message-forwarded',
        },
        expect.anything(),
      )
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            messageId: '123',
            next: mediator.did,
            routingKey: 'did:fake:mediator2',
          },
          type: 'DIDCommV2Message-forwarded',
        },
        expect.anything(),
      )
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: '123', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { next: mediator.did },
              id: expect.anything(),
              to: mediator2.did,
              type: 'https://didcomm.org/routing/2.0/forward',
              attachments: expect.anything(),
            },
            metaData: { packing: 'anoncrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })
  })
}
