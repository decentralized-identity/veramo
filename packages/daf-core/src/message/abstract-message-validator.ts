import { Message } from './message'
import { Core } from '../core'

export interface MessageValidator {
  setNext(messageValidator: MessageValidator): MessageValidator
  validate: (message: Message, core: Core) => Promise<Message>
}

export const unsupportedMessageTypeError = 'Unsupported message type'

export abstract class AbstractMessageValidator implements MessageValidator {
  public nextMessageValidator?: MessageValidator

  public setNext(messageValidator: MessageValidator): MessageValidator {
    this.nextMessageValidator = messageValidator
    return messageValidator
  }

  public async validate(message: Message, core: Core): Promise<Message> {
    if (this.nextMessageValidator) {
      return this.nextMessageValidator.validate(message, core)
    }
    return Promise.reject(unsupportedMessageTypeError)
  }
}
