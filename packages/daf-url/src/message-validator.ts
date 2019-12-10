import { Core, AbstractMessageValidator, Message } from 'daf-core'
import parse = require('url-parse')

import Debug from 'debug'
const debug = Debug('daf:url:message-validator')

export class MessageValidator extends AbstractMessageValidator {
  async validate(message: Message, core: Core): Promise<Message> {
    const parsed = parse(message.raw, true)

    if (parsed && parsed.query && parsed.query.c_i) {
      debug('Detected standard URL')
      message.transform({
        raw: parsed.query.c_i,
        meta: {
          type: 'URL',
          id: parsed.origin + parsed.pathname,
        },
      })
    }

    return super.validate(message, core)
  }
}
