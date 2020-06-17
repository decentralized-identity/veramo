import { IVerifiablePresentation, IContext, IAgentExtension } from 'daf-core'
import { ISelectiveDisclosureRequest, IPresentationValidationResult } from './types'

export interface IArgs {
  presentation: IVerifiablePresentation
  sdr: ISelectiveDisclosureRequest
}

export type TValidatePresentationAgainstSdr = (
  args: IArgs,
  context: IContext,
) => Promise<IPresentationValidationResult>

export interface IAgentValidatePresentationAgainstSdr {
  validatePresentationAgainstSdr?: IAgentExtension<TValidatePresentationAgainstSdr>
}

export const validatePresentationAgainstSdr: TValidatePresentationAgainstSdr = async (args, context) => {
  let valid = true
  let claims = []
  for (const credentialRequest of args.sdr.claims) {
    let credentials = args.presentation.verifiableCredential.filter(credential => {
      if (
        credentialRequest.claimType &&
        credentialRequest.claimValue &&
        credential.credentialSubject[credentialRequest.claimType] !== credentialRequest.claimValue
      ) {
        return false
      }

      if (
        credentialRequest.claimType &&
        !credentialRequest.claimValue &&
        credential.credentialSubject[credentialRequest.claimType] === undefined
      ) {
        return false
      }

      if (
        credentialRequest.issuers &&
        !credentialRequest.issuers.map(i => i.did).includes(credential.issuer)
      ) {
        return false
      }
      if (
        credentialRequest.credentialContext &&
        !credential['@context'].includes(credentialRequest.credentialContext)
      ) {
        return false
      }

      if (credentialRequest.credentialType && !credential.type.includes(credentialRequest.credentialType)) {
        return false
      }

      return true
    })

    if (credentialRequest.essential === true && credentials.length == 0) {
      valid = false
    }

    claims.push({
      ...credentialRequest,
      credentials,
    })
  }
  return { valid, claims }
}
