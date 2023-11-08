import {
  IAgentContext,
  IDIDManager,
  IKeyManager,
  IDataStore,
  IDataStoreORM,
  IMediationManager,
} from '@veramo/core-types'
import { AbstractMessageHandler, Message } from '@veramo/message-handler'
import Debug from 'debug'
import { v4 } from 'uuid'
import { IDIDComm } from '../types/IDIDComm.js'

const debug = Debug('veramo:did-comm:routing-message-handler')

type IContext = IAgentContext<
  IDIDManager & IKeyManager & IDIDComm & IDataStore & IDataStoreORM & IMediationManager
>

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
        const { attachments, data: { next: did = '' } = {} } = message
        if (!attachments) throw new Error('invalid_argument: Forward received without `attachments` set')
        if (!did) throw new Error('invalid_argument: Forward received without `body.next` set')

        if (attachments.length) {
          const isMediationGranted = await context.agent.mediationManagerIsMediationGranted({ did })

          if (isMediationGranted) {
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
