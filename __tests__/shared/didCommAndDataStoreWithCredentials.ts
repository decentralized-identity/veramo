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
import { IDIDComm, IPackedDIDCommMessage } from '../../packages/did-comm/src'
import { v4 } from "uuid"
import { VerifiableCredential } from '../../packages/core/src'

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
      return true
    })
    afterAll(testContext.tearDown)

    it('should send a message', async () => {
      expect.assertions(2)
      const numMessagesBefore = await agent.dataStoreORMGetMessagesCount({})
      const numVCsBefore = await agent.dataStoreORMGetVerifiableCredentialsCount({})

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
      await agent.sendDIDCommMessage({
        messageId: '123',
        packedMessage,
        recipientDidUrl: receiver.did,
      })

      const messages = await agent.dataStoreORMGetMessagesCount({})
      expect(messages).toEqual(numMessagesBefore + 1)
      const vcs = await agent.dataStoreORMGetVerifiableCredentialsCount({})
      // should have same number of VCs as before handling message since DIDCommMessage doesn't have VC in it
      expect(vcs).toEqual(numVCsBefore)
    })

    const vc = (creator: IIdentifier, proofFormat: string): Promise<VerifiableCredential> => {
      return agent.createVerifiableCredential({
        credential: {
          issuer: { id: creator.did },
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
          type: ['VerifiableCredential', 'Profile'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            name: 'No, 33',
          },
        },
        save: false,
        proofFormat: proofFormat,
      })
    }

    const packed = (vc: VerifiableCredential): Promise<IPackedDIDCommMessage> => {
      return agent.packDIDCommMessage({ packing: 'none', message: {
        id: v4(),
        type: 'w3c.vc',
        from: sender.did,
        to: receiver.did,
        body: vc
      }})
    }

    it('should save LDS credential found inside DIDCommMessage', async () => {
      expect.assertions(2)
      const creator = await agent.didManagerGetOrCreate({ alias: 'messageCreator1', provider: 'did:ethr'})

      const numMessagesBefore = await agent.dataStoreORMGetMessagesCount({})
      const numVCsBefore = await agent.dataStoreORMGetVerifiableCredentialsCount({})

      const verifiableCredential = await vc(creator, 'lds')
      const packedMessage = await packed(verifiableCredential)

      await agent.sendDIDCommMessage({
        messageId: 'test-jwt-success',
        packedMessage,
        recipientDidUrl: sender.did,
      })
      const messages = await agent.dataStoreORMGetMessagesCount({})
      expect(messages).toEqual(numMessagesBefore + 1)
      const vcs = await agent.dataStoreORMGetVerifiableCredentialsCount({})
      expect(vcs).toEqual(numVCsBefore + 1)
    })

    it('should save JWT credential found inside DIDCommMessage', async () => {
      expect.assertions(2)
      const creator = await agent.didManagerGetOrCreate({ alias: 'messageCreator1', provider: 'did:ethr'})

      const numMessagesBefore = await agent.dataStoreORMGetMessagesCount({})
      const numVCsBefore = await agent.dataStoreORMGetVerifiableCredentialsCount({})

      const verifiableCredential = await vc(creator, 'jwt')
      const packedMessage = await packed(verifiableCredential)

      await agent.sendDIDCommMessage({
        messageId: 'test-jwt-success',
        packedMessage,
        recipientDidUrl: sender.did,
      })
      const messages = await agent.dataStoreORMGetMessagesCount({})
      expect(messages).toEqual(numMessagesBefore + 1)
      const vcs = await agent.dataStoreORMGetVerifiableCredentialsCount({})
      expect(vcs).toEqual(numVCsBefore + 1)
    })


    it('should save JWT credential found inside DIDCommMessage', async () => {
      expect.assertions(2)
      const creator = await agent.didManagerGetOrCreate({ alias: 'messageCreator1', provider: 'did:ethr'})

      const numMessagesBefore = await agent.dataStoreORMGetMessagesCount({})
      const numVCsBefore = await agent.dataStoreORMGetVerifiableCredentialsCount({})

      const verifiableCredential = await vc(creator, 'EthereumEip712Signature2021')
      const packedMessage = await packed(verifiableCredential)

      await agent.sendDIDCommMessage({
        messageId: 'test-jwt-success',
        packedMessage,
        recipientDidUrl: sender.did,
      })
      const messages = await agent.dataStoreORMGetMessagesCount({})
      expect(messages).toEqual(numMessagesBefore + 1)
      const vcs = await agent.dataStoreORMGetVerifiableCredentialsCount({})
      expect(vcs).toEqual(numVCsBefore + 1)
    })
  })
}
