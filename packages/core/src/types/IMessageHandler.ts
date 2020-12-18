import { IPluginMethodMap, IAgentContext } from './IAgent'
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
   * Optional. If set to `true`, the message will be saved using {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}
   */
  save?: boolean
}

/**
 * Message handler interface
 * @public
 */
export interface IMessageHandler extends IPluginMethodMap {
  /**
   * Parses and optionally saves a message
   * @param context - Execution context. Requires agent with {@link @veramo/core#IDataStore} methods
   */
  handleMessage(args: IHandleMessageArgs, context: IAgentContext<IDataStore>): Promise<IMessage>
}
