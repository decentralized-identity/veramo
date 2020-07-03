import { TAgent, IResolveDid } from 'daf-core'

type ConfiguredAgent = TAgent<IResolveDid>

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

    it.todo('should throw an error for unsupported did methods')
  })
}
