import { IAgentContext } from '@veramo/core-types'
import { Message, AbstractMessageHandler } from '@veramo/message-handler'
import parse from 'url-parse'

import Debug from 'debug'

const debug = Debug('veramo:url:message-handler')

/**
 * An implementation of {@link @veramo/message-handler#AbstractMessageHandler | AbstractMessageHandler} that can
 * extract a message from a URL.
 *
 * @public
 */
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
          if (response?.url && response.url !== url) {
            debug('Detected redirect URL')
            const parsed2 = parse(response.url, {}, true)
            if (parsed2 && parsed2.query && parsed2.query.c_i) {
              message.raw = parsed2.query.c_i
              message.addMetaData({ type: 'URL', value: parsed2.origin + parsed2.pathname })
            } else {
              message.raw = await response.text()
              message.addMetaData({ type: 'URL', value: url })
            }
          } else {
            message.raw = await response.text()
            message.addMetaData({ type: 'URL', value: url })
          }
        } catch (e: any) {
          console.log(e)
          debug(e.message)
        }
      }
    }
    return super.handle(message, context)
  }
}
