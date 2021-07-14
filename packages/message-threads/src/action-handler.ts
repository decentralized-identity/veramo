import { IAgentContext, IAgentPlugin } from '@veramo/core'

import {
  IMessageThreads,
  IMessageThreadsGetThreadsArgs,
  // IMessageThreadStatus,
  // IMessageThreadsArchiveThreadByIdArgs,
  // IMessageThreadMemberProfile,
  // IMessageThreadsGetThreadByIdArgs,
  IMessageThreadsThreadResult
} from './types'
import { schema } from './'
import Debug from 'debug'
const debug = Debug('veramo:did-discovery')

/**
 * This class adds support for discovering DIDs.
 */
export class MessageThreads implements IAgentPlugin {
  readonly methods: IMessageThreads
  readonly schema = schema.IMessageThreads

  constructor() {
    
    this.methods = {
      getThreads: this.getThreads.bind(this),
    }
  }

  /**
   * Queries data providers and returns DIDs with metadata
   *
   * @param args - The param object with the properties necessary to discover DID
   * @param context - *RESERVED* This is filled by the framework when the method is called.
   *
   */
  async getThreads(
    args: IMessageThreadsGetThreadsArgs,
    context: IAgentContext<any>,
  ): Promise<IMessageThreadsThreadResult[]> {
    
    const errors: Record<string, string> = {}

   /**
    * 
    * Code here to parse messages and return correct format
    * 
    **/
    
   // Dummy promise response
    const results = new Promise<IMessageThreadsThreadResult[]>((resolve, reject) => {
      return [{
        threadId: '2323',
        members: [{name: 'Jim', did: '0x13947f6383hf', avatar: '', trusted: true}],
        viewer: '0x2u4hb283br3ir3irb3',
        status: 0,
        archived: false,
        // @ts-ignore
        lastMessage: {},
        messageCount: 2
      }]
    });

    // if (errors) {
    //   result['errors'] = errors
    // }

    return results
  }
}


