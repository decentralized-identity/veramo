import {
  IAgentContext,
  IDIDManager,
  IKeyManager,
  IDataStore,
  IDataStoreORM,
  IMessageHandler,
  Where,
  TMessageColumns,
} from '@veramo/core-types'
import { AbstractMessageHandler, Message } from '@veramo/message-handler'
import Debug from 'debug'
import { v4 } from 'uuid'
import { IDIDComm } from '../types/IDIDComm.js'
import { QUEUE_MESSAGE_TYPE } from './routing-message-handler.js'
import { IDIDCommMessage, DIDCommMessageMediaType, IDIDCommMessageAttachment } from '../types/message-types.js'
const debug = Debug('veramo:did-comm:messagepickup-message-handler')

type IContext = IAgentContext<
  IDIDManager & IKeyManager & IDIDComm & IDataStore & IDataStoreORM & IMessageHandler
>

export const STATUS_REQUEST_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/status-request'
export const STATUS_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/status'
export const DELIVERY_REQUEST_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/delivery-request'
export const DELIVERY_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/delivery'
export const MESSAGES_RECEIVED_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/messages-received'

function generateGetMessagesWhereQuery(from: string, recipientKey?: string): Where<TMessageColumns>[] {
  return [
    {
      column: 'type',
      value: [QUEUE_MESSAGE_TYPE],
      op: 'In',
    },
    recipientKey
      ? {
          column: 'to',
          value: [recipientKey],
          op: 'In',
        }
      : {
          column: 'to',
          value: [`${from}%`],
          op: 'Like',
        },
  ]
}

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
        await this.replyWithStatusMessage(message, context)
      } catch (ex) {
        debug(ex)
      }
      return message
    } else if (message.type === DELIVERY_REQUEST_MESSAGE_TYPE) {
      debug('Delivery Request Message Received')
      try {
        const { returnRoute, data, from, to } = message

        if (!to) {
          throw new Error('invalid_argument: DeliveryRequest received without `to` set')
        }
        if (!from) {
          throw new Error('invalid_argument: DeliveryRequest received without `from` set')
        }
        if (!data.limit || Number.isNaN(data.limit)) {
          throw new Error('invalid_argument: DeliveryRequest received without `body.limit` set')
        }

        if (returnRoute === 'all') {
          const queuedMessages = await context.agent.dataStoreORMGetMessages({
            where: generateGetMessagesWhereQuery(from, data.recipient_key),
            take: data.limit,
          })

          if (queuedMessages.length == 0) {
            await this.replyWithStatusMessage(message, context)
            return message
          }

          const attachments: IDIDCommMessageAttachment[] = queuedMessages.map((message) => {
            return {
              id: message.id,
              media_type: DIDCommMessageMediaType.ENCRYPTED,
              data: {
                json: JSON.parse(message.raw!),
              },
            }
          })
          const replyRecipientKey = data.recipient_key ? { recipient_key: data.recipient_key } : {}
          const replyMessage: IDIDCommMessage = {
            type: DELIVERY_MESSAGE_TYPE,
            from: to,
            to: [from],
            id: v4(),
            thid: message.threadId ?? message.id,
            created_time: new Date().toISOString(),
            body: {
              ...replyRecipientKey,
            },
            attachments,
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
          throw new Error('No return_route found for DeliveryRequest')
        }
      } catch (ex) {
        debug(ex)
      }
      return message
    } else if (message.type === MESSAGES_RECEIVED_MESSAGE_TYPE) {
      debug('MessagesReceived Message Received')
      try {
        const { data, from } = message

        if (!from) {
          throw new Error('invalid_argument: MessagesReceived received without `from` set')
        }
        if (!data.message_id_list || !Array.isArray(data.message_id_list)) {
          throw new Error('invalid_argument: MessagesReceived received without `body.message_id_list` set')
        }

        await Promise.all(
          data.message_id_list.map(async (messageId: string) => {
            const message = await context.agent.dataStoreGetMessage({ id: messageId })

            // Delete message if meant for recipient
            if (message.to?.startsWith(`${from}#`)) {
              await context.agent.dataStoreDeleteMessage({ id: messageId })
              context.agent.emit('DIDCommV2Message-forwardMessageDequeued', messageId)
            }
          }),
        )

        await this.replyWithStatusMessage(message, context)
      } catch (ex) {
        debug(ex)
      }
    }

    return super.handle(message, context)
  }

  private async replyWithStatusMessage(message: Message, context: IContext) {
    const { returnRoute, data, from, to } = message

    if (!to) {
      throw new Error('invalid_argument: StatusRequest received without `to` set')
    }
    if (!from) {
      throw new Error('invalid_argument: StatusRequest received without `from` set')
    }

    if (returnRoute === 'all') {
      const queuedMessageCount = await context.agent.dataStoreORMGetMessagesCount({
        where: generateGetMessagesWhereQuery(from, data.recipient_key),
      })

      const replyRecipientKey = data.recipient_key ? { recipient_key: data.recipient_key } : {}
      const replyMessage: IDIDCommMessage = {
        type: STATUS_MESSAGE_TYPE,
        from: to,
        to: [from],
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
  }
}

/**
 * A plugin for the {@link @veramo/message-handler#MessageHandler} that handles Pickup messages for the mediator role.
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class PickupRecipientMessageHandler extends AbstractMessageHandler {
  constructor() {
    super()
  }

  /**
   * Handles messages for Pickup protocol and recipient role
   * https://didcomm.org/pickup/3.0/
   */
  public async handle(message: Message, context: IContext): Promise<Message> {
    if (message.type === DELIVERY_MESSAGE_TYPE) {
      debug('Message Delivery batch Received')
      try {
        const { attachments, to, from } = message

        if (!to) {
          throw new Error('invalid_argument: StatusRequest received without `to` set')
        }
        if (!from) {
          throw new Error('invalid_argument: StatusRequest received without `from` set')
        }

        if (!attachments) {
          throw new Error('invalid_argument: MessagesDelivery received without `attachments` set')
        }

        // 1. Handle batch of messages
        const messageIds = await Promise.all(
          attachments.map(async (attachment) => {
            await context.agent.handleMessage({
              raw: JSON.stringify(attachment.data.json),
              metaData: [{ type: 'didCommMsgFromMediator', value: attachment.id }],
            })
            return attachment.id
          }),
        )

        // 2. Reply with messages-received
        const replyMessage: IDIDCommMessage = {
          type: MESSAGES_RECEIVED_MESSAGE_TYPE,
          from: to,
          to: [from],
          id: v4(),
          thid: message.threadId ?? message.id,
          created_time: new Date().toISOString(),
          return_route: 'all',
          body: {
            message_id_list: messageIds,
          },
        }
        const packedResponse = await context.agent.packDIDCommMessage({
          message: replyMessage,
          packing: 'authcrypt',
        })
        await context.agent.sendDIDCommMessage({
          packedMessage: packedResponse,
          messageId: replyMessage.id,
          recipientDidUrl: from,
        })
      } catch (ex) {
        debug(ex)
      }
      return message
    }

    return super.handle(message, context)
  }
}
