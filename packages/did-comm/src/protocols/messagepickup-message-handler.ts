import { IAgentContext, IDIDManager, IKeyManager, IDataStore, IDataStoreORM } from '@veramo/core'
import { AbstractMessageHandler, Message } from '@veramo/message-handler'
import Debug from 'debug'
import { v4 } from 'uuid'
import { IDIDComm } from '../types/IDIDComm'
import { QUEUE_MESSAGE_TYPE } from './routing-message-handler'
import { IDIDCommMessage, DIDCommMessageMediaType } from '../types/message-types'

const debug = Debug('veramo:did-comm:messagepickup-message-handler')

type IContext = IAgentContext<IDIDManager & IKeyManager & IDIDComm & IDataStore & IDataStoreORM>

export const STATUS_REQUEST_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/status-request'
export const STATUS_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/status'
export const DELIVERY_REQUEST_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/delivery-request'
export const DELIVERY_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/delivery'
export const MESSAGES_RECEIVED_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/messages-received'

/**
 * A plugin for the {@link @veramo/message-handler#MessageHandler} that handles Pickup messages for the mediator role.
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class PickupMediatorMessageHandler extends AbstractMessageHandler {
  constructor() {
    super()
  }

  /**
   * Handles messages for Pickup protocol and mediator role
   * https://didcomm.org/pickup/3.0/
   */
  public async handle(message: Message, context: IContext): Promise<Message> {
    if (message.type === STATUS_REQUEST_MESSAGE_TYPE) {
      debug('Status Request Message Received')
      try {
        const { returnRoute, data, from, to } = message

        if (!to) {
          throw new Error('invalid_argument: StatusRequest received without `to` set')
        }
        if (!from) {
          throw new Error('invalid_argument: StatusRequest received without `from` set')
        }

        if (returnRoute === 'all') {
          const queuedMessageCount = await context.agent.dataStoreORMGetMessagesCount({
            where: [
              {
                column: 'type',
                value: [QUEUE_MESSAGE_TYPE],
                op: 'In',
              },
              data.recipient_key
                ? {
                    column: 'to',
                    value: [data.recipient_key],
                    op: 'In',
                  }
                : {
                    column: 'to',
                    value: [`${from}%`],
                    op: 'Like',
                  },
            ],
          })

          const replyRecipientKey = data.recipient_key ? { recipient_key: data.recipient_key } : {}
          const replyMessage: IDIDCommMessage = {
            type: STATUS_MESSAGE_TYPE,
            from: to,
            to: from,
            id: v4(),
            thid: message.threadId ?? message.id,
            created_time: new Date().toISOString(),
            body: {
              message_count: queuedMessageCount,
              live_delivery: false,
              ...replyRecipientKey,
            },
          }
          const packedResponse = await context.agent.packDIDCommMessage({
            message: replyMessage,
            packing: 'authcrypt',
          })
          const returnResponse = {
            id: replyMessage.id,
            message: packedResponse.message,
            contentType: DIDCommMessageMediaType.ENCRYPTED,
          }
          message.addMetaData({ type: 'ReturnRouteResponse', value: JSON.stringify(returnResponse) })
        } else {
          throw new Error('No return_route found for StatusRequest')
        }
      } catch (ex) {
        debug(ex)
      }
      return message
    }

    return super.handle(message, context)
  }
}
