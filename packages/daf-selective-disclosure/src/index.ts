import { IAgentPlugin, IPluginMethodMap } from 'daf-core'
export { SdrMessageHandler, MessageTypes } from './message-handler'
export { ICreateSelectiveDisclosureRequest, createSelectiveDisclosureRequest } from './create-sdr'
import { ICreateSelectiveDisclosureRequest, createSelectiveDisclosureRequest } from './create-sdr'
export { IGetVerifiableCredentialsForSdr, getVerifiableCredentialsForSdr } from './get-credentials'
import { IGetVerifiableCredentialsForSdr, getVerifiableCredentialsForSdr } from './get-credentials'
export { IValidatePresentationAgainstSdr, validatePresentationAgainstSdr } from './validate-presentation'
import { IValidatePresentationAgainstSdr, validatePresentationAgainstSdr } from './validate-presentation'

export type ISdr = ICreateSelectiveDisclosureRequest &
  IGetVerifiableCredentialsForSdr &
  IValidatePresentationAgainstSdr

export class Sdr implements IAgentPlugin {
  readonly methods: ISdr = {
    createSelectiveDisclosureRequest,
    getVerifiableCredentialsForSdr,
    validatePresentationAgainstSdr,
  }
}
