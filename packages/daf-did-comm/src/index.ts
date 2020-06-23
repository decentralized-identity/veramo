import { IAgentPlugin, IPluginMethodMap } from 'daf-core'
import { sendMessageDIDCommAlpha1 } from './action-handler'
export { ISendMessageDIDCommAlpha1 } from './action-handler'
export { DIDCommMessageHandler } from './message-handler'

export class DIDComm implements IAgentPlugin {
  readonly methods: IPluginMethodMap = {
    sendMessageDIDCommAlpha1,
  }
}
