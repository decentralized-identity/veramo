import { Agent, AbstractActionHandler, Action, Credential } from 'daf-core'
import {
  createVerifiableCredential,
  createPresentation as createVerifiablePresentation,
  PresentationPayload,
  VerifiableCredentialPayload,
  verifyCredential,
} from 'did-jwt-vc'
import { decodeJWT } from 'did-jwt'

import { createCredential, createPresentation } from './message-handler'

import Debug from 'debug'
const debug = Debug('daf:w3c:action-handler')

export const ActionTypes = {
  signCredentialJwt: 'sign.w3c.vc.jwt',
  signPresentationJwt: 'sign.w3c.vp.jwt',
}

export interface ActionSignW3cVp extends Action {
  data: PresentationInput
  save?: boolean
}

export interface ActionSignW3cVc extends Action {
  data: CredentialInput
  save?: boolean
}

export class W3cActionHandler extends AbstractActionHandler {
  public async handleAction(action: Action, agent: Agent) {
    if (action.type === ActionTypes.signPresentationJwt) {
      const { data, save } = action as ActionSignW3cVp
      try {
        const payload = transformPresentationInput(data)
        const identity = await agent.identityManager.getIdentity(data.issuer)
        const key = await identity.keyByType('Secp256k1')
        debug('Signing VP with', identity.did)
        // Removing duplicate JWT
        payload.vp.verifiableCredential = Array.from(new Set(payload.vp.verifiableCredential))
        const jwt = await createVerifiablePresentation(payload, { did: identity.did, signer: key.signer() })

        const credentials: Credential[] = []
        for (const credentialJwt of payload.vp.verifiableCredential) {
          const verified = await verifyCredential(credentialJwt, agent.didResolver)
          credentials.push(createCredential(verified.payload, credentialJwt))
        }

        debug(jwt)
        const decoded = decodeJWT(jwt)
        const presentation = createPresentation(decoded.payload as PresentationPayload, jwt, credentials)
        if (save) {
          await presentation.save()
        }
        return presentation
      } catch (error) {
        debug(error)
        return Promise.reject(error)
      }
    }

    if (action.type === ActionTypes.signCredentialJwt) {
      const { data, save } = action as ActionSignW3cVc
      try {
        const payload = transformCredentialInput(data)
        const identity = await agent.identityManager.getIdentity(data.issuer)
        const key = await identity.keyByType('Secp256k1')
        debug('Signing VC with', identity.did)
        const jwt = await createVerifiableCredential(payload, { did: identity.did, signer: key.signer() })
        debug(jwt)
        const decoded = decodeJWT(jwt)
        const credential = createCredential(decoded.payload as VerifiableCredentialPayload, jwt)
        if (save) {
          await credential.save()
        }
        return credential
      } catch (error) {
        debug(error)
        return Promise.reject(error)
      }
    }

    return super.handleAction(action, agent)
  }
}

export interface CredentialSubjectInput {
  id: string
  [x: string]: any
}
export interface CredentialInput {
  '@context'?: string[]
  context?: string[]
  type: string[]
  issuer: string
  expirationDate?: string
  credentialSubject: CredentialSubjectInput
}

export interface PresentationInput {
  '@context'?: string[]
  context?: string[]
  type: string[]
  issuer: string
  audience: string
  tag?: string
  expirationDate?: string
  verifiableCredential: string[]
}

const transformCredentialInput = (input: CredentialInput): VerifiableCredentialPayload => {
  // TODO validate input
  const credentialSubject = { ...input.credentialSubject }
  delete credentialSubject.id
  const result: VerifiableCredentialPayload = {
    sub: input.credentialSubject.id,
    // exp: input.expirationDate,
    vc: {
      '@context': input['@context'] || input['context'],
      type: input.type,
      credentialSubject,
    },
  }

  return result
}

const transformPresentationInput = (input: PresentationInput): PresentationPayload => {
  // TODO validate input
  const result: PresentationPayload = {
    aud: input.audience,
    // exp: input.expirationDate,
    vp: {
      '@context': input['@context'] || input['context'],
      type: input.type,
      verifiableCredential: input.verifiableCredential,
    },
  }

  return result
}
