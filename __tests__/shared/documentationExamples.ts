import { TAgent, IDIDManager, IDataStore, IMessageHandler } from '../../packages/core'
import { ICredentialIssuer } from '../../packages/daf-w3c'
import { ISelectiveDisclosure } from '../../packages/selective-disclosure'
import { IDataStoreORM } from '../../packages/data-store'

type ConfiguredAgent = TAgent<
  IDIDManager & ICredentialIssuer & IDataStoreORM & IDataStore & IMessageHandler & ISelectiveDisclosure
>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('Documentation examples', () => {
    let agent: ConfiguredAgent

    beforeAll(() => {
      testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    //DO NOT EDIT MANUALLY START

    it('core-IResolver-resolveDid example', async () => {
      const doc = await agent.resolveDid({
        didUrl: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
      })

      expect(doc).toEqual({
        '@context': 'https://w3id.org/did/v1',
        id: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
        publicKey: [
          {
            id: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller',
            type: 'Secp256k1VerificationKey2018',
            controller: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
            ethereumAddress: '0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
          },
        ],
        authentication: [
          {
            type: 'Secp256k1SignatureAuthentication2018',
            publicKey: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller',
          },
        ],
      })
    })

    it('core-IDIDManager-didManagerCreate example', async () => {
      const identifier = await agent.didManagerCreate({
        alias: 'alice',
        provider: 'did:ethr:rinkeby',
        kms: 'local',
      })
    })

    it('core-IDIDManager-didManagerFind example', async () => {
      const aliceIdentifiers = await agent.didManagerFind({
        alias: 'alice',
      })

      const rinkebyIdentifiers = await agent.didManagerFind({
        provider: 'did:ethr:rinkeby',
      })
    })

    it('core-IDIDManager-didManagerGetByAlias example', async () => {
      const identifier = await agent.didManagerGetByAlias({
        alias: 'alice',
        provider: 'did:ethr:rinkeby',
      })
    })

    it('core-IDIDManager-didManagerSetAlias example', async () => {
      const identifier = await agent.didManagerCreate()
      const result = await agent.didManagerSetAlias({
        did: identifier.did,
        alias: 'carol',
      })
    })

    //DO NOT EDIT MANUALLY END
  })
}
