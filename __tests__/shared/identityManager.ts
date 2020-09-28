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

    it('should get identities', async () => {
      const allIdentities = await agent.identityManagerGetIdentities()
      expect(allIdentities.length).toEqual(3)

      const aliceIdentities = await agent.identityManagerGetIdentities({
        alias: 'alice',
      })
      expect(aliceIdentities.length).toEqual(2)

      const rinkebyIdentities = await agent.identityManagerGetIdentities({
        provider: 'did:ethr:rinkeby',
      })
      expect(rinkebyIdentities.length).toEqual(1)

      // Default provider 'did:ethr:rinkeby'
      await agent.identityManagerCreateIdentity()

      const rinkebyIdentities2 = await agent.identityManagerGetIdentities({
        provider: 'did:ethr:rinkeby',
      })
      expect(rinkebyIdentities2.length).toEqual(2)
    })

    it('should delete identity', async () => {
      const allIdentities = await agent.identityManagerGetIdentities()
      const count = allIdentities.length

      const result = await agent.identityManagerDeleteIdentity({
        did: allIdentities[0].did,
      })

      expect(result).toEqual(true)

      const allIdentities2 = await agent.identityManagerGetIdentities()
      expect(allIdentities2.length).toEqual(count - 1)

      await expect(
        agent.identityManagerGetIdentity({
          did: allIdentities[0].did,
        }),
      ).rejects.toThrow('Identity not found')
    })

    it('should add service to identity', async () => {
      const webIdentity = await agent.identityManagerGetOrCreateIdentity({
        alias: 'foobar.com',
        provider: 'did:web',
      })

      expect(webIdentity.services.length).toEqual(0)

      const result = await agent.identityManagerAddService({
        did: webIdentity.did,
        service: {
          id: 'did:web:foobar.com#msg',
          type: 'Messaging',
          serviceEndpoint: 'https://foobar.com/messaging',
          description: 'Handles incoming messages',
        },
      })
      expect(result).toEqual(true)

      const webIdentity2 = await agent.identityManagerGetOrCreateIdentity({
        alias: 'foobar.com',
        provider: 'did:web',
      })

      expect(webIdentity2.services.length).toEqual(1)
      expect(webIdentity2.services[0]).toEqual({
        id: 'did:web:foobar.com#msg',
        type: 'Messaging',
        serviceEndpoint: 'https://foobar.com/messaging',
        description: 'Handles incoming messages',
      })
    })

    it('should remove service from identity', async () => {
      const result = await agent.identityManagerRemoveService({
        did: 'did:web:foobar.com',
        id: 'did:web:foobar.com#msg',
      })

      expect(result).toEqual(true)

      const webIdentity = await agent.identityManagerGetOrCreateIdentity({
        alias: 'foobar.com',
        provider: 'did:web',
      })

      expect(webIdentity.services.length).toEqual(0)
    })

    it('should add key to identity', async () => {
      const webIdentity = await agent.identityManagerGetOrCreateIdentity({
        alias: 'foobar.com',
        provider: 'did:web',
      })

      expect(webIdentity.keys.length).toEqual(1)

      const newKey = await agent.keyManagerCreateKey({
        kms: 'local',
        type: 'Secp256k1',
      })

      const result = await agent.identityManagerAddKey({
        did: webIdentity.did,
        key: newKey,
      })

      expect(result).toEqual(true)

      const webIdentity2 = await agent.identityManagerGetOrCreateIdentity({
        alias: 'foobar.com',
        provider: 'did:web',
      })

      expect(webIdentity2.keys.length).toEqual(2)
    })

    it('should remove key from identity', async () => {
      const webIdentity = await agent.identityManagerGetIdentity({
        did: 'did:web:foobar.com',
      })

      expect(webIdentity.keys.length).toEqual(2)

      const result = await agent.identityManagerRemoveKey({
        did: 'did:web:foobar.com',
        kid: webIdentity.keys[1].kid,
      })

      expect(result).toEqual(true)

      const webIdentity2 = await agent.identityManagerGetIdentity({
        did: 'did:web:foobar.com',
      })

      expect(webIdentity2.keys.length).toEqual(1)
      expect(webIdentity2.keys[0].kid).toEqual(webIdentity.keys[0].kid)
    })

    it.todo('should import identity')

    it.todo('should add key for did:ethr')
    it.todo('should remove key for did:ethr')
    it.todo('should add service for did:ethr')
    it.todo('should remove service for did:ethr')
  })
}
