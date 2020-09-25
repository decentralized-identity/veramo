import { TAgent, IIdentityManager, IKeyManager, IIdentity } from 'daf-core'

type ConfiguredAgent = TAgent<IIdentityManager & IKeyManager>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('identity manager', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      return true
    })
    afterAll(testContext.tearDown)

    it('should get providers', async () => {
      const providers = await agent.identityManagerGetProviders()
      expect(providers).toEqual(['did:ethr', 'did:ethr:rinkeby', 'did:web'])
    })

    let identity: IIdentity
    it('should create identity', async () => {
      identity = await agent.identityManagerCreateIdentity({
        provider: 'did:web',
        alias: 'example.com',
      })
      expect(identity.provider).toEqual('did:web')
      expect(identity.alias).toEqual('example.com')
      expect(identity.did).toEqual('did:web:example.com')
      expect(identity.keys.length).toEqual(1)
      expect(identity.services.length).toEqual(0)
      expect(identity.controllerKeyId).toEqual(identity.keys[0].kid)
    })

    it('should throw error for existing alias provider combo', async () => {
      await expect(
        agent.identityManagerCreateIdentity({
          provider: 'did:web',
          alias: 'example.com',
        }),
      ).rejects.toThrow('Identity with alias: example.com, provider: did:web already exists')
    })

    it('should get identity', async () => {
      const identity2 = await agent.identityManagerGetIdentity({
        did: identity.did,
      })
      expect(identity2.did).toEqual(identity.did)
    })

    it('should throw error for non existing did', async () => {
      await expect(
        agent.identityManagerGetIdentity({
          did: 'did:web:foobar',
        }),
      ).rejects.toThrow('Identity not found')
    })

    it('should get or create identity', async () => {
      const identity3 = await agent.identityManagerGetOrCreateIdentity({
        alias: 'alice',
        provider: 'did:ethr:rinkeby',
      })

      const identity4 = await agent.identityManagerGetOrCreateIdentity({
        alias: 'alice',
        provider: 'did:ethr:rinkeby',
      })

      expect(identity3).toEqual(identity4)

      const identity5 = await agent.identityManagerGetOrCreateIdentity({
        alias: 'alice',
        provider: 'did:ethr',
      })

      expect(identity5).not.toEqual(identity4)

      const identity6 = await agent.identityManagerGetIdentityByAlias({
        alias: 'alice',
        provider: 'did:ethr',
      })

      expect(identity6).toEqual(identity5)

      const identity7 = await agent.identityManagerGetIdentityByAlias({
        alias: 'alice',
        // default provider is 'did:ethr:rinkeby'
      })

      expect(identity7).toEqual(identity4)
    })

    it.todo('should get identities')
    it.todo('should import identity')
    it.todo('should delete identity')
    it.todo('should add key to identity')
    it.todo('should remove key from identity')
    it.todo('should add service to identity')
    it.todo('should remove service from identity')
  })
}
