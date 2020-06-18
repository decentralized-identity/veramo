import { Agent } from '../agent'
import { IAgentPlugin } from '../types'

describe('daf-core agent', () => {
  it('should use plugin methods', async () => {
    const plugin: IAgentPlugin = {
      methods: {
        doSomething: jest.fn(),
      },
    }
    const agent = new Agent({
      plugins: [plugin],
    })

    //@ts-ignore
    await agent.doSomething({ foo: 'baz' })
    expect(plugin.methods.doSomething).toBeCalledWith({ foo: 'baz' }, { agent })
    await agent.execute('doSomething', { foo: 'bar' })
    expect(plugin.methods.doSomething).toBeCalledWith({ foo: 'bar' }, { agent })
  })

  it('should allow method overrides', async () => {
    const doSomething = jest.fn()
    const plugin: IAgentPlugin = {
      methods: {
        doSomething: jest.fn(),
      },
    }
    const agent = new Agent({
      plugins: [plugin],
      overrides: {
        doSomething,
      },
    })

    //@ts-ignore
    await agent.doSomething({ foo: 'baz' })
    expect(doSomething).toBeCalledWith({ foo: 'baz' }, { agent })
    await agent.execute('doSomething', { foo: 'bar' })
    expect(doSomething).toBeCalledWith({ foo: 'bar' }, { agent })
  })

  it('should expose only authorized methods', async () => {
    const doSomething = jest.fn()
    const baz = jest.fn()
    const plugin: IAgentPlugin = {
      methods: {
        foo: jest.fn(),
        bar: jest.fn(),
      },
    }
    const agent = new Agent({
      authorizedMethods: ['bar', 'baz'],
      plugins: [plugin],
      overrides: {
        doSomething,
        baz,
      },
    })

    //@ts-ignore
    expect(agent.doSomething).toEqual(undefined)
    expect(agent.execute('doSomething', { foo: 'bar' })).rejects.toEqual(
      Error('Method not available: doSomething'),
    )

    //@ts-ignore
    await agent.bar({ foo: 'baz' })
    expect(plugin.methods.bar).toBeCalledWith({ foo: 'baz' }, { agent })
    await agent.execute('baz', { foo: 'bar' })
    expect(baz).toBeCalledWith({ foo: 'bar' }, { agent })

    expect(agent.availableMethods()).toEqual(['bar', 'baz'])
  })

  it('should pass through context', async () => {
    const plugin: IAgentPlugin = {
      methods: {
        doSomething: jest.fn(),
      },
    }
    const agent = new Agent({
      context: {
        authorizedDid: 'did:example:123',
      },
      plugins: [plugin],
    })

    //@ts-ignore
    await agent.doSomething({ foo: 'baz' })
    expect(plugin.methods.doSomething).toBeCalledWith(
      { foo: 'baz' },
      { agent, authorizedDid: 'did:example:123' },
    )
    await agent.execute('doSomething', { foo: 'bar' })
    expect(plugin.methods.doSomething).toBeCalledWith(
      { foo: 'bar' },
      { agent, authorizedDid: 'did:example:123' },
    )
  })
})
