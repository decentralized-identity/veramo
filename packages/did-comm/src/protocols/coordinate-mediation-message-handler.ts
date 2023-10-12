import { IAgentContext, IDIDManager, IKeyManager, IDataStore } from '@veramo/core-types'
import { AbstractMessageHandler, Message } from '@veramo/message-handler'
import Debug from 'debug'
import { v4 } from 'uuid'
import { IDIDComm } from '../types/IDIDComm.js'
import { IDIDCommMessage, DIDCommMessageMediaType } from '../types/message-types.js'

const debug = Debug('veramo:did-comm:coordinate-mediation-message-handler')

type IContext = IAgentContext<IDIDManager & IKeyManager & IDIDComm & IDataStore>

export enum UpdateAction {
  ADD = 'add',
  REMOVE = 'remove',
}

enum Result {
  SUCCESS = 'success',
  NO_CHANGE = 'no_change',
  CLIENT_ERROR = 'client_error',
  SERVER_ERROR = 'server_error',
}

export interface Update {
  recipient_did: string
  action: UpdateAction
}

interface UpdateResult extends Update {
  result: Result
}

interface Query {
  limit: number
  offset: number
}

interface MediateRequestMessage extends Message {
  to: string
  from: string
  type: CoordinateMediation.MEDIATE_REQUEST
}

interface RecipientUpdateMessage extends Message {
  to: string
  from: string
  type: CoordinateMediation.RECIPIENT_UPDATE
  body: { updates: Update[] }
  return_route: 'all'
}

interface RecipientQueryMessage extends Message {
  to: string
  from: string
  type: CoordinateMediation.RECIPIENT_QUERY
  body: { paginate?: Query }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export enum CoordinateMediation {
  MEDIATE_REQUEST = 'https://didcomm.org/coordinate-mediation/3.0/mediate-request',
  MEDIATE_GRANT = 'https://didcomm.org/coordinate-mediation/3.0/mediate-grant',
  MEDIATE_DENY = 'https://didcomm.org/coordinate-mediation/3.0/mediate-deny',
  RECIPIENT_UPDATE = 'https://didcomm.org/coordinate-mediation/3.0/recipient-update',
  RECIPIENT_UPDATE_RESPONSE = 'https://didcomm.org/coordinate-mediation/3.0/recipient-update-response',
  RECIPIENT_QUERY = 'https://didcomm.org/coordinate-mediation/3.0/recipient-query',
  RECIPIENT_QUERY_RESPONSE = 'https://didcomm.org/coordinate-mediation/3.0/recipient',
}
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
export const createMediateGrantMessage = (
  recipientDidUrl: string,
  mediatorDidUrl: string,
  thid: string,
): IDIDCommMessage => {
  return {
    type: CoordinateMediation.MEDIATE_GRANT,
    from: mediatorDidUrl,
    to: recipientDidUrl,
    id: v4(),
    thid: thid,
    created_time: new Date().toISOString(),
    body: { routing_did: [mediatorDidUrl] },
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const createMediateDenyMessage = (
  recipientDidUrl: string,
  mediatorDidUrl: string,
  thid: string,
): IDIDCommMessage => {
  return {
    type: CoordinateMediation.MEDIATE_DENY,
    from: mediatorDidUrl,
    to: recipientDidUrl,
    id: v4(),
    thid: thid,
    created_time: new Date().toISOString(),
    body: null,
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const createMediateRequestMessage = (
  recipientDidUrl: string,
  mediatorDidUrl: string,
): IDIDCommMessage => {
  return {
    type: CoordinateMediation.MEDIATE_REQUEST,
    from: recipientDidUrl,
    to: mediatorDidUrl,
    id: v4(),
    created_time: new Date().toISOString(),
    body: {},
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const createStatusRequestMessage = (
  recipientDidUrl: string,
  mediatorDidUrl: string,
): IDIDCommMessage => {
  return {
    id: v4(),
    type: STATUS_REQUEST_MESSAGE_TYPE,
    to: mediatorDidUrl,
    from: recipientDidUrl,
    return_route: 'all',
    body: {},
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const createRecipientUpdateMessage = (
  recipientDidUrl: string,
  mediatorDidUrl: string,
  updates: Update[],
): IDIDCommMessage => {
  return {
    type: CoordinateMediation.RECIPIENT_UPDATE,
    from: recipientDidUrl,
    to: mediatorDidUrl,
    id: v4(),
    created_time: new Date().toISOString(),
    body: { updates: updates },
    return_route: 'all',
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function createRecipientUpdateResponseMessage(
  recipientDidUrl: string,
  mediatorDidUrl: string,
  updates: UpdateResult[],
): IDIDCommMessage {
  return {
    type: CoordinateMediation.RECIPIENT_UPDATE_RESPONSE,
    from: recipientDidUrl,
    to: mediatorDidUrl,
    id: v4(),
    body: { updates: updates },
    created_time: new Date().toISOString(),
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const createRecipientQueryResponseMessage = (
  recipientDidUrl: string,
  mediatorDidUrl: string,
  dids: Record<'recipient_did', string>[],
): IDIDCommMessage => {
  return {
    type: CoordinateMediation.RECIPIENT_QUERY_RESPONSE,
    from: recipientDidUrl,
    to: mediatorDidUrl,
    id: v4(),
    body: { dids },
    created_time: new Date().toISOString(),
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const createDeliveryRequestMessage = (
  recipientDidUrl: string,
  mediatorDidUrl: string,
): IDIDCommMessage => {
  return {
    id: v4(),
    type: DELIVERY_REQUEST_MESSAGE_TYPE,
    to: mediatorDidUrl,
    from: recipientDidUrl,
    return_route: 'all',
    body: { limit: 2 },
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
const saveMessageForTracking = async (message: IDIDCommMessage, context: IContext) => {
  await context.agent.dataStoreSaveMessage({
    message: {
      type: message.type,
      from: message.from,
      to: message.to,
      id: message.id,
      threadId: message.thid,
      data: message.body,
      createdAt: message.created_time,
    },
  })
}

/**
 * Handler Type Guards
 */

const isMediateRequest = (message: Message): message is MediateRequestMessage => {
  if (message.type !== CoordinateMediation.MEDIATE_REQUEST) return false
  if (!message.from) throw new Error('invalid_argument: MediateRequest received without `from` set')
  if (!message.from) throw new Error('invalid_argument: MediateRequest received without `to` set')
  return true
}

const isRecipientUpdate = (message: Message): message is RecipientUpdateMessage => {
  if (message.type !== CoordinateMediation.RECIPIENT_UPDATE) return false
  if (!message.from) throw new Error('invalid_argument: RecipientUpdate received without `from` set')
  if (!message.to) throw new Error('invalid_argument: RecipientUpdate received without `to` set')
  if (!('body' in message)) throw new Error('invalid_argument: RecipientUpdate received without `body` set')
  if (!message.body || !message.body.updates)
    throw new Error('invalid_argument: RecipientUpdate received without `updates` set')
  return true
}

const isRecipientQuery = (message: Message): message is RecipientQueryMessage => {
  if (message.type !== CoordinateMediation.RECIPIENT_QUERY) return false
  if (!message.from) throw new Error('invalid_argument: RecipientQuery received without `from` set')
  if (!message.to) throw new Error('invalid_argument: RecipientQuery received without `to` set')
  return true
}

/**
 * A plugin for the {@link @veramo/message-handler#MessageHandler} that handles Mediator Coordinator messages for the mediator role.
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class CoordinateMediationMediatorMessageHandler extends AbstractMessageHandler {
  constructor() {
    super()
  }

  private async handleMediateRequest(message: MediateRequestMessage, context: IContext): Promise<Message> {
    const { to, from } = message
    debug('MediateRequest Message Received')
    // NOTE: Grant requests to all recipients until new system implemented
    // TODO: Come up with a method for approving and rejecting recipients
    // const response = createMediateDenyMessage(from, to, message.id)
    const response = createMediateGrantMessage(from, to, message.id)
    const mediation = { did: from, status: 'GRANTED' } as const
    await context.agent.dataStoreSaveMediation(mediation)

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
    await saveMessageForTracking(response, context)

    return message
  }

  /**
   * Used to notify the mediator of DIDs in use by the recipient
   **/
  private async handleRecipientUpdate(message: RecipientUpdateMessage, context: IContext): Promise<Message> {
    const {
      to,
      from,
      body: { updates = [] },
    } = message
    debug('MediateRecipientUpdate Message Received')

    const applyUpdate = async (did: string, update: Update) => {
      const filter = { did, recipient_did: update.recipient_did }
      try {
        if (update.action === UpdateAction.ADD) {
          await context.agent.dataStoreAddRecipientDid(filter)
          return { ...update, result: Result.SUCCESS }
        } else if (update.action === UpdateAction.REMOVE) {
          const result = await context.agent.dataStoreRemoveRecipientDid(filter)
          if (result) return { ...update, result: Result.SUCCESS }
        }
        return { ...update, result: Result.CLIENT_ERROR }
      } catch (ex) {
        debug(ex)
        return { ...update, result: Result.SERVER_ERROR }
      }
    }

    const updated = await Promise.all(updates.map(async (update) => await applyUpdate(from, update)))
    const response = createRecipientUpdateResponseMessage(from, to, updated)
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
    await saveMessageForTracking(response, context)
    return message
  }

  /**
   * Query mediator for a list of DIDs registered for this connection
   **/
  private async handleRecipientQuery(message: RecipientQueryMessage, context: IContext): Promise<Message> {
    const { to, from } = message
    debug('MediateRecipientQuery Message Received')
    if (!from) {
      throw new Error('invalid_argument: MediateRecipientQuery received without `from` set')
    }
    if (!to) {
      throw new Error('invalid_argument: MediateRecipientQuery received without `to` set')
    }
    const { paginate = {} } = message.body
    const dids = await context.agent.dataStoreListRecipientDids({ did: from, ...paginate })
    const response = createRecipientUpdateResponseMessage(from, to, dids)
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
    await saveMessageForTracking(response, context)
    return message
  }

  /**
   * Handles a Mediator Coordinator messages for the mediator role
   * https://didcomm.org/mediator-coordination/3.0/
   */
  public async handle(message: Message, context: IContext): Promise<Message> {
    try {
      if (isMediateRequest(message)) return this.handleMediateRequest(message, context)
      if (isRecipientUpdate(message)) return this.handleRecipientUpdate(message, context)
      if (isRecipientQuery(message)) return this.handleRecipientQuery(message, context)
      throw new Error('invalid_argument: Mediator Coordinator received invalid message type')
    } catch (ex) {
      debug(ex)
      return super.handle(message, context)
    }
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
    if (message.type === CoordinateMediation.MEDIATE_GRANT) {
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
    } else if (message.type === CoordinateMediation.MEDIATE_DENY) {
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
