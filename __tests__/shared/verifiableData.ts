import { TAgent, IIdentityManager, IIdentity, IDataStore } from '../../packages/daf-core/src'
import { IDataStoreORM } from '../../packages/daf-typeorm/src'
import { ICredentialIssuer } from '../../packages/daf-w3c/src'

type ConfiguredAgent = TAgent<IIdentityManager & ICredentialIssuer & IDataStore & IDataStoreORM>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
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
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      expect(verifiableCredential).toHaveProperty('proof.jwt')

      const hash = await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
      expect(typeof hash).toEqual('string')

      const verifiableCredential2 = await agent.dataStoreGetVerifiableCredential({ hash })
      expect(verifiableCredential).toEqual(verifiableCredential2)
    })

    it('should create verifiable presentation', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identity.did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: identity.did,
          verifier: [],
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          issuanceDate: new Date().toISOString(),
          verifiableCredential: [verifiableCredential],
        },
        proofFormat: 'jwt',
      })

      expect(verifiablePresentation).toHaveProperty('proof.jwt')

      const hash = await agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation })
      expect(typeof hash).toEqual('string')

      const verifiablePresentation2 = await agent.dataStoreGetVerifiablePresentation({ hash })
      expect(verifiablePresentation).toEqual(verifiablePresentation2)
    })

    it('should query for credentials', async () => {
      const allCredentials = await agent.dataStoreORMGetVerifiableCredentials({})
      expect(allCredentials[0]).toHaveProperty('hash')
      expect(allCredentials[0]).toHaveProperty('verifiableCredential')
      const credentialCount = await agent.dataStoreORMGetVerifiableCredentialsCount()
      expect(allCredentials.length).toEqual(credentialCount)
    })

    it('should query for presentations', async () => {
      const allPresentations = await agent.dataStoreORMGetVerifiablePresentations({})
      expect(allPresentations[0]).toHaveProperty('hash')
      expect(allPresentations[0]).toHaveProperty('verifiablePresentation')
      const presentationCount = await agent.dataStoreORMGetVerifiablePresentationsCount()
      expect(allPresentations.length).toEqual(presentationCount)
    })

    it('should throw error for non existing verifiable credential', async () => {
      await expect(
        agent.dataStoreGetVerifiableCredential({
          hash: 'foobar',
        }),
      ).rejects.toThrow('Verifiable credential not found')
    })

    it('should throw error for non existing verifiable presentation', async () => {
      await expect(
        agent.dataStoreGetVerifiablePresentation({
          hash: 'foobar',
        }),
      ).rejects.toThrow('Verifiable presentation not found')
    })

  })
}
