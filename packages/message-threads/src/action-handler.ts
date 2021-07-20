import { IAgentContext, IAgentPlugin, IDataStore, IDIDManager, IMessage } from '@veramo/core'
import { IDataStoreORM } from '@veramo/data-store'
import { Message } from '@veramo/message-handler'

import { IMessageThreads, IMessageThreadsGetThreadsArgs, IMessageThreadsThreadResult } from './types'
import { schema } from './'
import Debug from 'debug'
const debug = Debug('veramo:did-discovery')

/**
 * This class adds support for querying for message threads
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
   * gets messages and reformats the payload
   *
   * @param args - The param object with the properties necessary to query threads
   * @param context - *RESERVED* This is filled by the framework when the method is called.
   *
   */
  async getThreads(
    args: IMessageThreadsGetThreadsArgs,
    context: IAgentContext<IDataStore & IDataStoreORM & IDIDManager>,
  ): Promise<IMessageThreadsThreadResult[]> {
    const messages = await context.agent.dataStoreORMGetMessages({
      where: [{ column: 'type', value: ['veramo.io-chat-v1', 'veramo.io-chat-v2'] }],
      order: [{ column: 'createdAt', direction: 'DESC' }],
    })

    const _threads = messages.reduce((acc: any, x: any) => {
      const threads = acc.find((y: Message) => y.threadId === x.threadId) ? [] : [{ threadId: x.threadId }]
      return acc.concat(threads)
    }, [])

    const threads = _threads.map(async (thread: any) => {
      const owned = await context.agent.didManagerFind()
      const threadMessages = messages.filter((msg: IMessage) => msg.threadId == thread.threadId)
      const _allMembers = threadMessages
        .map((threadMsg: IMessage) => {
          return [threadMsg.from, threadMsg.to]
        })
        .reduce((acc, val) => acc.concat(val), [])

      const allMembers: any[] = [...new Set(_allMembers)]

      const allMemberProfiles = await Promise.all(
        allMembers.map(async (did) => {
          const vcs = await context.agent.dataStoreORMGetVerifiableCredentials({
            where: [
              {
                column: 'subject',
                value: [did],
              },
            ],
            order: [
              {
                column: 'issuanceDate',
                direction: 'DESC',
              },
            ],
          })

          const filtered = vcs.filter((vc) => {
            return vc.verifiableCredential.type.indexOf('Profile') > -1 && vc
          })

          if (filtered && filtered.length > 0) {
            return {
              did: did,
              name: filtered[0].verifiableCredential.credentialSubject.name,
              avatar: filtered[0].verifiableCredential.credentialSubject.avatar || '',
              trusted: true,
              vc: filtered[0].verifiableCredential,
            }
          } else {
            return {
              name: '',
              avatar: '',
              did: did,
              trusted: false,
              vc: null,
            }
          }
        }),
      )

      const viewer = owned.find((own) => {
        return allMembers.indexOf(own.did) > -1 && own
      })

      return {
        ...thread,
        members: allMemberProfiles,
        viewer: viewer && viewer.did,
        status: 'UNKNOWN',
        archived: false,
        lastMessage: threadMessages[0],
      }
    })

    return Promise.all(threads)
  }
}
