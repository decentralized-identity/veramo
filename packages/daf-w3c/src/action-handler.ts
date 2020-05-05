import { Agent, AbstractActionHandler, Action, Credential, Presentation } from 'daf-core'
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
          await (await agent.dbConnection).getRepository(Presentation).save(presentation)
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
          await (await agent.dbConnection).getRepository(Credential).save(credential)
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
  id?: string
  issuer: string
  expirationDate?: string
  credentialSubject: CredentialSubjectInput
  credentialStatus?: {
    id: string
    type: string
  }
  [x: string]: any
}

export interface PresentationInput {
  '@context'?: string[]
  context?: string[]
  type: string[]
  id?: string
  issuer: string
  audience: string[]
  tag?: string
  expirationDate?: string
  verifiableCredential: string[]
  [x: string]: any
}

const transformCredentialInput = (input: CredentialInput): VerifiableCredentialPayload => {
  if (Array.isArray(input.credentialSubject)) throw Error('credentialSubject of type array not supported')

  const result = { vc: {} }

  for (const key in input) {
    switch (key) {
      case 'credentialSubject':
        result['sub'] = input[key].id
        const credentialSubject = { ...input.credentialSubject }
        delete credentialSubject.id
        result['vc']['credentialSubject'] = credentialSubject
        break
      case '@context':
      case 'context':
        result['vc']['@context'] = input[key]
        break
      case 'type':
        result['vc']['type'] = input[key]
        break
      case 'issuanceDate':
        result['nbf'] = Date.parse(input[key]) / 1000
        break
      case 'expirationDate':
        result['exp'] = Date.parse(input[key]) / 1000
        break
      case 'id':
        result['jti'] = input[key]
        break
      case 'issuer':
        // remove issuer
        break
      default:
        result[key] = input[key]
    }
  }

  return result as VerifiableCredentialPayload
}

const transformPresentationInput = (input: PresentationInput): PresentationPayload => {
  const result = { vp: {} }

  for (const key in input) {
    switch (key) {
      case '@context':
      case 'context':
        result['vp']['@context'] = input[key]
        break
      case 'type':
        result['vp']['type'] = input[key]
        break
      case 'issuanceDate':
        result['nbf'] = Date.parse(input[key]) / 1000
        break
      case 'expirationDate':
        result['exp'] = Date.parse(input[key]) / 1000
        break
      case 'id':
        result['jti'] = input[key]
        break
      case 'audience':
        result['aud'] = input[key]
        break
      case 'verifiableCredential':
        result['vp']['verifiableCredential'] = input[key]
        break
      case 'issuer':
        // remove issuer
        break
      default:
        result[key] = input[key]
    }
  }

  return result as PresentationPayload
}
