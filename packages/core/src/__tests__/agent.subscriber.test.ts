import { Agent } from '../agent.js'
import { CoreEvents, IEventListener } from '../../../core-types/src'
import { jest } from '@jest/globals'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('core agent', () => {
  it('calls listener with object data', async () => {
    const plugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: jest.fn(() => Promise.resolve()),
    }
    const agent = new Agent({
      plugins: [plugin],
    })

    agent.emit('foo', { bar: 'baz' })

    expect(plugin.onEvent).toBeCalledWith({ type: 'foo', data: { bar: 'baz' } }, { agent })
  })

  it('calls listener with primitive data', async () => {
    const plugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: jest.fn(() => Promise.resolve()),
    }
    const agent = new Agent({
      plugins: [plugin],
    })

    agent.emit('foo', 'bar')

    expect(plugin.onEvent).toBeCalledWith({ type: 'foo', data: 'bar' }, { agent })
  })

  it('does not call listener with mismatched eventType', async () => {
    const plugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: jest.fn(() => Promise.resolve()),
    }
    const agent = new Agent({
      plugins: [plugin],
    })

    agent.emit('bar', 'baz')

    expect(plugin.onEvent).not.toBeCalled()
  })

  it('handles event chain', async () => {
    expect.assertions(1)
    const firstPlugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: async (event, context) => {
        context.agent.emit('bar', { baz: 'bam' })
      },
    }
    const secondPlugin: IEventListener = {
      eventTypes: ['bar'],
      onEvent: jest.fn(() => Promise.resolve()),
    }
    const agent = new Agent({
      plugins: [firstPlugin, secondPlugin],
    })

    agent.emit('foo', {})

    expect(secondPlugin.onEvent).toBeCalled()
  })

  it('handles errors thrown in listeners', async () => {
    const plugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: async () => {
        throw new Error("I can't handle it!!!!")
      },
    }
    const errorHandler: IEventListener = {
      eventTypes: [CoreEvents.error],
      onEvent: jest.fn(() => Promise.resolve()),
    }
    const agent = new Agent({
      plugins: [plugin, errorHandler],
    })

    await agent.emit('foo', 'bar')

    expect(errorHandler.onEvent).toBeCalledWith(
      {
        type: CoreEvents.error,
        data: new Error("I can't handle it!!!!"),
      },
      { agent: agent },
    )
  })

  it('re emits errors thrown in listeners', async () => {
    expect.assertions(2)
    const plugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: async () => {
        await sleep(1500)
        throw new Error("I can't handle it after waiting so long!!!!")
      },
    }
    const errorHandler: IEventListener = {
      eventTypes: [CoreEvents.error],
      onEvent: async ({ type, data }, context) => {
        expect(type).toBe(CoreEvents.error)
        const err = data as Error
        expect(err.message).toMatch("I can't handle it after waiting so long!!!!")
      },
    }
    const agent = new Agent({
      plugins: [plugin, errorHandler],
    })

    await agent.emit('foo', {})
  })

  it('handles events asynchronously', async () => {
    let trackRecord = ''
    const pluginFoo: IEventListener = {
      eventTypes: ['foo'],
      onEvent: async () => {
        await sleep(0)
        trackRecord += 'foo'
      },
    }
    const pluginBar: IEventListener = {
      eventTypes: ['foo'],
      onEvent: async () => {
        await sleep(0)
        trackRecord += 'bar'
      },
    }
    const agent = new Agent({
      plugins: [pluginFoo, pluginBar],
    })

    //fire and forget
    agent.emit('foo', {})
    trackRecord += 'baz'

    expect(trackRecord).toEqual('baz')

    //wait for state changes
    await agent.emit('null', {})
    expect(trackRecord).toEqual('bazfoobar')
  })

  //FIXME: do we impose that a plugin only be registered once?
  it.skip('can NOT register plugin multiple times', async () => {
    let trackRecord = ''
    const plugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: async () => {
        trackRecord += 'foo'
      },
    }
    const agent = new Agent({
      plugins: [plugin, plugin, plugin],
    })

    await agent.emit('foo', {})

    expect(trackRecord).toEqual('foo')
  })

  it("throwing in an error listener doesn't go into an endless loop", async () => {
    const plugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: async () => {
        throw new Error('fooError')
      },
    }
    const errorHandler: IEventListener = {
      eventTypes: [CoreEvents.error],
      onEvent: async () => {
        throw new Error('barError')
      },
    }
    const agent = new Agent({
      plugins: [plugin, errorHandler],
    })

    await expect(agent.emit('foo', {})).rejects.toThrow('ErrorEventHandlerError')
  })
})
