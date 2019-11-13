import { Core, AbstractActionHandler, Types } from 'daf-core'
import { createVerifiableCredential, createPresentation } from 'did-jwt-vc'
import {
  PresentationPayload,
  VerifiableCredentialPayload,
} from 'did-jwt-vc/src/types'

import Debug from 'debug'
const debug = Debug('w3c-action-handler')

export const ActionTypes = {
  signVc: 'action.sign.w3c.vc',
  signVp: 'action.sign.w3c.vp',
}

export interface ActionSignW3cVp extends Types.Action {
  did: string
  data: PresentationPayload
}

export interface ActionSignW3cVc extends Types.Action {
  did: string
  data: VerifiableCredentialPayload
}

export class ActionHandler extends AbstractActionHandler {
  public async handleAction(action: Types.Action, core: Core) {
    if (action.type === ActionTypes.signVp) {
      const { did, data } = action as ActionSignW3cVp
      try {
        const issuer = await core.identityManager.issuer(did)
        debug('Signing VP with', did)
        const jwt = await createPresentation(data, issuer)
        return jwt
      } catch (error) {
        debug(error)
        return Promise.reject(error)
      }
    }

    if (action.type === ActionTypes.signVc) {
      const { did, data } = action as ActionSignW3cVc
      try {
        const issuer = await core.identityManager.issuer(did)
        debug('Signing VC with', did)
        const jwt = await createVerifiableCredential(data, issuer)
        return jwt
      } catch (error) {
        debug(error)
        return Promise.reject(error)
      }
    }

    return super.handleAction(action, core)
  }
}
