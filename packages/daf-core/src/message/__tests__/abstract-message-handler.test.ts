import { AbstractMessageHandler, unsupportedMessageTypeError } from '../abstract-message-handler'
import { Core } from '../../core'
import { Message } from '../../entities/message'

class MockMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, core: Core) {
    if (message.raw === 'mock') {
      message.type = 'mock'
      return message
    }
    return super.handle(message, core)
  }
}

class MockMessageHandlerWithError extends AbstractMessageHandler {
  async handle(message: Message, core: Core) {
    // This simulates a scenario when validation process encounters an error,
    // such as a network error

    throw Error('Network error')

    return message
  }
}

const core = new Core({
  identityProviders: [],
  serviceControllers: [],
  didResolver: { resolve: jest.fn() },
  messageHandler: new MockMessageHandler(),
})

it('should return a promise and resolve it if the massage is of known type', async () => {
  const msg = new Message({ raw: 'mock', metaData: [{ type: 'test' }] })
  const Handler = new MockMessageHandler()
  const handled = await Handler.handle(msg, core)
  expect(handled.type).toEqual('mock')
  expect(handled.isValid()).toEqual(true)
})

it('should return a promise and reject it if the massage is of unknown type', async () => {
  const msg = new Message({ raw: 'unknown', metaData: [{ type: 'test2' }] })
  const Handler = new MockMessageHandler()
  await expect(Handler.handle(msg, core)).rejects.toEqual(unsupportedMessageTypeError)
})

it('can throw an error', async () => {
  const msg = new Message({ raw: 'mock', metaData: [{ type: 'test3' }] })
  const Handler = new MockMessageHandlerWithError()
  try {
    const handled = await Handler.handle(msg, core)
  } catch (e) {
    expect(e !== unsupportedMessageTypeError).toEqual(true)
  }
})
