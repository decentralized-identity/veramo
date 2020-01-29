import { Core, AbstractActionHandler, Types } from 'daf-core'
import { createJWT } from 'did-jwt'
import Debug from 'debug'

const debug = Debug('daf:selective-disclosure:action-handler')

export const ActionTypes = {
  signSdr: 'action.sign.sdr',
}

interface Iss {
  did: string
  url: string
}

export interface SDRInput {
  tag?: string
  sub?: string
  claims: CredentialRequestInput[]
}

export interface CredentialRequestInput {
  reason?: string
  essential?: boolean
  claimType: string
  iss?: Iss[]
}

export interface ActionSignSdr extends Types.Action {
  did: string
  data: {
    sub?: string
    tag?: string
    claims: any
  }
}

export class ActionHandler extends AbstractActionHandler {
  public async handleAction(action: Types.Action, core: Core) {
    if (action.type === ActionTypes.signSdr) {
      const { did, data } = action as ActionSignSdr
      try {
        const identity = await core.identityManager.getIdentity(did)
        debug('Signing SDR with', did)

        const jwt = await createJWT(
          {
            type: 'sdr',
            ...data,
          },
          {
            signer: identity.sign,
            alg: 'ES256K-R',
            issuer: identity.did,
          },
        )

        return jwt
      } catch (error) {
        debug(error)
        return Promise.reject(error)
      }
    }

    return super.handleAction(action, core)
  }
}
