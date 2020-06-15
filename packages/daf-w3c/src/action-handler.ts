import { IAgentBase, IAgentResolve, IAgentIdentityManager, IAgentKeyManager, IAgentExtension, ICredential, IPresentation, IVerifiableCredential, IVerifiablePresentation, IAgentDataStore } from 'daf-core'
import {
  createVerifiableCredential,
  createPresentation as createVerifiablePresentation,
  PresentationPayload,
  VerifiableCredentialPayload,
  verifyCredential,
} from 'did-jwt-vc'
import { decodeJWT } from 'did-jwt'
import { Connection } from 'typeorm'

import { createCredential, createPresentation } from './message-handler'

import Debug from 'debug'
const debug = Debug('daf:w3c:action-handler')

export interface ISignPresentationJwtArgs {
  data: PresentationInput
  save?: boolean
}

export interface ISignCredentialJwtArgs {
  data: CredentialInput
  save?: boolean
}

type TContext = {
  agent: IAgentBase & IAgentIdentityManager & IAgentResolve & IAgentDataStore & IAgentKeyManager
  dbConnection: Promise<Connection>
}

type TSignPresentationJwt = (args: ISignPresentationJwtArgs, context: TContext) => Promise<IPresentation>
type TSignCredentialJwt = (args: ISignCredentialJwtArgs, context: TContext) => Promise<ICredential>

export interface IAgentSignPresentationJwt {
  signPresentationJwt?: IAgentExtension<TSignPresentationJwt>
}

export interface IAgentSignCredentialJwt {
  signCredentialJwt?: IAgentExtension<TSignCredentialJwt>
}

export const signPresentationJwt: TSignPresentationJwt = async (args, context) => {
  const { data, save } = args
  try {
    const payload = transformPresentationInput(data)
    const identity = await context.agent.identityManagerGetIdentity({ did: data.issuer })
    const key = identity.keys.find(k => k.type === 'Secp256k1')
    const signer = (data: string) => context.agent.keyManagerSignJWT({kid: key.kid, data})
    debug('Signing VP with', identity.did)
    // Removing duplicate JWT
    payload.vp.verifiableCredential = Array.from(new Set(payload.vp.verifiableCredential))
    const jwt = await createVerifiablePresentation(payload, { did: identity.did, signer })

    const credentials: IVerifiableCredential[] = []
    for (const credentialJwt of payload.vp.verifiableCredential) {
      const verified = await verifyCredential(credentialJwt, {
        resolve: (didUrl: string) => context.agent.resolveDid({ didUrl }),
      })
      credentials.push(createCredential(verified.payload, credentialJwt))
    }

    debug(jwt)
    const decoded = decodeJWT(jwt)
    const presentation = createPresentation(decoded.payload as PresentationPayload, jwt, credentials)
    if (save) {
      await context.agent.dataStoreSaveVerifiablePresentation(presentation)
    }
    return presentation
  } catch (error) {
    debug(error)
    return Promise.reject(error)
  }
}

export const signCredentialJwt: TSignCredentialJwt = async (args, context) => {
  const { data, save } = args
  try {
    const payload = transformCredentialInput(data)
    const identity = await context.agent.identityManagerGetIdentity({ did: data.issuer })
    const key = identity.keys.find(k => k.type === 'Secp256k1')
    const signer = (data: string) => context.agent.keyManagerSignJWT({kid: key.kid, data})

    debug('Signing VC with', identity.did)
    const jwt = await createVerifiableCredential(payload, { did: identity.did, signer })
    debug(jwt)
    const decoded = decodeJWT(jwt)
    const credential = createCredential(decoded.payload as VerifiableCredentialPayload, jwt)
    if (save) {
      await context.agent.dataStoreSaveVerifiableCredential(credential)
    }
    return credential
  } catch (error) {
    debug(error)
    return Promise.reject(error)
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
