import { TAgent, IIdentityManager, IKeyManager } from '../../packages/daf-core/src'

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
      ).rejects.toThrow('No enum match for: foobar')
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

    it('should delete key', async () => {
      const key = await agent.keyManagerCreateKey({
        kms: 'local',
        type: 'Secp256k1',
      })

      const result = await agent.keyManagerDeleteKey({
        kid: key.kid,
      })

      expect(result).toEqual(true)

      await expect(
        agent.keyManagerGetKey({
          kid: key.kid,
        }),
      ).rejects.toThrow('Key not found')

      await expect(
        agent.keyManagerDeleteKey({
          kid: key.kid,
        }),
      ).rejects.toThrow('Key not found')
    })

    it('should import key', async () => {
      const key = await agent.keyManagerCreateKey({
        kms: 'local',
        type: 'Secp256k1',
        meta: {
          foo: 'bar',
        },
      })

      const fullKey = await agent.keyManagerGetKey({
        kid: key.kid,
      })

      await agent.keyManagerDeleteKey({
        kid: key.kid,
      })

      const result = await agent.keyManagerImportKey(fullKey)
      expect(result).toEqual(true)

      const key2 = await agent.keyManagerGetKey({
        kid: key.kid,
      })

      expect(key2).toEqual(fullKey)
    })

    it('should sign JWT', async () => {
      const key = await agent.keyManagerCreateKey({
        kms: 'local',
        type: 'Secp256k1',
      })

      const signature = await agent.keyManagerSignJWT({
        kid: key.kid,
        data: 'test',
      })

      expect(signature).toHaveProperty('r')
      expect(signature).toHaveProperty('s')
      expect(signature).toHaveProperty('recoveryParam')
    })

    it('should sign EthTX', async () => {
      const key = await agent.keyManagerCreateKey({
        kms: 'local',
        type: 'Secp256k1',
      })

      const rawTx = await agent.keyManagerSignEthTX({
        kid: key.kid,
        transaction: {
          to: '0xce31a19193d4b23f4e9d6163d7247243bAF801c3',
          value: 300000,
          gas: 43092000,
          gasPrice: '20000000000',
          nonce: 1,
        },
      })

      expect(typeof rawTx).toEqual('string')
    })

    it.todo('Should Encrypt/Decrypt')
    // it('Should Encrypt/Decrypt', async () => {
    // const message = 'foo bar'

    // const senderKey = await agent.keyManagerCreateKey({
    //   kms: 'local',
    //   type: 'Ed25519',
    // })

    // const recipientKey = await agent.keyManagerCreateKey({
    //   kms: 'local',
    //   type: 'Ed25519',
    // })

    // const encrypted = await agent.keyManagerEncryptJWE({
    //   kid: senderKey.kid,
    //   to: recipientKey,
    //   data: message
    // })

    // expect(typeof encrypted).toEqual('string')

    // const decrypted = await agent.keyManagerDecryptJWE({
    //   kid: recipientKey.kid,
    //   data: encrypted
    // })

    // expect(decrypted).toEqual(message)

    // })
  })
}
