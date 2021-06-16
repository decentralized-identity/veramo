import { TAgent, IDIDManager, IKeyManager, IIdentifier, IResolver } from '../../packages/core/src'
import { IDIDComm, IDIDCommMessageMediaType } from '../../packages/did-comm/src'

type ConfiguredAgent = TAgent<IDIDManager & IKeyManager & IResolver & IDIDComm>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('DID comm', () => {
    let agent: ConfiguredAgent
    let sender: IIdentifier
    let receiver: IIdentifier

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()

      sender = await agent.didManagerImport({
        did: 'did:key:z6MkgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
        controllerKeyId: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
        keys: [
          {
            type: 'Ed25519',
            kid: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
            publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
            privateKeyHex:
              'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
            meta: { algorithms: ['Ed25519', 'EdDSA'] },
            kms: 'local',
          },
        ],
        services: [],
        provider: 'did:key',
        alias: 'sender',
      })

      receiver = await agent.didManagerImport({
        did: 'did:key:z6MkrPhffVLBZpxH7xvKNyD4sRVZeZsNTWJkLdHdgWbfgNu3',
        controllerKeyId: 'b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
        keys: [
          {
            type: 'Ed25519',
            kid: 'b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            publicKeyHex: 'b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            privateKeyHex:
              '19ed9b6949cfd0f9a57e30f0927839a985fa699491886ebcdda6a954d869732ab162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
            meta: { algorithms: ['Ed25519', 'EdDSA'] },
            kms: 'local',
          },
        ],
        services: [],
        provider: 'did:key',
        alias: 'receiver',
      })
      return true
    })
    afterAll(testContext.tearDown)

    it('should pack a plaintext message', async () => {
      expect.assertions(1)
      const message = {
        type: 'test',
        to: receiver.did,
        id: 'test',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'none',
        message,
      })
      const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
      expect(unpackedMessage).toEqual({
        message: {
          ...message,
          typ: 'application/didcomm-plain+json',
        },
        metaData: { packing: 'none' },
      })
    })

    it('should pack an anonymous encrypted message', async () => {
      expect.assertions(2)
      const message = {
        type: 'test',
        to: receiver.did,
        id: 'test',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'anoncrypt',
        message,
      })
      const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
      expect(unpackedMessage.message).toEqual(message)
      expect(unpackedMessage.metaData).toEqual({ packing: 'anoncrypt' })
    })

    it('should pack an authcrypted message', async () => {
      expect.assertions(2)
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
      const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
      expect(unpackedMessage.message).toEqual(message)
      expect(unpackedMessage.metaData).toEqual({ packing: 'authcrypt' })
    })
  })
}
