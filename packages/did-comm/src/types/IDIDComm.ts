import {
  IAgentContext,
  IDIDManager,
  IKeyManager,
  IMessage,
  IMessageHandler,
  IPluginMethodMap,
  IResolver,
  UsingResolutionOptions,
} from '@veramo/core-types'
import { ISendMessageDIDCommAlpha1Args } from '../didcomm.js'
import {
  DIDCommMessageMediaType,
  DIDCommMessagePacking,
  IDIDCommMessage,
  IDIDCommOptions,
  IPackedDIDCommMessage,
  IUnpackedDIDCommMessage,
} from './message-types.js'

/**
 * The input to the {@link IDIDComm.unpackDIDCommMessage} method.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type IUnpackDIDCommMessageArgs = IPackedDIDCommMessage & UsingResolutionOptions

/**
 * The input to the {@link IDIDComm.packDIDCommMessage} method.
 * When `packing` is `authcrypt` or `jws`, a `keyRef` MUST be provided.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IPackDIDCommMessageArgs extends UsingResolutionOptions {
  message: IDIDCommMessage
  packing: DIDCommMessagePacking
  keyRef?: string
  options?: IDIDCommOptions
}

/**
 * The input to the {@link IDIDComm.sendDIDCommMessage} method.
 * The provided `messageId` will be used in the emitted
 * event to allow event/message correlation.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface ISendDIDCommMessageArgs extends UsingResolutionOptions {
  packedMessage: IPackedDIDCommMessage
  messageId: string
  returnTransportId?: string
  recipientDidUrl: string
}

/**
 * The response from the {@link IDIDComm.sendDIDCommMessage} method.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 * `return_message` is only present if the `return_route: 'all'` was used
 * in the packedMessage.
 */
export interface ISendDIDCommMessageResponse {
  transportId: string
  returnMessage?: IMessage
}

/**
 * DID Comm plugin interface for {@link @veramo/core#Agent}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IDIDComm extends IPluginMethodMap {
  /**
   * Partially decodes a possible DIDComm message string to determine the {@link DIDCommMessageMediaType}
   *
   * @param args - the message to be interpreted
   * @returns - the {@link DIDCommMessageMediaType} if it was successfully parsed
   * @throws if the message cannot be parsed as DIDComm v2
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  getDIDCommMessageMediaType(args: IPackedDIDCommMessage): Promise<DIDCommMessageMediaType>

  /**
   * Packs a {@link IDIDCommMessage} using one of the {@link DIDCommMessagePacking} options.
   *
   * @param args - an {@link IPackDIDCommMessageArgs} object.
   *   * args.message - {@link IDIDCommMessage} - the message to be packed
   *   * args.packing - {@link DIDCommMessagePacking} - the packing method
   *   * args.keyRef - Optional - string - either an `id` of a {@link did-resolver#VerificationMethod}
   *     `kid` of a {@link @veramo/core-types#IKey} that will be used when `packing` is `jws` or `authcrypt`.
   *   * args.options - {@link IDIDCommOptions} - optional options
   *
   * @param context - This method requires an agent that also has {@link @veramo/core-types#IDIDManager},
   *   {@link @veramo/core-types#IKeyManager} and {@link @veramo/core-types#IResolver} plugins in use.
   *   When calling this method, the `context` is supplied automatically by the framework.
   *
   * @returns - a Promise that resolves to a {@link IPackedDIDCommMessage} object containing the serialized packed
   *   `message` string
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  packDIDCommMessage(
    args: IPackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
  ): Promise<IPackedDIDCommMessage>

  /**
   * Unpacks a possible DIDComm message and returns the {@link IDIDCommMessage} and
   * {@link DIDCommMessagePacking} used to pack it.
   *
   * @param args - an object containing the serialized message to be unpacked
   * @param context - This method requires an agent that also has {@link @veramo/core-types#IDIDManager},
   *   {@link @veramo/core-types#IKeyManager} and {@link @veramo/core-types#IResolver} plugins in use.
   *   When calling this method, the `context` is supplied automatically by the framework.
   *
   * @returns - a Promise that resolves to an object containing
   *   the {@link IDIDCommMessage} and {@link DIDCommMessagePacking} used.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  unpackDIDCommMessage(
    args: IUnpackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
  ): Promise<IUnpackedDIDCommMessage>

  /**
   * Sends the given message to the recipient. If a return-transport is provided
   * it will be checked whether the parent thread allows reusing the route. You cannot
   * reuse the transport if the message was forwarded from a DIDComm mediator.
   *
   * Emits an eventType 'DIDCommV2Message-sent' that contains the message id of
   * packed DIDComm message {@link IPackedDIDCommMessage} after the message was sent.
   *
   * @param args - An object containing the message, recipient information and optional
   * information about the transport that should be used.
   * @param context - This method requires an agent that also has {@link @veramo/core-types#IResolver},
   *   {@link @veramo/core-types#IKeyManager}, {@link @veramo/core-types#IDIDManager}, and
   *   {@link @veramo/core-types#IMessageHandler} plugins in use. When calling this method, the `context` is supplied
   *   automatically by the framework.
   *
   * @returns - a {@link ISendDIDCommMessageResponse} containing the transport id that was used to send the message and
   *   a return message, if one is available. It throws an error in case something went wrong.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  sendDIDCommMessage(
    args: ISendDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<ISendDIDCommMessageResponse>

  /**
   *
   * @deprecated Please use {@link IDIDComm.sendDIDCommMessage} instead. This will be removed in Veramo 4.0
   *
   * This is used to create a message according to the initial
   *   {@link https://github.com/decentralized-identifier/DIDComm-js | DIDComm-js} implementation.
   *
   * @remarks Be advised that this spec is still not final and that this protocol may need to change.
   *
   * @param args - Arguments necessary for sending a DIDComm message
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  sendMessageDIDCommAlpha1(
    args: ISendMessageDIDCommAlpha1Args,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IMessage>
}
