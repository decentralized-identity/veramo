import { IAgentContext } from '@veramo/core-types'
import { Message, AbstractMessageHandler } from '@veramo/message-handler'
import fastUri from 'fast-uri'

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
      const parsed = fastUri.parse(message.raw)
      const c_i = new URLSearchParams(parsed.query).get('c_i')
      if (c_i) {
        debug('Detected standard URL')
        message.raw = c_i
        const { query, fragment, ...origin } = parsed
        message.addMetaData({ type: 'URL', value: fastUri.serialize(origin) })
      } else if (parsed.host) {
        try {
          const url = message.raw
          debug('Fetching URL', url)
          const response = await fetch(url)
          if (response?.url && response.url !== url) {
            debug('Detected redirect URL')
            const parsed2 = fastUri.parse(response.url)
            const redirectC_i = new URLSearchParams(parsed2.query).get('c_i')
            if (redirectC_i) {
              message.raw = redirectC_i
              const { query, fragment, ...origin2 } = parsed2
              message.addMetaData({ type: 'URL', value: fastUri.serialize(origin2) })
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
