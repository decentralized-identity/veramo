import { TAgent, IDIDManager, IIdentifier, IDataStore } from '../../packages/core/src'
import { IDataStoreORM } from '../../packages/data-store/src'
import { ICredentialIssuer } from '../../packages/credential-w3c/src'
import { decodeJWT } from 'did-jwt'

type ConfiguredAgent = TAgent<IDIDManager & ICredentialIssuer & IDataStore & IDataStoreORM>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('creating Verifiable Credentials', () => {
    let agent: ConfiguredAgent
    let identifier: IIdentifier

    beforeAll(() => {
      testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    it('should create identifier', async () => {
      identifier = await agent.didManagerCreate({ kms: 'local' })
      expect(identifier).toHaveProperty('did')
    })

    it('should create verifiable credential', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
          type: ['VerifiableCredential', 'Custom'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      expect(verifiableCredential).toHaveProperty('proof.jwt')
      expect(verifiableCredential['@context']).toEqual([
        'https://www.w3.org/2018/credentials/v1',
        'https://example.com/1/2/3',
      ])
      expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Custom'])

      const hash = await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
      expect(typeof hash).toEqual('string')

      const verifiableCredential2 = await agent.dataStoreGetVerifiableCredential({ hash })
      expect(verifiableCredential).toEqual(verifiableCredential2)
    })

    it('should create verifiable credential (simple)', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      expect(verifiableCredential).toHaveProperty('proof.jwt')
      expect(verifiableCredential).toHaveProperty('issuanceDate')
      expect(verifiableCredential['@context']).toEqual(['https://www.w3.org/2018/credentials/v1'])
      expect(verifiableCredential['type']).toEqual(['VerifiableCredential'])

      const token = verifiableCredential.proof.jwt
      const { payload } = decodeJWT(token)
      expect(payload.vc.credentialSubject.id).not.toBeDefined()
    })

    it('should create verifiable credential keeping original fields', async () => {
      expect.assertions(5)
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
        removeOriginalFields: false,
      })

      expect(verifiableCredential).toHaveProperty('proof.jwt')
      expect(verifiableCredential).toHaveProperty('issuanceDate')
      expect(verifiableCredential['@context']).toEqual(['https://www.w3.org/2018/credentials/v1'])
      expect(verifiableCredential['type']).toEqual(['VerifiableCredential'])

      const token = verifiableCredential.proof.jwt
      const { payload } = decodeJWT(token)
      expect(payload.vc.credentialSubject.id).toEqual('did:web:example.com')
    })

    it('should create verifiable presentation', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
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
          holder: identifier.did,
          verifier: [],
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
          type: ['VerifiablePresentation', 'Custom'],
          issuanceDate: new Date().toISOString(),
          verifiableCredential: [verifiableCredential],
        },
        proofFormat: 'jwt',
      })

      expect(verifiablePresentation).toHaveProperty('proof.jwt')
      expect(verifiablePresentation['@context']).toEqual([
        'https://www.w3.org/2018/credentials/v1',
        'https://example.com/1/2/3',
      ])
      expect(verifiablePresentation['type']).toEqual(['VerifiablePresentation', 'Custom'])

      const hash = await agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation })
      expect(typeof hash).toEqual('string')

      const verifiablePresentation2 = await agent.dataStoreGetVerifiablePresentation({ hash })
      expect(verifiablePresentation).toEqual(verifiablePresentation2)
    })

    it('should create verifiable presentation (simple)', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: identifier.did,
          verifier: [],
          verifiableCredential: [verifiableCredential],
        },
        proofFormat: 'jwt',
      })

      expect(verifiablePresentation).toHaveProperty('proof.jwt')
      expect(verifiablePresentation['@context']).toEqual(['https://www.w3.org/2018/credentials/v1'])
      expect(verifiablePresentation['type']).toEqual(['VerifiablePresentation'])

      const hash = await agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation })
      expect(typeof hash).toEqual('string')

      const verifiablePresentation2 = await agent.dataStoreGetVerifiablePresentation({ hash })
      expect(verifiablePresentation).toEqual(verifiablePresentation2)

      const token = verifiablePresentation.proof.jwt
      const { payload } = decodeJWT(token)
      expect(payload.holder).not.toBeDefined()
    })

    it('should create verifiable presentation (simple) keeping original fields', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
        },
        proofFormat: 'jwt',
      })

      const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: identifier.did,
          verifier: [],
          verifiableCredential: [verifiableCredential],
        },
        proofFormat: 'jwt',
        removeOriginalFields: false,
      })

      expect(verifiablePresentation).toHaveProperty('proof.jwt')
      expect(verifiablePresentation['@context']).toEqual(['https://www.w3.org/2018/credentials/v1'])
      expect(verifiablePresentation['type']).toEqual(['VerifiablePresentation'])

      const token = verifiablePresentation.proof.jwt
      const { payload } = decodeJWT(token)
      expect(payload.holder).toEqual(identifier.did)
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
