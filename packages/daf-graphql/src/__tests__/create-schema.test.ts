import { createSchema } from '../create-schema'

describe('daf-graphql create-schema', () => {
  it('should support method overrides', async () => {
    const schema = createSchema({
      enabledMethods: ['mockMethod'],
      overrides: {
        mockMethod: {
          type: 'Query',
          query: 'mockQuery',
          typeDef: `extends Query {
            mockQuery: String[]
          }`,
        },
      },
    })

    expect(Object.keys(schema.resolvers.Query)).toContain('mockMethod')

    const context = {
      agent: {
        execute: jest.fn(),
      },
    }

    await schema.resolvers.Query.mockMethod({ a: 'a' }, { b: 'b' }, context)

    expect(context.agent.execute).toBeCalledWith('mockMethod', { b: 'b' })
  })

  it('should throw error if method is not available', () => {
    expect(() =>
      createSchema({
        enabledMethods: ['mockMethod'],
      }),
    ).toThrowError('[daf:graphql:create-schema] Method not available: mockMethod')
  })

  it('should support resolveDid method', () => {
    const schema = createSchema({
      enabledMethods: ['resolveDid'],
    })
    expect(Object.keys(schema.resolvers.Query)).toContain('resolveDid')
  })
})
