import { IAgentPlugin, TMethodMap } from 'daf-core'
import { sendMessageDIDCommAlpha1 } from './action-handler'
export { IAgentSendMessageDIDCommAlpha1 } from './action-handler'
export { DIDCommMessageHandler } from './message-handler'

export class DIDComm implements IAgentPlugin {
  readonly methods: TMethodMap = {
    sendMessageDIDCommAlpha1,
  }
}
