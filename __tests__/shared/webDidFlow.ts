// noinspection ES6PreferShortImport

import { ICredentialIssuer, IDIDManager, IIdentifier, IKey, TAgent } from '../../packages/core/src'

type ConfiguredAgent = TAgent<IDIDManager & ICredentialIssuer>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('web did flow', () => {
    let agent: ConfiguredAgent
    let serviceIdentifier: IIdentifier
    let serviceIdentifierKey: IKey
    let alice: IIdentifier
    let bob: IIdentifier

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    it('should create service identifier', async () => {
      serviceIdentifier = await agent.didManagerGetOrCreate({
        provider: 'did:web',
        alias: 'webdidflow.example.com',
      })

      expect(serviceIdentifier.provider).toEqual('did:web')
      expect(serviceIdentifier.alias).toEqual('webdidflow.example.com')
      expect(serviceIdentifier.did).toEqual('did:web:webdidflow.example.com')
      serviceIdentifierKey = serviceIdentifier.keys[0]
    })

    it('should add service endpoint', async () => {
      const service = {
        id: 'did:web:webdidflow.example.com#1',
        type: 'Messaging',
        description: 'Post any RAW message here',
        serviceEndpoint: 'https://example.com/messaging',
      }

      await agent.didManagerAddService({
        did: 'did:web:webdidflow.example.com',
        service,
      })

      const testIdentifier = await agent.didManagerGet({ did: 'did:web:webdidflow.example.com' })
      expect(testIdentifier.services[0]).toEqual(service)
    })

    it('should get existing service identifier', async () => {
      const testIdentifier = await agent.didManagerGetOrCreate({
        provider: 'did:web',
        alias: 'webdidflow.example.com',
      })

      expect(testIdentifier.keys[0]).toEqual(serviceIdentifierKey)
      expect(testIdentifier.provider).toEqual('did:web')
      expect(testIdentifier.alias).toEqual('webdidflow.example.com')
      expect(testIdentifier.did).toEqual('did:web:webdidflow.example.com')
    })

    it('should create identifier with alias: alice', async () => {
      alice = await agent.didManagerGetOrCreate({
        alias: 'alice',
        provider: 'did:ethr:goerli',
      })

      expect(alice.provider).toEqual('did:ethr:goerli')
      expect(alice.alias).toEqual('alice')
      expect(alice.did).toBeDefined()
    })

    it('should create identifier with alias: bob', async () => {
      bob = await agent.didManagerGetOrCreate({
        alias: 'bob',
        provider: 'did:ethr:goerli',
      })

      expect(bob.provider).toEqual('did:ethr:goerli')
      expect(bob.alias).toEqual('bob')
      expect(bob.did).toBeDefined()
    })

    it('should query identifiers', async () => {
      const identifiers = await agent.didManagerFind()
      expect(identifiers.length).toBeGreaterThanOrEqual(3)
    })

    describe('should create verifiable credential', () => {
      it('issuer: serviceIdentifier', async () => {
        const verifiableCredential = await agent.createVerifiableCredential({
          save: true,
          credential: {
            issuer: { id: serviceIdentifier.did },
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'Profile'],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
              id: alice.did,
              name: 'Alice',
            },
          },
          proofFormat: 'jwt',
        })

        expect(verifiableCredential.issuer).toEqual({ id: serviceIdentifier.did })
        expect(verifiableCredential.credentialSubject).toEqual({ id: alice.did, name: 'Alice' })
        expect(verifiableCredential).toHaveProperty('proof.jwt')
      })

      it('issuer - Alice, subject - Bob', async () => {
        const a = await agent.didManagerGetOrCreate({
          alias: 'alice',
        })

        const b = await agent.didManagerGetOrCreate({
          alias: 'bob',
        })

        const verifiableCredential = await agent.createVerifiableCredential({
          save: true,
          credential: {
            issuer: { id: a.did },
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
              id: b.did,
              name: 'Bob',
            },
          },
          proofFormat: 'jwt',
        })

        expect(verifiableCredential.issuer).toEqual({ id: alice.did })
        expect(verifiableCredential.credentialSubject).toEqual({ id: bob.did, name: 'Bob' })
        expect(verifiableCredential).toHaveProperty('proof.jwt')
      })

      it('should be able to query credentials', async () => {
        const credentials = await agent.dataStoreORMGetVerifiableCredentials({
          where: [
            { column: 'subject', value: [alice.did], op: 'Equal' },
            { column: 'type', value: ['VerifiableCredential,Profile'], op: 'Equal' },
          ],
          order: [{ column: 'issuanceDate', direction: 'DESC' }],
        })

        expect(credentials.length).toEqual(1)
      })
    })
  })
}
