// noinspection ES6PreferShortImport

import { ICredentialIssuer, IDIDManager, IIdentifier, IKey, TAgent } from '../../packages/core/src'

type ConfiguredAgent = TAgent<IDIDManager & ICredentialIssuer>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('ens did flow', () => {
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
        provider: 'did:ens',
        alias: 'example.eth',
      })

      expect(serviceIdentifier.provider).toEqual('did:ens')
      expect(serviceIdentifier.alias).toEqual('example.eth')
      expect(serviceIdentifier.did).toEqual('did:ens:example.eth')
      serviceIdentifierKey = serviceIdentifier.keys[0]
    })

    it('should fail to add service endpoint', async () => {
      const service = {
        id: 'did:ens:example.eth#1',
        type: 'Messaging',
        description: 'Post any RAW message here',
        serviceEndpoint: 'https://example.com/messaging',
      }

      const res = await agent.didManagerAddService({
        did: 'did:ens:example.eth',
        service,
      })

      expect(res).toEqual({ result: false })
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

    it('should query identifiers', async () => {
      const identifiers = await agent.didManagerFind()
      expect(identifiers.length).toBeGreaterThanOrEqual(2)
    })

    describe('should create verifiable credential', () => {
      it('issuer: serviceIdentifier (did:ens)', async () => {
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
    })
  })
}
