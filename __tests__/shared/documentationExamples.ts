import { TAgent, IIdManager, IDataStore, IMessageHandler } from '../../packages/daf-core/src'
import { ICredentialIssuer } from '../../packages/daf-w3c/src'
import { ISelectiveDisclosure } from '../../packages/daf-selective-disclosure/src'
import { IDataStoreORM } from '../../packages/daf-typeorm/src'

type ConfiguredAgent = TAgent<
  IIdManager & ICredentialIssuer & IDataStoreORM & IDataStore & IMessageHandler & ISelectiveDisclosure
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

    it('daf-core-IResolver-resolveDid example', async () => {
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

    it('daf-core-IIdManager-idManagerCreateIdentifier example', async () => {
      const identifier = await agent.idManagerCreateIdentifier({
        alias: 'alice',
        provider: 'did:ethr:rinkeby',
        kms: 'local',
      })
    })

    it('daf-core-IIdManager-idManagerGetIdentifiers example', async () => {
      const aliceIdentifiers = await agent.idManagerGetIdentifiers({
        alias: 'alice',
      })

      const rinkebyIdentifiers = await agent.idManagerGetIdentifiers({
        provider: 'did:ethr:rinkeby',
      })
    })

    it('daf-core-IIdManager-idManagerGetIdentifierByAlias example', async () => {
      const identifier = await agent.idManagerGetIdentifierByAlias({
        alias: 'alice',
        provider: 'did:ethr:rinkeby',
      })
    })

    it('daf-core-IIdManager-idManagerSetAlias example', async () => {
      const identifier = await agent.idManagerCreateIdentifier()
      const result = await agent.idManagerSetAlias({
        did: identifier.did,
        alias: 'carol',
      })
    })

    //DO NOT EDIT MANUALLY END
  })
}
