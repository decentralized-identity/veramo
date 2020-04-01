import { Claim } from 'daf-core'
import { SelectiveDisclosureRequest } from './action-handler'
import { In, Like } from 'typeorm'

export const findCredentialsForSdr = async (sdr: SelectiveDisclosureRequest, did?: string) => {
  const result = []
  for (const credentialRequest of sdr.claims) {
    const where = {}
    if (credentialRequest.claimType) {
      where['type'] = credentialRequest.claimType
    }

    if (credentialRequest.claimValue) {
      where['value'] = credentialRequest.claimValue
    }

    if (credentialRequest.issuers) {
      where['issuer'] = In(credentialRequest.issuers.map(i => i.did))
    }

    if (credentialRequest.credentialType) {
      where['credentialType'] = Like('%' + credentialRequest.credentialType + '%')
    }

    if (credentialRequest.credentialContext) {
      where['credentialContext'] = Like('%' + credentialRequest.credentialContext + '%')
    }

    if (did || sdr.subject) {
      where['subject'] = did || sdr.subject
    }

    const claims = await Claim.find({ where, relations: ['credential'] })
    result.push({
      ...credentialRequest,
      credentials: claims.map(c => c.credential),
    })
  }
  return result
}
