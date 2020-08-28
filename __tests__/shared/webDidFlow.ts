import { TAgent, IIdentityManager, IIdentity, IKey } from 'daf-core'
import { ICredentialIssuer } from 'daf-w3c'

type ConfiguredAgent = TAgent<IIdentityManager & ICredentialIssuer>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('web did flow', () => {
    let agent: ConfiguredAgent
    let serviceIdentity: IIdentity
    let serviceIdentityKey: IKey
    let alice: IIdentity
    let bob: IIdentity

    beforeAll(() => {
      testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    it('should create service identity', async () => {
      serviceIdentity = await agent.identityManagerGetOrCreateIdentity({
        provider: 'did:web',
        alias: 'example.com',
      })

      expect(serviceIdentity.provider).toEqual('did:web')
      expect(serviceIdentity.alias).toEqual('example.com')
      expect(serviceIdentity.did).toEqual('did:web:example.com')
      serviceIdentityKey = serviceIdentity.keys[0]
    })

    it('should get existing service identity', async () => {
      const testIdentity = await agent.identityManagerGetOrCreateIdentity({
        provider: 'did:web',
        alias: 'example.com',
      })

      expect(testIdentity.keys[0]).toEqual(serviceIdentityKey)
      expect(testIdentity.provider).toEqual('did:web')
      expect(testIdentity.alias).toEqual('example.com')
      expect(testIdentity.did).toEqual('did:web:example.com')
    })

    it('should create identity with alias: alice', async () => {
      alice = await agent.identityManagerGetOrCreateIdentity({
        alias: 'alice',
      })

      expect(alice.provider).toEqual('did:ethr:rinkeby')
      expect(alice.alias).toEqual('alice')
      expect(alice.did).toBeDefined()
    })

    it('should create identity with alias: bob', async () => {
      bob = await agent.identityManagerGetOrCreateIdentity({
        alias: 'bob',
      })

      expect(bob.provider).toEqual('did:ethr:rinkeby')
      expect(bob.alias).toEqual('bob')
      expect(bob.did).toBeDefined()
    })

    it('should query identities', async () => {
      const identities = await agent.dataStoreORMGetIdentities()
      expect(identities.length).toEqual(3)
      const count = await agent.dataStoreORMGetIdentitiesCount()
      expect(count).toEqual(3)
    })

    describe('should create verifiable credential', () => {
      it('issuer: serviceIdentity', async () => {
        const verifiableCredential = await agent.createVerifiableCredential({
          save: true,
          credential: {
            issuer: { id: serviceIdentity.did },
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

        expect(verifiableCredential.issuer).toEqual({ id: serviceIdentity.did })
        expect(verifiableCredential.credentialSubject).toEqual({ id: alice.did, name: 'Alice' })
        expect(verifiableCredential).toHaveProperty('proof.jwt')
      })

      it('issuer - Alice, subject - Bob', async () => {
        const a = await agent.identityManagerGetOrCreateIdentity({
          alias: 'alice',
        })

        const b = await agent.identityManagerGetOrCreateIdentity({
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
