import { Claim, Presentation, Identity } from 'daf-core'
import { SelectiveDisclosureRequest } from './action-handler'
import { In, Like, Connection } from 'typeorm'

export const findCredentialsForSdr = async (
  dbConnection: Promise<Connection>,
  sdr: SelectiveDisclosureRequest,
  did?: string,
) => {
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

    const claims = await (await dbConnection).getRepository(Claim).find({ where, relations: ['credential'] })
    const issuers =
      credentialRequest.issuers &&
      credentialRequest.issuers.map(iss => {
        const issuer = new Identity()
        issuer.did = iss.did
        return {
          url: iss.url,
          did: issuer,
        }
      })

    result.push({
      ...credentialRequest,
      issuers,
      credentials: claims.map(c => c.credential),
    })
  }
  return result
}

export const validatePresentationAgainstSdr = (
  presentation: Presentation,
  sdr: SelectiveDisclosureRequest,
) => {
  let valid = true
  let claims = []
  for (const credentialRequest of sdr.claims) {
    let credentials = presentation.credentials.filter(credential => {
      if (
        credentialRequest.claimType &&
        credentialRequest.claimValue &&
        !credential.claims.find(
          claim => claim.type === credentialRequest.claimType && claim.value === credentialRequest.claimValue,
        )
      ) {
        return false
      }

      if (
        credentialRequest.claimType &&
        !credentialRequest.claimValue &&
        !credential.claims.find(claim => claim.type === credentialRequest.claimType)
      ) {
        return false
      }

      if (
        credentialRequest.issuers &&
        !credentialRequest.issuers.map(i => i.did).includes(credential.issuer.did)
      ) {
        return false
      }
      if (
        credentialRequest.credentialContext &&
        !credential.context.includes(credentialRequest.credentialContext)
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
