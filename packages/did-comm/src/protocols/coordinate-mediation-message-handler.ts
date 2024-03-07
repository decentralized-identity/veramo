import { IAgentContext, IDIDManager, IKeyManager, IDataStore } from '@veramo/core-types'
import { AbstractMessageHandler, Message } from '@veramo/message-handler'
import Debug from 'debug'
import { v4 } from 'uuid'
import { IDIDComm } from '../types/IDIDComm.js'
import { IDIDCommMessage, DIDCommMessageMediaType } from '../types/message-types.js'
import { asArray } from '@veramo/utils'

const debug = Debug('veramo:did-comm:coordinate-mediation-message-handler')

type IContext = IAgentContext<IDIDManager & IKeyManager & IDIDComm & IDataStore>

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const MEDIATE_REQUEST_MESSAGE_TYPE = 'https://didcomm.org/coordinate-mediation/2.0/mediate-request'

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const MEDIATE_GRANT_MESSAGE_TYPE = 'https://didcomm.org/coordinate-mediation/2.0/mediate-grant'

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const MEDIATE_DENY_MESSAGE_TYPE = 'https://didcomm.org/coordinate-mediation/2.0/mediate-deny'

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const STATUS_REQUEST_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/status-request'

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const DELIVERY_REQUEST_MESSAGE_TYPE = 'https://didcomm.org/messagepickup/3.0/delivery-request'

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function createMediateRequestMessage(
  recipientDidUrl: string,
  mediatorDidUrl: string,
): IDIDCommMessage {
  return {
    type: MEDIATE_REQUEST_MESSAGE_TYPE,
    from: recipientDidUrl,
    to: [mediatorDidUrl],
    id: v4(),
    return_route: 'all',
    created_time: (new Date()).toISOString(),
    body: {},
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function createMediateGrantMessage(
  recipientDidUrl: string,
  mediatorDidUrl: string,
  thid: string,
): IDIDCommMessage {
  return {
    type: MEDIATE_GRANT_MESSAGE_TYPE,
    from: mediatorDidUrl,
    to: [recipientDidUrl],
    id: v4(),
    thid: thid,
    created_time: (new Date()).toISOString(),
    body: {
      routing_did: [mediatorDidUrl],
    },
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function createStatusRequestMessage(
  recipientDidUrl: string,
  mediatorDidUrl: string,
): IDIDCommMessage {
  return {
    id: v4(),
    type: STATUS_REQUEST_MESSAGE_TYPE,
    to: [mediatorDidUrl],
    from: recipientDidUrl,
    return_route: 'all',
    body: {},
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function createDeliveryRequestMessage(
  recipientDidUrl: string,
  mediatorDidUrl: string,
): IDIDCommMessage {
  return {
    id: v4(),
    type: DELIVERY_REQUEST_MESSAGE_TYPE,
    to: [mediatorDidUrl],
    from: recipientDidUrl,
    return_route: 'all',
    body: { limit: 2 },
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
          // Grant requests to all recipients
          // TODO: Come up with another method for approving and rejecting recipients
          const response = createMediateGrantMessage(from, to, message.id)
          const packedResponse = await context.agent.packDIDCommMessage({
            message: response,
            packing: 'authcrypt',
          })
          const returnResponse = {
            id: response.id,
            message: packedResponse.message,
            contentType: DIDCommMessageMediaType.ENCRYPTED,
          }
          message.addMetaData({ type: 'ReturnRouteResponse', value: JSON.stringify(returnResponse) })

          // Save message to track recipients
          await context.agent.dataStoreSaveMessage({
            message: {
              type: response.type,
              from: response.from,
              to: asArray(response.to)[0],
              id: response.id,
              threadId: response.thid,
              data: response.body,
              createdAt: response.created_time
            },
          })
        }
      } catch (ex) {
        debug(ex)
      }
      return message
    }

    return super.handle(message, context)
  }
}

/**
 * A plugin for the {@link @veramo/message-handler#MessageHandler} that handles Mediator Coordinator messages for the recipient role.
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class CoordinateMediationRecipientMessageHandler extends AbstractMessageHandler {
  constructor() {
    super()
  }

  /**
   * Handles a Mediator Coordinator messages for the recipient role
   * https://didcomm.org/mediator-coordination/2.0/
   */
  public async handle(message: Message, context: IContext): Promise<Message> {
    if (message.type === MEDIATE_GRANT_MESSAGE_TYPE) {
      debug('MediateGrant Message Received')
      try {
        const { from, to, data, threadId } = message
        if (!from) {
          throw new Error('invalid_argument: MediateGrant received without `from` set')
        }
        if (!to) {
          throw new Error('invalid_argument: MediateGrant received without `to` set')
        }
        if (!threadId) {
          throw new Error('invalid_argument: MediateGrant received without `thid` set')
        }
        if (!data.routing_did || data.routing_did.length === 0) {
          throw new Error('invalid_argument: MediateGrant received with invalid routing_did')
        }
        // If mediate request was previously sent, add service to DID document
        const prevRequestMsg = await context.agent.dataStoreGetMessage({ id: threadId })
        if (prevRequestMsg.from === to && prevRequestMsg.to === from) {
          const service = {
            id: 'didcomm-mediator',
            type: 'DIDCommMessaging',
            serviceEndpoint: [
              {
                uri: data.routing_did[0],
              },
            ],
          }
          await context.agent.didManagerAddService({
            did: to,
            service: service,
          })
          message.addMetaData({ type: 'DIDCommMessagingServiceAdded', value: JSON.stringify(service) })
        }
      } catch (ex) {
        debug(ex)
      }
      return message
    } else if (message.type === MEDIATE_DENY_MESSAGE_TYPE) {
      debug('MediateDeny Message Received')
      try {
        const { from, to } = message
        if (!from) {
          throw new Error('invalid_argument: MediateGrant received without `from` set')
        }
        if (!to) {
          throw new Error('invalid_argument: MediateGrant received without `to` set')
        }

        // Delete service if it exists
        const did = await context.agent.didManagerGet({
          did: to,
        })
        const existingService = did.services.find(
          (s) =>
            s.serviceEndpoint === from ||
            (Array.isArray(s.serviceEndpoint) && s.serviceEndpoint.includes(from)),
        )
        if (existingService) {
          await context.agent.didManagerRemoveService({ did: to, id: existingService.id })
        }
      } catch (ex) {
        debug(ex)
      }
    }

    return super.handle(message, context)
  }
}
