import { Core, AbstractActionHandler, Action } from 'daf-core'
import {
  createVerifiableCredential,
  createPresentation,
  PresentationPayload,
  VerifiableCredentialPayload,
} from 'did-jwt-vc'

import Debug from 'debug'
const debug = Debug('daf:w3c:action-handler')

export const ActionTypes = {
  signVc: 'action.sign.w3c.vc',
  signVp: 'action.sign.w3c.vp',
}

export interface ActionSignW3cVp extends Action {
  did: string
  data: PresentationPayload
}

export interface ActionSignW3cVc extends Action {
  did: string
  data: VerifiableCredentialPayload
}

export class ActionHandler extends AbstractActionHandler {
  public async handleAction(action: Action, core: Core) {
    if (action.type === ActionTypes.signVp) {
      const { did, data } = action as ActionSignW3cVp
      try {
        const identity = await core.identityManager.getIdentity(did)
        const key = await identity.keyByType('Secp256k1')
        debug('Signing VP with', did)
        // Removing duplicate JWT
        data.vp.verifiableCredential = Array.from(new Set(data.vp.verifiableCredential))
        const jwt = await createPresentation(data, { did: identity.did, signer: key.signer() })
        return jwt
      } catch (error) {
        debug(error)
        return Promise.reject(error)
      }
    }

    if (action.type === ActionTypes.signVc) {
      const { did, data } = action as ActionSignW3cVc
      try {
        const identity = await core.identityManager.getIdentity(did)
        const key = await identity.keyByType('Secp256k1')
        debug('Signing VC with', did)
        const jwt = await createVerifiableCredential(data, { did: identity.did, signer: key.signer() })
        return jwt
      } catch (error) {
        debug(error)
        return Promise.reject(error)
      }
    }

    return super.handleAction(action, core)
  }
}
