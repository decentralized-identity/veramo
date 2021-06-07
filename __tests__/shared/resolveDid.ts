import { TAgent, IResolver, IAgentOptions } from '../../packages/core/src'

type ConfiguredAgent = TAgent<IResolver>

export default (testContext: {
  getAgent: (options?: IAgentOptions) => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('resolving didUrl', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      return true
    })
    afterAll(testContext.tearDown)

    it('should resolve didUrl', async () => {
      const didUrl = 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
      const didDoc = (await agent.resolveDid({ didUrl })).didDocument
      expect(didDoc?.id).toEqual(didUrl)
    })

    it('should resolve did:key', async () => {
      const didUrl = 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL'
      const result = await agent.resolveDid({ didUrl })
      const didDoc = result.didDocument
      expect(didDoc?.id).toEqual(didUrl)
    })

    it('should return an error for unsupported did methods', async () => {
      expect.assertions(1)
      await expect(agent.resolveDid({ didUrl: 'did:foo:bar' })).resolves.toEqual({
        didDocument: null,
        didResolutionMetadata: { error: 'unsupportedDidMethod' },
        didDocumentMetadata: {},
      })
    })

    it('should throw error when resolving garbage', async () => {
      //@ts-ignore
      await expect(agent.resolveDid()).resolves.toEqual({
        didDocument: null,
        didDocumentMetadata: {},
        didResolutionMetadata: { error: 'invalidDid' },
      })
      //@ts-ignore
      await expect(agent.resolveDid({})).resolves.toEqual({
        didDocument: null,
        didDocumentMetadata: {},
        didResolutionMetadata: { error: 'invalidDid' },
      })
      //@ts-ignore
      await expect(agent.resolveDid({ didUrl: 'garbage' })).resolves.toEqual({
        didDocument: null,
        didDocumentMetadata: {},
        didResolutionMetadata: { error: 'invalidDid' },
      })
    })
  })

  describe('resolving didUrl with validation', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup({ schemaValidation: true })
      agent = testContext.getAgent({ schemaValidation: true })
      return true
    })
    afterAll(testContext.tearDown)

    it('should throw validation error', async () => {
      //@ts-ignore
      await expect(agent.resolveDid()).rejects.toHaveProperty('name', 'ValidationError')
      //@ts-ignore
      await expect(agent.resolveDid({})).rejects.toHaveProperty('name', 'ValidationError')
      //@ts-ignore
      await expect(agent.resolveDid({ didUrl: 1 })).rejects.toHaveProperty('name', 'ValidationError')
    })
  })
}
