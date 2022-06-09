import { IAgentOptions, IDIDManager, IResolver, MinimalImportableKey, TAgent } from '../../packages/core/src'
import { getChainIdForDidEthr, resolveDidOrThrow, mapIdentifierKeysToDoc } from '../../packages/utils/src'

type ConfiguredAgent = TAgent<IResolver & IDIDManager>

export default (testContext: {
  getAgent: (options?: IAgentOptions) => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('utilities', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      return true
    })
    afterAll(testContext.tearDown)

    it('should get chainId for ethr did', async () => {
      const didUrl = 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
      const didDoc = await resolveDidOrThrow(didUrl, {agent})
      if (didDoc.verificationMethod) {
        const chainId = getChainIdForDidEthr(didDoc.verificationMethod[0])
        expect(chainId).toEqual(4)
      }
    })

    it('should map identifier keys to did doc', async () => {
      const account = `0xb09b66026ba5909a7cfe99b76875431d2b8d5190`
      const did = `did:ethr:0x4:${account}`
      const controllerKeyId = `${did}#controller`
      await agent.didManagerImport({
        did,
        provider: 'did:ethr:rinkeby',
        controllerKeyId,
        keys: [{
          kid: controllerKeyId,
          type: 'Secp256k1',
          kms: 'web3',
          privateKeyHex: '',
          publicKeyHex: '',
          meta: {
            account,
            provider: 'metamask',
            algorithms: [
              'eth_signMessage',
              'eth_signTypedData',
            ]
          },
        } as MinimalImportableKey],
      })

      const identifier = await agent.didManagerGet({ did })
      const extendedKeys = await mapIdentifierKeysToDoc(identifier, 'verificationMethod', { agent })
      expect(extendedKeys[0].meta.verificationMethod?.blockchainAccountId?.toLocaleLowerCase()).toEqual(`${account}@eip155:4`)
    
    })
  })
}