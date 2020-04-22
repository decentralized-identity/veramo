import { Agent, AbstractActionHandler, Action } from 'daf-core'
import { createJWT } from 'did-jwt'
import Debug from 'debug'

const debug = Debug('daf:selective-disclosure:action-handler')

export const ActionTypes = {
  signSdr: 'sign.sdr.jwt',
}

interface Issuer {
  did: string
  url: string
}

export interface SelectiveDisclosureRequest {
  issuer: string
  subject?: string
  replyUrl?: string
  tag?: string
  claims: CredentialRequestInput[]
  credentials?: string[]
}

export interface CredentialRequestInput {
  reason?: string
  essential?: boolean
  credentialType?: string
  credentialContext?: string
  claimType: string
  claimValue?: string
  issuers?: Issuer[]
}

export interface ActionSignSdr extends Action {
  data: SelectiveDisclosureRequest
}

export class SdrActionHandler extends AbstractActionHandler {
  public async handleAction(action: Action, agent: Agent) {
    if (action.type === ActionTypes.signSdr) {
      const { data } = action as ActionSignSdr
      try {
        const identity = await agent.identityManager.getIdentity(data.issuer)
        delete data.issuer
        debug('Signing SDR with', identity.did)

        const key = await identity.keyByType('Secp256k1')
        const jwt = await createJWT(
          {
            type: 'sdr',
            ...data,
          },
          {
            signer: key.signer(),
            alg: 'ES256K-R',
            issuer: identity.did,
          },
        )
        debug(jwt)
        return jwt
      } catch (error) {
        debug(error)
        return Promise.reject(error)
      }
    }

    return super.handleAction(action, agent)
  }
}
