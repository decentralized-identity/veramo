import { IAgentContext, IPluginMethodMap } from './IAgent.js'
import { IMessage, IMetaData } from './IMessage.js'
import { IDataStore } from './IDataStore.js'

/**
 * Input arguments for {@link IMessageHandler.handleMessage | handleMessage}
 * @public
 */
export interface IHandleMessageArgs {
  /**
   * Raw message data
   */
  raw: string

  /**
   * Optional. Message meta data
   */
  metaData?: IMetaData[]

  /**
   * Optional. If set to `true`, the message will be saved using
   * {@link @veramo/core-types#IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}
   * <p/><p/>
   * @deprecated Please call {@link @veramo/core-types#IDataStore.dataStoreSaveMessage | dataStoreSaveMessage()} after
   *   handling the message and determining that it must be saved.
   */
  save?: boolean
}

/**
 * Message handler plugin interface.
 * @public
 */
export interface IMessageHandler extends IPluginMethodMap {
  /**
   * Parses a raw message.
   *
   * After the message is parsed, you can decide if it should be saved, and pass the result to
   * {@link @veramo/core-types#IDataStore.dataStoreSaveMessage | dataStoreSaveMessage()} to save it.
   *
   * @param args - The `raw` message to be handled along with optional `metadata` about the origin.
   * @param context - Execution context. Requires agent with {@link @veramo/core-types#IDataStore} methods
   */
  handleMessage(args: IHandleMessageArgs, context: IAgentContext<IDataStore>): Promise<IMessage>
}
