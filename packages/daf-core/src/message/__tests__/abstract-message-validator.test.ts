import { AbstractMessageValidator, unsupportedMessageTypeError } from '../abstract-message-validator'
import { Core } from '../../core'
import { Message } from '../../entities/message'

class MockMessageValidator extends AbstractMessageValidator {
  async validate(message: Message, core: Core) {
    if (message.raw === 'mock') {
      message.type = 'mock'
      return message
    }
    return super.validate(message, core)
  }
}

class MockMessageValidatorWithError extends AbstractMessageValidator {
  async validate(message: Message, core: Core) {
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
  messageValidator: new MockMessageValidator(),
})

it('should return a promise and resolve it if the massage is of known type', async () => {
  const msg = new Message({ raw: 'mock', metaData: [{ type: 'test' }] })
  const validator = new MockMessageValidator()
  const validated = await validator.validate(msg, core)
  expect(validated.type).toEqual('mock')
  expect(validated.isValid()).toEqual(true)
})

it('should return a promise and reject it if the massage is of unknown type', async () => {
  const msg = new Message({ raw: 'unknown', metaData: [{ type: 'test2' }] })
  const validator = new MockMessageValidator()
  await expect(validator.validate(msg, core)).rejects.toEqual(unsupportedMessageTypeError)
})

it('can throw an error', async () => {
  const msg = new Message({ raw: 'mock', metaData: [{ type: 'test3' }] })
  const validator = new MockMessageValidatorWithError()
  try {
    const validated = await validator.validate(msg, core)
  } catch (e) {
    expect(e !== unsupportedMessageTypeError).toEqual(true)
  }
})
