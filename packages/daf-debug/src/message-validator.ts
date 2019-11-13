import { Core, AbstractMessageValidator, Types } from 'daf-core'

import Debug from 'debug'
const debug = Debug('message')

export class MessageValidator extends AbstractMessageValidator {
  async validate(
    rawMessage: Types.RawMessage,
    core: Core,
  ): Promise<Types.PreValidatedMessage | null> {
    debug('%o', rawMessage)
    return super.validate(rawMessage, core)
  }
}
