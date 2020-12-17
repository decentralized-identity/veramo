import { TAgent, IIdManager, IIdentifier, IDataStore, IMessageHandler } from '../../packages/daf-core/src'
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
  describe('Save credentials and query by claim type', () => {
    let agent: ConfiguredAgent
    let identifier: IIdentifier

    beforeAll(() => {
      testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    it('should create identifier', async () => {
      identifier = await agent.idManagerCreateIdentifier({ kms: 'local' })
      expect(identifier).toHaveProperty('did')
    })

    it('should create verifiable credentials', async () => {
      // Looping these in a map/forEach throws SQL UNIQUE CONSTRAINT errors

      await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: identifier.did,
            topic: 'math',
          },
        },
        proofFormat: 'jwt',
        save: true,
      })

      await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: identifier.did,
            topic: 'science',
          },
        },
        proofFormat: 'jwt',
        save: true,
      })

      await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: identifier.did,
            topic: 'art',
          },
        },
        proofFormat: 'jwt',
        save: true,
      })
    })

    it('should be able to find all the credentials', async () => {
      const credentials = await agent.dataStoreORMGetVerifiableCredentials()
      expect(credentials).toHaveLength(3)
    })

    it('should be able to find all the credentials when query by claim type', async () => {
      const credentials = await agent.dataStoreORMGetVerifiableCredentialsByClaims({
        where: [{ column: 'type', value: ['topic'] }],
      })
      expect(credentials).toHaveLength(3)
      const count = await agent.dataStoreORMGetVerifiableCredentialsByClaimsCount({
        where: [{ column: 'type', value: ['topic'] }],
      })
      expect(count).toEqual(credentials.length)
    })

    it('should be able to find all the credentials when query by claim type and value', async () => {
      const credentials = await agent.dataStoreORMGetVerifiableCredentialsByClaims({
        where: [
          { column: 'type', value: ['topic'] },
          { column: 'value', value: ['math', 'art'] },
        ],
      })
      expect(credentials).toHaveLength(2)
    })
  })
}
