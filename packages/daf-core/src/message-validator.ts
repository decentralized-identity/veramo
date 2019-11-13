import { RawMessage, ValidatedMessage, PreValidatedMessage } from './types'
import { Core } from './core'

export interface MessageValidator {
  setNext(messageValidator: MessageValidator): MessageValidator
  validate: (
    rawMessage: RawMessage,
    core: Core,
  ) => Promise<PreValidatedMessage | null>
}

export abstract class AbstractMessageValidator implements MessageValidator {
  public nextMessageValidator?: MessageValidator

  public setNext(messageValidator: MessageValidator): MessageValidator {
    this.nextMessageValidator = messageValidator
    return messageValidator
  }

  public async validate(
    rawMessage: RawMessage,
    core: Core,
  ): Promise<PreValidatedMessage | null> {
    if (this.nextMessageValidator) {
      return this.nextMessageValidator.validate(rawMessage, core)
    }
    return null
  }
}
