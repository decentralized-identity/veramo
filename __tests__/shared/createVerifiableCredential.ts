import { TAgent, IIdentityManager, IIdentity } from 'daf-core'
import { IW3c } from 'daf-w3c'

type ConfiguredAgent = TAgent<IIdentityManager & IW3c>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<void>
  tearDown: () => Promise<void>
}) => {
  describe('creating Verifiable Credentials', () => {
    let agent: ConfiguredAgent
    let identity: IIdentity

    beforeAll(() => {
      testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    it('should create identity', async () => {
      expect.assertions(1)
      identity = await agent.identityManagerCreateIdentity({ kms: 'local' })
      expect(identity).toHaveProperty('did')
    })

    it('should create verifiable credential', async () => {
      expect.assertions(1)
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
  })
}
