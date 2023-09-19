// noinspection ES6PreferShortImport

import {
  FindCredentialsArgs,
  ICredentialIssuer,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  IMessageHandler,
  TAgent,
} from '../../packages/core-types/src'
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
          issuanceDate: '2023-09-15T10:22:07.506Z',
          id: 'a',
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
          issuanceDate: '2023-09-16T10:22:07.506Z',
          id: 'b',
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
          issuanceDate: '2023-09-17T10:22:07.506Z',
          id: 'c',
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

    it('should be able to limit credentials when query by claim type and value', async () => {
      const credentials = await agent.dataStoreORMGetVerifiableCredentialsByClaims({
        where: [
          { column: 'type', value: ['topic'] },
          { column: 'value', value: ['math', 'art'] },
        ],
        order: [{ column: 'issuanceDate', direction: 'DESC' }],
        take: 1
      })
      expect(credentials).toHaveLength(1)
    })
    it('should be able to limit credentials when searching and sorting', async () => {
      const credentials = await agent.dataStoreORMGetVerifiableCredentials({
        where: [
          { column: 'type', value: ['VerifiableCredential'] },
        ],
        order: [{ column: 'issuanceDate', direction: 'DESC' }],
        take: 1,
        skip: 1
      })
      expect(credentials).toHaveLength(1)
    })

    it('should be able to limit credentials when sorting', async () => {
      const credentialsAllDesc = await agent.dataStoreORMGetVerifiableCredentials({
        order: [{ column: 'issuanceDate', direction: 'DESC' }]
      })

      const credentialsAllAsc = await agent.dataStoreORMGetVerifiableCredentials({
        order: [{ column: 'issuanceDate', direction: 'ASC' }]
      })

      const credentialsIdAllDesc = await agent.dataStoreORMGetVerifiableCredentials({
        order: [{ column: 'id', direction: 'DESC' }]
      })

      const credentialsIdAllAsc = await agent.dataStoreORMGetVerifiableCredentials({
        order: [{ column: 'id', direction: 'ASC' }]
      })


      const credentials1 = await agent.dataStoreORMGetVerifiableCredentials({
        order: [{ column: 'issuanceDate', direction: 'DESC' }],
        take: 1,
        skip: 0
      })
      const credentials2 = await agent.dataStoreORMGetVerifiableCredentials({
        order: [{ column: 'issuanceDate', direction: 'DESC' }],
        take: 1,
        skip: 1
      })
      const credentials3 = await agent.dataStoreORMGetVerifiableCredentials({
        order: [{ column: 'issuanceDate', direction: 'ASC' }],
        take: 2,
        skip: 0
      })
      const credentials4 = await agent.dataStoreORMGetVerifiableCredentials({
        order: [{ column: 'issuanceDate', direction: 'ASC' }],
        take: 2,
        skip: 1
      })

      expect(credentialsAllDesc).toHaveLength(3)
      expect(credentials1).toHaveLength(1)
      expect(credentials2).toHaveLength(1)

      expect(credentialsIdAllAsc[0].verifiableCredential.id).toEqual('a')
      expect(credentialsIdAllAsc[1].verifiableCredential.id).toEqual('b')
      expect(credentialsIdAllAsc[2].verifiableCredential.id).toEqual('c')

      expect(credentialsIdAllDesc[0].verifiableCredential.id).toEqual('c')
      expect(credentialsIdAllDesc[1].verifiableCredential.id).toEqual('b')
      expect(credentialsIdAllDesc[2].verifiableCredential.id).toEqual('a')

      expect(credentialsAllDesc[0].verifiableCredential.issuanceDate).toEqual(credentials1[0].verifiableCredential.issuanceDate)
      expect(credentialsAllDesc[1].verifiableCredential.issuanceDate).toEqual(credentials2[0].verifiableCredential.issuanceDate)
      
      expect(credentialsAllDesc[0].verifiableCredential.issuanceDate).toEqual(credentialsAllAsc[2].verifiableCredential.issuanceDate)
      expect(credentialsAllDesc[1].verifiableCredential.issuanceDate).toEqual(credentialsAllAsc[1].verifiableCredential.issuanceDate)
      expect(credentialsAllDesc[2].verifiableCredential.issuanceDate).toEqual(credentialsAllAsc[0].verifiableCredential.issuanceDate)

      expect(new Date(credentials1[0].verifiableCredential.issuanceDate).getTime())
      .toBeGreaterThan(new Date(credentials2[0].verifiableCredential.issuanceDate).getTime())

      expect(new Date(credentials4[0].verifiableCredential.issuanceDate).getTime())
      .toBeGreaterThan(new Date(credentials3[0].verifiableCredential.issuanceDate).getTime())
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
