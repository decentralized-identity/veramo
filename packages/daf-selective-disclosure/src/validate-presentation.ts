import { VerifiablePresentation, IPluginMethodMap, IAgentContext } from 'daf-core'
import { ISelectiveDisclosureRequest, IPresentationValidationResult } from './types'

type IContext = IAgentContext<{}>

type TValidatePresentationAgainstSdr = (
  args: {
    presentation: VerifiablePresentation
    sdr: ISelectiveDisclosureRequest
  },
  context: IContext,
) => Promise<IPresentationValidationResult>

export interface IValidatePresentationAgainstSdr extends IPluginMethodMap {
  validatePresentationAgainstSdr: TValidatePresentationAgainstSdr
}

export const validatePresentationAgainstSdr: TValidatePresentationAgainstSdr = async args => {
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
        !credentialRequest.issuers.map(i => i.did).includes(credential.issuer.id)
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
