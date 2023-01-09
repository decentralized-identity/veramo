import { IAgentContext, IDIDManager, IKeyManager } from '@veramo/core'
import { AbstractMessageHandler, Message } from '@veramo/message-handler'
import Debug from 'debug'
import { v4 } from 'uuid'
import { IDIDComm } from '../types/IDIDComm'
import { IDIDCommMessage } from '../types/message-types'

const debug = Debug('veramo:did-comm:trust-ping-message-handler')

type IContext = IAgentContext<IDIDManager & IKeyManager & IDIDComm>

const MEDIATE_REQUEST_MESSAGE_TYPE = 'https://didcomm.org/coordinate-mediation/2.0/mediate-request'
const MEDIATE_GRANT_MESSAGE_TYPE = 'https://didcomm.org/coordinate-mediation/2.0/mediate-grant'
const MEDIATE_DENY_MESSAGE_TYPE = 'https://didcomm.org/coordinate-mediation/2.0/mediate-deny'

export function createMediateRequestMessage(
  recipientDidUrl: string,
  mediatorDidUrl: string,
): IDIDCommMessage {
  return {
    type: MEDIATE_REQUEST_MESSAGE_TYPE,
    from: recipientDidUrl,
    to: mediatorDidUrl,
    id: v4(),
	return_route: "all",
    body: {},
  }
}

export function createMediateGrantMessage(recipientDidUrl: string, mediatorDidUrl: string): IDIDCommMessage {
  return {
    type: MEDIATE_GRANT_MESSAGE_TYPE,
    from: mediatorDidUrl,
    to: recipientDidUrl,
    id: v4(),
    body: {
      routing_did: [mediatorDidUrl],
    },
  }
}

/**
 * A plugin for the {@link @veramo/message-handler#MessageHandler} that handles Mediator Coordinator messages for the mediator role.
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class CoordinateMediationMediatorMessageHandler extends AbstractMessageHandler {
  constructor() {
    super()
  }

  /**
   * Handles a Mediator Coordinator messages for the mediator role
   * https://didcomm.org/mediator-coordination/2.0/
   */
  public async handle(message: Message, context: IContext): Promise<Message> {
    if (message.type === MEDIATE_REQUEST_MESSAGE_TYPE) {
      debug('MediateRequest Message Received')
      try {
        const { from, to, returnRoute } = message
        if (!from) {
          throw new Error('invalid_argument: MediateRequest received without `from` set')
        }
        if (!to) {
          throw new Error('invalid_argument: MediateRequest received without `to` set')
        }
        if (returnRoute === 'all') {
          const response = createMediateGrantMessage(from, to)
          const packedResponse = await context.agent.packDIDCommMessage({
            message: response,
            packing: 'authcrypt',
          })
          message.addMetaData({ type: 'ReturnRouteResponse', value: packedResponse.message })
        }
      } catch (ex) {
        debug(ex)
      }
      return message
    }

    return super.handle(message, context)
  }
}
