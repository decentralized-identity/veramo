import {
  IAgentContext,
  IDIDManager,
  IKeyManager,
  IMessage,
  IMessageHandler,
  IPluginMethodMap,
  IResolver,
} from '@veramo/core'
import {
  IPackDIDCommMessageArgs,
  ISendDIDCommMessageArgs,
  ISendDIDCommMessageResult,
  ISendMessageDIDCommAlpha1Args,
  IUnpackDIDCommMessageArgs,
} from '../action-handler'
import { DIDCommMessageMediaType, IPackedDIDCommMessage, IUnpackedDIDCommMessage } from './message-types'

/**
 * DID Comm plugin interface for {@link @veramo/core#Agent}
 * @beta
 */
export interface IDIDComm extends IPluginMethodMap {
  /**
   * Partially decodes a possible DIDComm message string to determine the {@link DIDCommMessageMediaType}
   *
   * @param { message: string } - the message to be interpreted
   * @returns a {@link DIDCommMessageMediaType} or `null` if the message is not DIDComm
   *
   * @beta
   */
  getDIDCommMessageMediaType({ message }: { message: string }): Promise<DIDCommMessageMediaType | null>

  /**
   * Packs a {@link IDIDCommMessage} using one of the {@link DIDCommMessagePacking} options.
   *
   * @param args.message - {@link IDIDCommMessage} - the message to be packed
   * @param args.packing - {@link DIDCommMessagePacking} - the packing method
   * @param args.keyRef - Optional - string - either a {@link did-resolver#VerificationMethod} id or a
   *   {@link @veramo/core#IKey} `kid` to be used when signed or authenticated encryption is used.
   *
   * @param context - This method requires an agent that also has {@link @veramo/core#IDIDManager},
   *   {@link @veramo/core#IKeyManager} and {@link @veramo/core#IResolver} plugins in use.
   *
   * @returns Promise<{message: string}> - a Promise that resolves to an object containing the serialized packed message
   *
   * @beta
   */
  packDIDCommMessage(
    args: IPackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
  ): Promise<IPackedDIDCommMessage>

  /**
   * Unpacks a possible DIDComm message and returns the {@link IDIDCommMessage} and
   * {@link DIDCommMessagePacking} used to pack it.
   *
   * @param args.message - string - the message to be unpacked
   * @param context - This method requires an agent that also has {@link @veramo/core#IDIDManager},
   *   {@link @veramo/core#IKeyManager} and {@link @veramo/core#IResolver} plugins in use.
   * @returns Promise<IUnpackedDIDCommMessage> - a Promise that resolves to an object containing
   *   the {@link IDIDCommMessage} and {@link DIDCommMessagePacking} used.
   *
   * @beta
   */
  unpackDIDCommMessage(
    args: IUnpackDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>,
  ): Promise<IUnpackedDIDCommMessage>

  /**
   * TODO: add docs here
   *
   * @param args
   * @param context
   *
   * @returns
   *
   * @beta
   */
  sendDIDCommMessage(
    args: ISendDIDCommMessageArgs,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<ISendDIDCommMessageResult>

  /**
   *
   * @deprecated TBD
   *
   * This is used to create a message according to the initial {@link https://github.com/decentralized-identifier/DIDComm-js | DIDComm-js} implementation.
   *
   * @remarks Be advised that this spec is still not final and that this protocol may need to change.
   *
   * @param args - Arguments necessary for sending a DIDComm message
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @beta
   */
  sendMessageDIDCommAlpha1(
    args: ISendMessageDIDCommAlpha1Args,
    context: IAgentContext<IDIDManager & IKeyManager & IResolver & IMessageHandler>,
  ): Promise<IMessage>
}
