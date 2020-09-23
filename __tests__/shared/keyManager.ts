import { TAgent, IIdentityManager, IKeyManager } from 'daf-core'

type ConfiguredAgent = TAgent<IIdentityManager & IKeyManager>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('key manager', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      return true
    })
    afterAll(testContext.tearDown)

    it('should get a list of available key management systems', async () => {
      const keyManagementSystems = await agent.keyManagerGetKeyManagementSystems()
      expect(keyManagementSystems).toEqual(['local'])
    })

    it('should create Secp256k1 key', async () => {
      const key = await agent.keyManagerCreateKey({
        kms: 'local',
        type: 'Secp256k1',
      })

      expect(key).toHaveProperty('kid')
      expect(key).toHaveProperty('publicKeyHex')
      expect(key).not.toHaveProperty('privateKeyHex')
      expect(key.kms).toEqual('local')
      expect(key.type).toEqual('Secp256k1')
    })

    it('should create Ed25519 key', async () => {
      const key = await agent.keyManagerCreateKey({
        kms: 'local',
        type: 'Ed25519',
      })

      expect(key).toHaveProperty('kid')
      expect(key).toHaveProperty('publicKeyHex')
      expect(key).not.toHaveProperty('privateKeyHex')
      expect(key.kms).toEqual('local')
      expect(key.type).toEqual('Ed25519')
    })

    it('should throw an error for unsupported kms', async () => {
      await expect(
        agent.keyManagerCreateKey({
          kms: 'foobar',
          type: 'Secp256k1',
        }),
      ).rejects.toThrow('KMS does not exist: foobar')
    })

    it('should throw an error for unsupported key type', async () => {
      await expect(
        agent.keyManagerCreateKey({
          kms: 'local',
          //@ts-ignore
          type: 'foobar',
        }),
      ).rejects.toThrow('Key type not supported: foobar')
    })

    it('should create key with meta data', async () => {
      const key = await agent.keyManagerCreateKey({
        kms: 'local',
        type: 'Secp256k1',
        meta: {
          foo: 'bar',
          bar: 'baz',
        },
      })

      expect(key).toHaveProperty('kid')
      expect(key).toHaveProperty('publicKeyHex')
      expect(key).not.toHaveProperty('privateKeyHex')
      expect(key.kms).toEqual('local')
      expect(key.type).toEqual('Secp256k1')
      expect(key.meta).toEqual({
        foo: 'bar',
        bar: 'baz',
      })
    })

    it('should get key by key id', async () => {
      const key = await agent.keyManagerCreateKey({
        kms: 'local',
        type: 'Secp256k1',
      })

      const key2 = await agent.keyManagerGetKey({
        kid: key.kid,
      })

      expect(key2).toHaveProperty('privateKeyHex')
      expect(key2.publicKeyHex).toEqual(key.publicKeyHex)
    })
    it.todo('should delete key')
    it.todo('should import key')
    it.todo('should sign JWT')
    it.todo('should sign EthTX')
  })
}
