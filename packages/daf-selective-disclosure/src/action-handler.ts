import { Core, AbstractActionHandler, Types } from 'daf-core'
import { createJWT } from 'did-jwt'
import Debug from 'debug'

const debug = Debug('sdr-action-handler')

export const ActionTypes = {
  signSdr: 'action.sign.sdr',
}

export interface ActionSignSdr extends Types.Action {
  did: string
  data: {
    sub?: string
    claims: any
  }
}

export class ActionHandler extends AbstractActionHandler {
  public async handleAction(action: Types.Action, core: Core) {
    if (action.type === ActionTypes.signSdr) {
      const { did, data } = action as ActionSignSdr
      try {
        const issuer = await core.identityManager.issuer(did)
        debug('Signing SDR with', did)

        const jwt = await createJWT(
          {
            type: 'sdr',
            ...data,
          },
          {
            signer: issuer.signer,
            alg: 'ES256K-R',
            issuer: issuer.did,
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
