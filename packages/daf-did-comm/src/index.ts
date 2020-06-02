import { IAgentPlugin, TMethodMap } from 'daf-core'
import { IAgentSendMessageDIDCommAlpha1, sendMessageDIDCommAlpha1 } from './action-handler'
export { DIDCommMessageHandler } from './message-handler'

export type IAgentDIDComm = IAgentSendMessageDIDCommAlpha1

export class DIDComm implements IAgentPlugin {
  readonly methods: TMethodMap = {
    sendMessageDIDCommAlpha1,
  }
}
