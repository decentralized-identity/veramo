import {
  FindCredentialsArgs,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  IMessageHandler,
  TAgent,
} from '../../packages/core/src'
import { ICredentialIssuer } from '../../packages/credential-w3c/src'
import { ISelectiveDisclosure } from '../../packages/selective-disclosure/src'

type ConfiguredAgent = TAgent<
  IDIDManager & ICredentialIssuer & IDataStoreORM & IDataStore & IMessageHandler & ISelectiveDisclosure
>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('Save credentials and query by claim type', () => {
    let agent: ConfiguredAgent
    let identifier: IIdentifier

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    it('should create identifier', async () => {
      identifier = await agent.didManagerCreate({ kms: 'local' })
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
      const credentials = await agent.dataStoreORMGetVerifiableCredentials({
        where: [{ column: 'issuer', value: [identifier.did] }],
      })
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

    it('should be able to delete credential', async () => {
      const findOptions: FindCredentialsArgs = { where: [{ column: 'issuer', value: [identifier.did] }] }
      const credentials = await agent.dataStoreORMGetVerifiableCredentials(findOptions)
      expect(credentials).toHaveLength(3)

      const result = await agent.dataStoreDeleteVerifiableCredential({ hash: credentials[0].hash })
      expect(result).toEqual(true)

      const credentials2 = await agent.dataStoreORMGetVerifiableCredentials(findOptions)
      expect(credentials2).toHaveLength(2)
    })
  })
}
