// noinspection ES6PreferShortImport

import { IAgentOptions, ICredentialPlugin, MinimalImportableKey, TAgent } from '../../packages/core-types/src'

type ConfiguredAgent = TAgent<ICredentialPlugin>
export default (testContext: {
  getAgent: (options?: IAgentOptions) => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('credential plugin options', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      return true
    })
    afterAll(testContext.tearDown)

    it('should list signing options for did:key with Ed25519 key', async () => {
      const iid = await agent.didManagerCreate({
        provider: 'did:key',
        kms: 'local',
        options: {
          keyType: 'Ed25519',
        },
      })

      const options = await agent.listUsableProofFormats(iid)
      expect(options).toEqual(['jwt', 'lds'])
    })

    it('should list signing options for did:key with Secp256k1 key', async () => {
      const iid = await agent.didManagerCreate({
        provider: 'did:key',
        kms: 'local',
        options: {
          keyType: 'Secp256k1',
        },
      })

      const options = await agent.listUsableProofFormats(iid)
      expect(options).toEqual(['EthereumEip712Signature2021', 'jwt', 'lds'])
    })

    it('should list signing options for did:key with X25519 key', async () => {
      const iid = await agent.didManagerCreate({
        provider: 'did:key',
        kms: 'local',
        options: {
          keyType: 'X25519',
        },
      })

      const options = await agent.listUsableProofFormats(iid)
      expect(options).toEqual([])
    })

    it('should list signing options for did:ethr with web3 backed keys', async () => {
      const account = `0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1`
      const did = `did:ethr:${account}`
      const controllerKeyId = `ethers-${account}`
      const iid = await agent.didManagerImport({
        did,
        provider: 'did:ethr',
        controllerKeyId,
        keys: [
          {
            kid: controllerKeyId,
            type: 'Secp256k1',
            kms: 'web3',
            privateKeyHex: '',
            publicKeyHex: '',
            meta: {
              account,
              provider: 'ethers',
              algorithms: ['eth_signMessage', 'eth_signTypedData'],
            },
          } as MinimalImportableKey,
        ],
      })

      const options = await agent.listUsableProofFormats(iid)
      expect(options).toEqual(['EthereumEip712Signature2021'])
    })
  })
}
