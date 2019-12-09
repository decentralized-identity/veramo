import { Core, AbstractMessageValidator, Message } from 'daf-core'

import Debug from 'debug'
const debug = Debug('message')

export class MessageValidator extends AbstractMessageValidator {
  async validate(message: Message, core: Core): Promise<Message> {
    debug('%o', message)
    return super.validate(message, core)
  }
}
