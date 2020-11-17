import { Agent } from '../agent'
import { IAgentPlugin } from '../types/IAgent'
import { EventListenerError, IEventListener } from '../types/IEventListener'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('daf-core agent', () => {
  it('calls listener with object data', async () => {
    const plugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: jest.fn(),
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
      onEvent: jest.fn(),
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
      onEvent: jest.fn(),
    }
    const agent = new Agent({
      plugins: [plugin],
    })

    agent.emit('bar', 'baz')

    expect(plugin.onEvent).not.toBeCalled()
  })

  it('handles event chain', async () => {
    const firstPlugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: async (event, context) => {
        context.agent.emit('bar', { baz: 'bam' })
      },
    }
    const secondPlugin: IEventListener = {
      eventTypes: ['bar'],
      onEvent: jest.fn(),
    }
    const agent = new Agent({
      plugins: [firstPlugin, secondPlugin],
    })

    agent.emit('foo', {})

    await expect(secondPlugin.onEvent).toBeCalled()
  })

  // it('handles listener registered directly on agent.. not sure if it is safe to expose the agent as EventEmitter directly', async () => {
  //   const plugin: IEventListener = {
  //     eventTypes: ['foo'],
  //     onEvent: async (event, context) => {
  //       context.agent.emit('bar', { baz: 'bam' })
  //     },
  //   }

  //   const agent = new Agent({
  //     plugins: [plugin],
  //   })

  //   const secondListener = jest.fn()
  //   agent.on('bar', secondListener)

  //   agent.emit('foo')

  //   await expect(secondListener).toBeCalledWith({ baz: 'bam' })
  // })

  it('handles errors thrown in listeners', async () => {
    expect.assertions(1)
    const plugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: async () => {
        throw new Error("I can't handle it!!!!")
      },
    }
    const errorHandler: IEventListener = {
      eventTypes: ['error'],
      onEvent: jest.fn(),
    }
    const agent = new Agent({
      plugins: [plugin, errorHandler],
    })

    agent.emit('foo', 'bar')
    await sleep(1)

    expect(errorHandler.onEvent).toBeCalledWith(
      {
        type: 'error',
        data: new EventListenerError("type=foo, data=bar, err=Error: I can't handle it!!!!"),
      },
      { agent: agent },
    )
  })

  it('handles errors thrown in listeners', async (done) => {
    expect.assertions(1)

    const plugin: IEventListener = {
      eventTypes: ['foo'],
      onEvent: async () => {
        await sleep(1500)
        throw new Error("I can't handle it!!!!")
      },
    }
    const errorHandler: IEventListener = {
      eventTypes: ['error'],
      onEvent: async ({ type, data }, context) => {
        const err = data as Error
        expect(err.name).toEqual('EventListenerError')
        done()
      },
    }
    const agent = new Agent({
      plugins: [plugin, errorHandler],
    })

    agent.emit('foo', {})
  })
})
