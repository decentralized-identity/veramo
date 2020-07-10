import { TAgent, IIdentityManager, IIdentity, IDataStore, IHandleMessage } from 'daf-core'
import { IW3c } from 'daf-w3c'
import { ISdr } from 'daf-selective-disclosure'
import { IDataStoreORM } from 'daf-typeorm'

type ConfiguredAgent = TAgent<IIdentityManager & IW3c & IDataStoreORM & IDataStore & IHandleMessage & ISdr>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('handling sdr message', () => {
    let agent: ConfiguredAgent
    let identity: IIdentity
    const JWT =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1OTM0NTE3MDAsInR5cGUiOiJzZHIiLCJzdWJqZWN0IjoiZGlkOmV0aHI6cmlua2VieToweDM2MjQ2M2NiZTUyMjhjZTUwMGJlOGUwMzVjZGIyMWI3NzQ1ZjZkYjAiLCJ0YWciOiJzZHItb25lIiwiY2xhaW1zIjpbeyJyZWFzb24iOiJXZSBuZWVkIGl0IiwiY2xhaW1UeXBlIjoibmFtZSIsImVzc2VudGlhbCI6dHJ1ZX1dLCJpc3MiOiJkaWQ6ZXRocjpyaW5rZWJ5OjB4MTM4NGMxZmNlM2Y3MWQ3NjU5NzcwOGY1NGM0ZDEyOGMyNDFkMDBkMiJ9.L-j-gREAuN7DAxDCe1vXJWtMIdmn88HTuTFp2PasTTo_aqvIdGcFtv-rSfvRHkauNq5C3PkXkQWY01VGqpJ-QwE'

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
      const topics = ['math', 'science', 'art']

      // Looping these in a map thorws SQL errors

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
  })
}
