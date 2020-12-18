import { IAgentContext } from '@veramo/core'
import { Message, AbstractMessageHandler } from '@veramo/message-handler'
import parse = require('url-parse')

import Debug from 'debug'
const debug = Debug('veramo:url:message-handler')

export class UrlMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, context: IAgentContext<{}>): Promise<Message> {
    if (message.raw) {
      const parsed = parse(message.raw, {}, true)
      if (parsed && parsed.query && parsed.query.c_i) {
        debug('Detected standard URL')
        message.raw = parsed.query.c_i
        message.addMetaData({ type: 'URL', value: parsed.origin + parsed.pathname })
      } else if (parsed?.hostname) {
        try {
          const url = message.raw
          debug('Fetching URL', url)
          const response = await fetch(url)
          message.raw = await response.text()
          message.addMetaData({ type: 'URL', value: url })
        } catch (e) {
          console.log(e)
          debug(e.message)
        }
      }
    }
    return super.handle(message, context)
  }
}
