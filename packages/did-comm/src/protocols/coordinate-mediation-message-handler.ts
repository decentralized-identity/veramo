import {
  IAgentContext,
  IDIDManager,
  IKeyManager,
  IDataStore,
  MediationStatus,
  MediationPolicies,
} from '@veramo/core-types'
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

export enum RecipientUpdateResult {
  SUCCESS = 'success',
  NO_CHANGE = 'no_change',
  CLIENT_ERROR = 'client_error',
  SERVER_ERROR = 'server_error',
}

export interface Update {
  recipient_did: string
  action: UpdateAction
}

export interface UpdateResult extends Update {
  result: RecipientUpdateResult
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
export function createMediateGrantMessage(
  recipientDidUrl: string,
  mediatorDidUrl: string,
  thid: string,
): IDIDCommMessage {
  return {
    type: CoordinateMediation.MEDIATE_GRANT,
    from: mediatorDidUrl,
    to: recipientDidUrl,
    id: v4(),
    thid: thid,
    body: { routing_did: [mediatorDidUrl] },
    created_time: new Date().toISOString(),
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
export function createRecipientUpdateResponseMessage(
  recipientDidUrl: string,
  mediatorDidUrl: string,
  thid: string,
  updates: UpdateResult[],
): IDIDCommMessage {
  return {
    type: CoordinateMediation.RECIPIENT_UPDATE_RESPONSE,
    from: mediatorDidUrl,
    to: recipientDidUrl,
    id: v4(),
    thid: thid,
    body: { updates },
    created_time: new Date().toISOString(),
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const createRecipientQueryResponseMessage = (
  recipientDidUrl: string,
  mediatorDidUrl: string,
  thid: string,
  dids: Record<'recipient_did', string>[],
): IDIDCommMessage => {
  return {
    type: CoordinateMediation.RECIPIENT_QUERY_RESPONSE,
    from: mediatorDidUrl,
    to: recipientDidUrl,
    id: v4(),
    thid: thid,
    body: { dids },
    created_time: new Date().toISOString(),
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function createMediateRequestMessage(
  recipientDidUrl: string,
  mediatorDidUrl: string,
): IDIDCommMessage {
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
    body: { updates },
    return_route: 'all',
  }
}

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export const createRecipientQueryMessage = (
  recipientDidUrl: string,
  mediatorDidUrl: string,
): IDIDCommMessage => {
  return {
    type: CoordinateMediation.RECIPIENT_QUERY,
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
  if (!('data' in message)) throw new Error('invalid_argument: RecipientUpdate received without `body` set')
  if (!message.data || !message.data.updates) {
    throw new Error('invalid_argument: RecipientUpdate received without `updates` set')
  }
  return true
}

const isRecipientQuery = (message: Message): message is RecipientQueryMessage => {
  if (message.type !== CoordinateMediation.RECIPIENT_QUERY) return false
  if (!message.from) throw new Error('invalid_argument: RecipientQuery received without `from` set')
  if (!message.to) throw new Error('invalid_argument: RecipientQuery received without `to` set')
  return true
}

const grantOrDenyMediation = async (message: Message, context: IContext): Promise<MediationStatus> => {
  if (!message.from) return MediationStatus.DENIED

  if (await context.agent.isMediateDefaultGrantAll()) {
    const denyList: { did: string }[] = await context.agent.dataStoreGetMediationPolicies({
      policy: MediationPolicies.DENY,
    })
    if (denyList.some(({ did }) => did === message.from)) return MediationStatus.DENIED
    return MediationStatus.GRANTED
  } else {
    const allowList: { did: string }[] = await context.agent.dataStoreGetMediationPolicies({
      policy: MediationPolicies.ALLOW,
    })
    if (allowList.some(({ did }) => did === message.from)) return MediationStatus.GRANTED
    return MediationStatus.DENIED
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

  private async handleMediateRequest(message: MediateRequestMessage, context: IContext): Promise<Message> {
    try {
      debug('MediateRequest Message Received')
      const decision = await grantOrDenyMediation(message, context)
      console.log('DECISION', decision)
      await context.agent.dataStoreSaveMediation({ status: decision, did: message.from })
      const getResponse =
        decision === MediationStatus.GRANTED ? createMediateGrantMessage : createMediateDenyMessage
      const response = getResponse(message.from, message.to, message.id)
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
          to: response.to,
          id: response.id,
          threadId: response.thid,
          data: response.body,
          createdAt: response.created_time,
        },
      })
    } catch (error) {
      debug(error)
    }
    return message
  }

  /**
   * Used to notify the mediator of DIDs in use by the recipient
   **/
  private async handleRecipientUpdate(message: RecipientUpdateMessage, context: IContext): Promise<Message> {
    try {
      debug('MediateRecipientUpdate Message Received')
      const updates: Update[] = message.data.updates

      const applyUpdate = async (did: string, update: Update) => {
        const filter = { did, recipient_did: update.recipient_did }
        try {
          if (update.action === UpdateAction.ADD) {
            await context.agent.dataStoreAddRecipientDid(filter)
            return { ...update, result: RecipientUpdateResult.SUCCESS }
          }
          if (update.action === UpdateAction.REMOVE) {
            const result = await context.agent.dataStoreRemoveRecipientDid(filter)
            if (result) return { ...update, result: RecipientUpdateResult.SUCCESS }
            return { ...update, result: RecipientUpdateResult.NO_CHANGE }
          }
          return { ...update, result: RecipientUpdateResult.CLIENT_ERROR }
        } catch (ex) {
          debug(ex)
          return { ...update, result: RecipientUpdateResult.SERVER_ERROR }
        }
      }

      const updated = await Promise.all(updates.map(async (u) => await applyUpdate(message.from, u)))
      const response = createRecipientUpdateResponseMessage(message.from, message.to, message.id, updated)
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

      await context.agent.dataStoreSaveMessage({
        message: {
          type: response.type,
          from: response.from,
          to: response.to,
          id: response.id,
          threadId: response.thid,
          data: response.body,
          createdAt: response.created_time,
        },
      })
    } catch (error) {
      debug(error)
    }
    return message
  }

  /**
   * Query mediator for a list of DIDs registered for this connection
   **/
  private async handleRecipientQuery(message: RecipientQueryMessage, context: IContext): Promise<Message> {
    try {
      debug('MediateRecipientQuery Message Received')
      const { paginate = {} } = message.data
      const dids = await context.agent.dataStoreGetRecipientDids({ did: message.from, ...paginate })
      const response = createRecipientQueryResponseMessage(message.from, message.to, message.id, dids)
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
      await context.agent.dataStoreSaveMessage({
        message: {
          type: response.type,
          from: response.from,
          to: response.to,
          id: response.id,
          threadId: response.thid,
          data: response.body,
          createdAt: response.created_time,
        },
      })
    } catch (error) {
      debug(error)
    }
    return message
  }

  /**
   * Handles a Mediator Coordinator messages for the mediator role
   * https://didcomm.org/mediator-coordination/3.0/
   */
  public async handle(message: Message, context: IContext): Promise<Message> {
    if (isMediateRequest(message)) return this.handleMediateRequest(message, context)
    if (isRecipientUpdate(message)) return this.handleRecipientUpdate(message, context)
    if (isRecipientQuery(message)) return this.handleRecipientQuery(message, context)
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
