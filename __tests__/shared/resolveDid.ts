import { TAgent, IResolver, ValidationError } from '../../packages/daf-core/src'

type ConfiguredAgent = TAgent<IResolver>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
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
      const didDoc = await agent.resolveDid({ didUrl })
      expect(didDoc.id).toEqual(didUrl)
    })

    // it('should throw an error for unsupported did methods', async () => {
    //   await expect(agent.resolveDid({ didUrl: 'did:foo:bar' })).rejects.toThrow("Unsupported DID method: 'foo'")
    // })

    // it('should throw validation error', async () => {
    //   //@ts-ignore
    //   await expect(agent.resolveDid()).rejects.toHaveProperty('name', 'ValidationError')
    //   //@ts-ignore
    //   await expect(agent.resolveDid({})).rejects.toHaveProperty('name', 'ValidationError')
    //   //@ts-ignore
    //   await expect(agent.resolveDid({didUrl: 1})).rejects.toHaveProperty('name', 'ValidationError')

    // })
  })
}
