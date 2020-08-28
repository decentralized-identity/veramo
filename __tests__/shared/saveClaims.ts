import { TAgent, IIdentityManager, IIdentity, IDataStore, IMessageHandler } from 'daf-core'
import { ICredentialIssuer } from 'daf-w3c'
import { ISdr } from 'daf-selective-disclosure'
import { IDataStoreORM } from 'daf-typeorm'

type ConfiguredAgent = TAgent<
  IIdentityManager & ICredentialIssuer & IDataStoreORM & IDataStore & IMessageHandler & ISdr
>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('Save credentials and query by claim type', () => {
    let agent: ConfiguredAgent
    let identity: IIdentity

    beforeAll(() => {
      testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    it('should create identity', async () => {
      identity = await agent.identityManagerCreateIdentity({ kms: 'local' })
      expect(identity).toHaveProperty('did')
    })

    it('should create verifiable credentials', async () => {
      // Looping these in a map/forEach throws SQL UNIQUE CONSTRAINT errors

      await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identity.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: identity.did,
            topic: 'math',
          },
        },
        proofFormat: 'jwt',
        save: true,
      })

      await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identity.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: identity.did,
            topic: 'science',
          },
        },
        proofFormat: 'jwt',
        save: true,
      })

      await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identity.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: identity.did,
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
