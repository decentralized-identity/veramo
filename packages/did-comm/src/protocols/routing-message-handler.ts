import { IAgentContext, IDIDManager, IKeyManager, IDataStore, IDataStoreORM } from '@veramo/core-types'
import { AbstractMessageHandler, Message } from '@veramo/message-handler'
import Debug from 'debug'
import { v4 } from 'uuid'
import { IDIDComm } from '../types/IDIDComm.js'
import {
  MEDIATE_GRANT_MESSAGE_TYPE,
  MEDIATE_DENY_MESSAGE_TYPE,
} from './coordinate-mediation-message-handler.js'

const debug = Debug('veramo:did-comm:routing-message-handler')

type IContext = IAgentContext<IDIDManager & IKeyManager & IDIDComm & IDataStore & IDataStoreORM>

export const FORWARD_MESSAGE_TYPE = 'https://didcomm.org/routing/2.0/forward'
export const QUEUE_MESSAGE_TYPE = 'https://didcomm.org/routing/2.0/forward/queue-message'

/**
 * A plugin for the {@link @veramo/message-handler#MessageHandler} that handles forward messages for the Routing
 * protocol.
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class RoutingMessageHandler extends AbstractMessageHandler {
  constructor() {
    super()
  }

  /**
   * Handles forward messages for Routing protocol
   * https://didcomm.org/routing/2.0/
   */
  public async handle(message: Message, context: IContext): Promise<Message> {
    if (message.type === FORWARD_MESSAGE_TYPE) {
      debug('Forward Message Received')
      try {
        const { attachments, data } = message
        if (!attachments) {
          throw new Error('invalid_argument: Forward received without `attachments` set')
        }
        if (!data.next) {
          throw new Error('invalid_argument: Forward received without `body.next` set')
        }

        if (attachments.length > 0) {
          // Check if receiver has been granted mediation
          const mediationResponses = await context.agent.dataStoreORMGetMessages({
            where: [
              {
                column: 'type',
                value: [MEDIATE_GRANT_MESSAGE_TYPE, MEDIATE_DENY_MESSAGE_TYPE],
                op: 'In',
              },
              {
                column: 'to',
                value: [data.next],
                op: 'In',
              },
            ],
            order: [{ column: 'createdAt', direction: 'DESC' }],
          })

          // If last mediation response was a grant (not deny)
          if (mediationResponses.length > 0 && mediationResponses[0].type === MEDIATE_GRANT_MESSAGE_TYPE) {
            const recipients = attachments[0].data.json.recipients
            for (let i = 0; i < recipients.length; i++) {
              const recipient = recipients[i].header.kid

              // Save message for queue
              const messageToQueue = new Message({ raw: JSON.stringify(attachments[0].data.json) })
              messageToQueue.id = v4()
              messageToQueue.type = QUEUE_MESSAGE_TYPE
              messageToQueue.to = recipient
              messageToQueue.createdAt = new Date().toISOString()
              messageToQueue.addMetaData({ type: 'didCommForwardMsgId', value: message.id })

              await context.agent.dataStoreSaveMessage({ message: messageToQueue })
              context.agent.emit('DIDCommV2Message-forwardMessageQueued', messageToQueue)
            }
          } else {
            debug('Forward received for DID without granting mediation')
          }
        }
      } catch (ex) {
        debug(ex)
      }
      return message
    }

    return super.handle(message, context)
  }
}
