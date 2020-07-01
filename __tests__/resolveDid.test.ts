import { createAgent, TAgent, IResolveDid } from 'daf-core'
import { DafResolver } from 'daf-resolver'

let agent: TAgent<IResolveDid>

describe('daf-resolver integration', () => {
  beforeAll(() => {
    const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

    agent = createAgent<TAgent<IResolveDid>>({
      plugins: [new DafResolver({ infuraProjectId })],
    })
  })

  it('should resolve didUrl', async () => {
    const didUrl = 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
    const didDoc = await agent.resolveDid({ didUrl })
    expect(didDoc.id).toEqual(didUrl)
  })

  it.todo('should throw an error for unsupported did methods')
})
