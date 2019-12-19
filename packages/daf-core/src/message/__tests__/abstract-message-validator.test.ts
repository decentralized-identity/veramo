import { AbstractMessageValidator, unsupportedMessageTypeError } from '../abstract-message-validator'
import { Core } from '../../core'
import { Message } from '../message'

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

it('should return a promise and resolve it if the massage is of known type', async () => {
  const msg = new Message({ raw: 'mock', meta: { type: 'test' } })
  const validator = new MockMessageValidator()
  const validated = await validator.validate(msg, null)
  expect(validated.type).toEqual('mock')
  expect(validated.isValid()).toEqual(true)
})

it('should return a promise and reject it if the massage is of unknown type', async () => {
  const msg = new Message({ raw: 'unknown', meta: { type: 'test2' } })
  const validator = new MockMessageValidator()
  await expect(validator.validate(msg, null)).rejects.toEqual(unsupportedMessageTypeError)
})

it('can throw an error', async () => {
  const msg = new Message({ raw: 'mock', meta: { type: 'test3' } })
  const validator = new MockMessageValidatorWithError()
  try {
    const validated = await validator.validate(msg, null)
  } catch (e) {
    expect(e !== unsupportedMessageTypeError).toEqual(true)
  }
})
