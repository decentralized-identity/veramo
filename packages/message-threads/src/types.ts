import { IAgentContext, IPluginMethodMap, IMessage } from '@veramo/core'

export enum IMessageThreadStatus {
  TRUSTED,
  PARTIALLY_TRUSTED,
  UNTRUSTED,
  PENDING
}

/**
 * Contains the parameters of a Message Thread Request
 */
export interface IMessageThreadsGetThreadsArgs {
  /**
   * Archived
   */
   archived?: boolean

  /**
   * Order
   */
   order?: string
}


export interface IMessageThreadsGetThreadByIdArgs {
  /**
   * Thread ID
   */
  threadId: string
}


export interface IMessageThreadsArchiveThreadByIdArgs {
  threadId: string
  archive: boolean
}

export interface IMessageThreadMemberProfile {
  name: string
  avatar: string
  did: string
  trusted: boolean
}

export interface IMessageThreadsThreadResult {
  threadId: string
  members: Array<IMessageThreadMemberProfile>
  viewer: string
  status: IMessageThreadStatus
  archived: boolean
  lastMessage: IMessage
  messageCount: number
}

/**
 * Describes the interface of DID discovery plugin
 */
export interface IMessageThreads extends IPluginMethodMap {
  getThreads(
    args: IMessageThreadsGetThreadsArgs,
    context: IAgentContext<any>,
  ): Promise<Array<IMessageThreadsThreadResult>>
}
