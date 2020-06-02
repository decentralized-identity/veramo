import { IAgentPlugin, TMethodMap } from 'daf-core'
export { SdrMessageHandler, MessageTypes } from './message-handler'
export { IAgentSignSdr, signSdr, SelectiveDisclosureRequest, CredentialRequestInput } from './action-handler'
export { findCredentialsForSdr } from './helper'
import { signSdr } from './action-handler'

export class Sdr implements IAgentPlugin {
  readonly methods: TMethodMap = {
    signSdr,
  }
}
