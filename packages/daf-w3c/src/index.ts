import { IAgentPlugin, TMethodMap } from 'daf-core'
export { W3cMessageHandler, MessageTypes } from './message-handler'
export {
  IAgentSignCredentialJwt,
  IAgentSignPresentationJwt,
  signCredentialJwt,
  signPresentationJwt,
} from './action-handler'
import {
  IAgentSignCredentialJwt,
  IAgentSignPresentationJwt,
  signCredentialJwt,
  signPresentationJwt,
} from './action-handler'

export type IAgentW3c = IAgentSignCredentialJwt & IAgentSignPresentationJwt

export class W3c implements IAgentPlugin {
  readonly methods: TMethodMap = {
    signCredentialJwt,
    signPresentationJwt,
  }
}
