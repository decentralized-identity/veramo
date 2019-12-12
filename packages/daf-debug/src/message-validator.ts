import { Core, AbstractMessageValidator, Message } from 'daf-core'

import Debug from 'debug'
const debug = Debug('daf:debug:message-validator')

export class MessageValidator extends AbstractMessageValidator {
  async validate(message: Message, core: Core): Promise<Message> {
    debug('%o', message)
    return super.validate(message, core)
  }
}
