import { IAgentContext, IMessageHandler } from '@veramo/core-types'
import { Message, AbstractMessageHandler } from '@veramo/message-handler'
import { v4 as uuidv4 } from 'uuid'

import Debug from 'debug'
import { asArray, computeEntryHash } from '@veramo/utils'

const debug = Debug('veramo:selective-disclosure:message-handler')

/**
 * Identifies a {@link @veramo/core-types#IMessage} that represents a Selective Disclosure Request
 *
 * @remarks See
 *   {@link https://github.com/uport-project/specs/blob/develop/messages/sharereq.md | uPort Selective Disclosure Request}
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const MessageTypes = {
  sdr: 'sdr',
}

/**
 * A Veramo message handler plugin that can decode an incoming Selective Disclosure Response
 * into the internal Message representation.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 *
 * @deprecated This plugin is deprecated as it implements a non-standard protocol created for the uPort project. It
 *   will be removed in a future release.
 */
export class SdrMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, context: IAgentContext<IMessageHandler>): Promise<Message> {
    const meta = message.getLastMetaData()

    if (message?.data?.type == MessageTypes.sdr && message?.data?.claims) {
      debug('Message type is', MessageTypes.sdr)

      message.id = computeEntryHash(message.raw || message.id || uuidv4())
      message.type = MessageTypes.sdr
      message.from = message.data.iss

      if (message.data.replyTo) {
        message.replyTo = asArray(message.data.replyTo)
      }

      if (message.data.replyUrl) {
        message.replyUrl = message.data.replyUrl
      }

      if (message.data.subject) {
        message.to = message.data.subject
      }

      if (message.data.tag) {
        message.threadId = message.data.tag
      }
      message.createdAt = this.timestampToDate(message.data.nbf || message.data.iat).toISOString()

      if (
        message.data.credentials &&
        Array.isArray(message.data.credentials) &&
        message.data.credentials.length > 0
      ) {
        debug('Verifying included credentials')
        // FIXME
        // message.credentials = []
        // for (const raw of message.data.credentials) {
        //   try {
        //     const tmpMessage = await context.agent.handleMessage({ raw, save: false })
        //     if (tmpMessage.credentials) {
        //       message.credentials = [...message.credentials, ...tmpMessage.credentials]
        //     }
        //   } catch (e) {
        //     // Unsupported message type, or some other error
        //     debug(e)
        //   }
        // }
      }
      return message
    }

    return super.handle(message, context)
  }

  private timestampToDate(timestamp: number): Date {
    const date = new Date(0)
    date.setUTCSeconds(timestamp)
    return date
  }
}
