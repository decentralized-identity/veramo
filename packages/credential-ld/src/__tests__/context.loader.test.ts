import { ContextDoc } from '../types.js'
import { LdContextLoader } from '../ld-context-loader.js'
import { LdDefaultContexts } from '../ld-default-contexts.js'

describe('credential-ld context loader', () => {
  const customContext: Record<string, ContextDoc> = {
    'https://example.com/custom/context': {
      '@context': {
        '@version': 1.1,
        id: '@id',
        type: '@type',
        nothing: 'https://example.com/nothing',
      },
    },
  }

  it('loads custom context from record', async () => {
    expect.assertions(2)
    const loader = new LdContextLoader({ contextsPaths: [customContext] })
    expect(loader.has('https://example.com/custom/context')).toBe(true)
    await expect(loader.get('https://example.com/custom/context')).resolves.toEqual({
      '@context': {
        '@version': 1.1,
        id: '@id',
        type: '@type',
        nothing: 'https://example.com/nothing',
      },
    })
  })

  it('loads context from default map', async () => {
    expect.assertions(2)
    const loader = new LdContextLoader({ contextsPaths: [LdDefaultContexts] })
    expect(loader.has('https://www.w3.org/2018/credentials/v1')).toBe(true)

    const credsContext = await loader.get('https://www.w3.org/2018/credentials/v1')
    expect(credsContext['@context']).toBeDefined()
  })
})
