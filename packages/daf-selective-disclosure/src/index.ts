import { IAgentPlugin, TMethodMap } from 'daf-core'
export { SdrMessageHandler, MessageTypes } from './message-handler'
export { IAgentCreateSelectiveDisclosureRequest, createSelectiveDisclosureRequest } from './create-sdr'
import { IAgentCreateSelectiveDisclosureRequest, createSelectiveDisclosureRequest } from './create-sdr'
export { IAgentGetVerifiableCredentialsForSdr, getVerifiableCredentialsForSdr } from './get-credentials'
import { IAgentGetVerifiableCredentialsForSdr, getVerifiableCredentialsForSdr } from './get-credentials'
export { IAgentValidatePresentationAgainstSdr, validatePresentationAgainstSdr } from './validate-presentation'
import { IAgentValidatePresentationAgainstSdr, validatePresentationAgainstSdr } from './validate-presentation'

export type IAgentSdr = IAgentCreateSelectiveDisclosureRequest &
  IAgentGetVerifiableCredentialsForSdr &
  IAgentValidatePresentationAgainstSdr

export class Sdr implements IAgentPlugin {
  readonly methods: TMethodMap = {
    createSelectiveDisclosureRequest,
    getVerifiableCredentialsForSdr,
    validatePresentationAgainstSdr,
  }
}
