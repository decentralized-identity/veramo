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

    it('should create verifiable credential', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identity.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: 'did:web:uport.me',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      expect(verifiableCredential).toHaveProperty('proof.jwt')
    })

    it('should save an SDR message', async () => {
      const message = await agent.handleMessage({
        raw: JWT,
        save: true,
      })

      expect(message.raw).toEqual(JWT)
    })

    it('should be able to find the request message', async () => {
      const messages = await agent.dataStoreORMGetMessages()

      expect(messages[0].raw).toEqual(JWT)
      expect(messages[0].type).toEqual('sdr')
    })

    it('should be able to sign a credential after saving a message', async () => {
      const identities = await agent.identityManagerGetIdentities()
      const identity = identities[0]

      expect(identities[0].did).toBeDefined()

      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identity.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: 'did:web:uport.me',
            name: 'Carrot',
          },
        },
        proofFormat: 'jwt',
        save: true,
      })

      expect(verifiableCredential.proof.jwt).toBeDefined()
    })

    it('should create verifiable presentation', async () => {
      const credentials = await agent.getVerifiableCredentialsForSdr({
        sdr: {
          claims: [
            {
              claimType: 'name',
            },
          ],
        },
      })

      const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          verifier: [],
          holder: identity.did,
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          issuanceDate: new Date().toISOString(),
          verifiableCredential: credentials[0].credentials,
        },
        proofFormat: 'jwt',
        save: true,
      })

      expect(verifiablePresentation).toHaveProperty('proof.jwt')
    })
  })
}
