import { IAgentContext, IPluginMethodMap } from './IAgent'
import { IMessage, IMetaData } from './IMessage'
import { IDataStore } from './IDataStore'

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
   * {@link @veramo/core#IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}
   * <p/><p/>
   * @deprecated Please call {@link @veramo/core#IDataStore.dataStoreSaveMessage | dataStoreSaveMessage()} after
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
   * {@link @veramo/core#IDataStore.dataStoreSaveMessage | dataStoreSaveMessage()} to save it.
   *
   * @param args - The `raw` message to be handled along with optional `metadata` about the origin.
   * @param context - Execution context. Requires agent with {@link @veramo/core#IDataStore} methods
   */
  handleMessage(args: IHandleMessageArgs, context: IAgentContext<IDataStore>): Promise<IMessage>
}
