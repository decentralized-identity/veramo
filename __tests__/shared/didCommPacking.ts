// noinspection ES6PreferShortImport

import { IDIDManager, IIdentifier, IKeyManager, IResolver, TAgent } from '../../packages/core/src'
import { IDIDComm } from '../../packages/did-comm/src'

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
        services: [],
        provider: 'did:fake',
        alias: 'sender',
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
        services: [],
        provider: 'did:fake',
        alias: 'receiver',
      })
      return true
    })
    afterAll(testContext.tearDown)

    it('should pack and unpack a plaintext message', async () => {
      expect.assertions(2)
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
      expect(JSON.parse(packedMessage.message).typ).toEqual('application/didcomm-plain+json')
      const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
      expect(unpackedMessage).toEqual({
        message: {
          ...message,
          typ: 'application/didcomm-plain+json',
        },
        metaData: { packing: 'none' },
      })
    })

    it('should pack and unpack a JWS message', async () => {
      const message = {
        type: 'test',
        to: receiver.did,
        from: sender.did,
        id: 'test',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'jws',
        message,
      })
      const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
      expect(unpackedMessage).toEqual({
        message,
        metaData: { packing: 'jws' },
      })
    })

    it('should pack and unpack an anoncrypted message', async () => {
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

    it('should pack and unpack an authcrypted message', async () => {
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

    it('should pack and unpack message with multiple bcc recipients', async () => {
      expect.assertions(2)

      const originator = await agent.didManagerCreate({
        provider: 'did:key',
      })
      const beneficiary1 = await agent.didManagerCreate({
        provider: 'did:key',
      })
      const beneficiary2 = await agent.didManagerCreate({
        provider: 'did:key',
      })

      const message = {
        type: 'test',
        from: originator.did,
        to: originator.did,
        id: 'test',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'authcrypt',
        message,
        options: { bcc: [beneficiary1.did, beneficiary2.did] },
      })

      // delete originator's key from local KMS
      await agent.didManagerDelete({ did: originator.did })

      // bcc'd beneficiaries should be able to decrypt
      const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage)
      expect(unpackedMessage.message).toEqual(message)
      expect(unpackedMessage.metaData).toEqual({ packing: 'authcrypt' })
    })

    it('should pack and fail unpacking message with multiple bcc recipients', async () => {
      const originator = await agent.didManagerCreate({
        provider: 'did:key',
      })
      const beneficiary1 = await agent.didManagerCreate({
        provider: 'did:key',
      })
      const beneficiary2 = await agent.didManagerCreate({
        provider: 'did:key',
      })

      const message = {
        type: 'test',
        from: originator.did,
        to: originator.did,
        id: 'test',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'authcrypt',
        message,
        options: { bcc: [beneficiary1.did, beneficiary2.did] },
      })

      // delete all keys
      await agent.didManagerDelete({ did: originator.did })
      await agent.didManagerDelete({ did: beneficiary1.did })
      await agent.didManagerDelete({ did: beneficiary2.did })

      await expect(agent.unpackDIDCommMessage(packedMessage)).rejects.toThrowError(
        'unable to decrypt DIDComm message with any of the locally managed keys',
      )
    })
  })
}
