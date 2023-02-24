import { Agent, createAgent } from '../agent.js'
import { IAgentPlugin, IResolver } from '../../../core-types/src'
import { jest } from '@jest/globals'

describe('core agent', () => {
  it('should use plugin methods', async () => {
    const plugin: IAgentPlugin = {
      methods: {
        doSomething: jest.fn(() => Promise.resolve()),
      },
    }
    const agent = new Agent({
      plugins: [plugin],
    })

    // @ts-ignore
    await agent.doSomething({ foo: 'baz' })
    expect(plugin.methods?.doSomething).toBeCalledWith({ foo: 'baz' }, { agent })
    await agent.execute('doSomething', { foo: 'bar' })
    expect(plugin.methods?.doSomething).toBeCalledWith({ foo: 'bar' }, { agent })
  })

  it('should allow method overrides', async () => {
    const doSomething = jest.fn()
    const plugin: IAgentPlugin = {
      methods: {
        doSomething: jest.fn(() => Promise.resolve()),
      },
    }
    const agent = new Agent({
      plugins: [plugin],
      overrides: {
        // @ts-ignore
        doSomething,
      },
    })

    // @ts-ignore
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
        foo: jest.fn(() => Promise.resolve()),
        bar: jest.fn(() => Promise.resolve()),
      },
    }
    const agent = new Agent({
      authorizedMethods: ['bar', 'baz'],
      plugins: [plugin],
      overrides: {
        // @ts-ignore
        doSomething,
        // @ts-ignore
        baz,
      },
    })

    // @ts-ignore
    expect(agent.doSomething).toEqual(undefined)
    expect(agent.execute('doSomething', { foo: 'bar' })).rejects.toEqual(
      Error('Method not available: doSomething'),
    )

    // @ts-ignore
    await agent.bar({ foo: 'baz' })
    expect(plugin.methods?.bar).toBeCalledWith({ foo: 'baz' }, { agent })
    await agent.execute('baz', { foo: 'bar' })
    expect(baz).toBeCalledWith({ foo: 'bar' }, { agent })

    expect(agent.availableMethods()).toEqual(['bar', 'baz'])
  })

  it('should pass through context', async () => {
    const plugin: IAgentPlugin = {
      methods: {
        doSomething: jest.fn(() => Promise.resolve()),
      },
    }
    const agent = new Agent({
      context: {
        authorizedDid: 'did:example:123',
      },
      plugins: [plugin],
    })

    // @ts-ignore
    await agent.doSomething({ foo: 'baz' })
    expect(plugin.methods?.doSomething).toBeCalledWith(
      { foo: 'baz' },
      { agent, authorizedDid: 'did:example:123' },
    )
    await agent.execute('doSomething', { foo: 'bar' })
    expect(plugin.methods?.doSomething).toBeCalledWith(
      { foo: 'bar' },
      { agent, authorizedDid: 'did:example:123' },
    )
  })

  it('should be possible to define context type', () => {
    interface IContext {
      name: string
      authorizedDid: string
    }
    const agent = createAgent<IResolver, IContext>({
      context: {
        name: 'Agent name',
        authorizedDid: 'did:example:123',
      },
    })

    expect(agent.context?.name).toEqual('Agent name')
    expect(agent.context?.authorizedDid).toEqual('did:example:123')
  })

  it('context type should be optional', () => {
    const agent = createAgent<IResolver>({
      context: {
        name: 'Agent name',
        authorizedDid: 'did:example:123',
      },
    })

    expect(agent.context?.name).toEqual('Agent name')
    expect(agent.context?.authorizedDid).toEqual('did:example:123')
  })

  it.todo('createAgent should return instance of Agent')
  it.todo('should throw an error on method exception')
  it.todo('should throw an error on invalid types of constructor params')
  it.todo('should throw an error on invalid types of constructor param')
  it.todo('should throw an error if plugin implements protected methods')
  it.todo("should throw an error if authorized methods don't match available methods")
  it.todo('should throw an error if execute is called on unauthorized method')
})
