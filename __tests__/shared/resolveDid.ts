import { TAgent, IResolveDid } from 'daf-core'

type ConfiguredAgent = TAgent<IResolveDid>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<void>
  tearDown: () => Promise<void>
}) => {
  describe('resolving didUrl', () => {
    let agent: ConfiguredAgent

    beforeAll(() => {
      testContext.setup()
      agent = testContext.getAgent()
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
