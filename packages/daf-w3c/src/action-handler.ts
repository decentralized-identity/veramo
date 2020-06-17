import {
  IAgentBase,
  IAgentPlugin,
  IAgentResolve,
  IAgentIdentityManager,
  IAgentKeyManager,
  IAgentExtension,
  ICredential,
  IPresentation,
  IVerifiableCredential,
  IVerifiablePresentation,
  IAgentDataStore,
} from 'daf-core'
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

export interface IAgentW3c {
  createVerifiablePresentation?: (args: {
    presentation: IPresentation
    save?: boolean
    proofFormat: 'jwt'
  }) => Promise<IVerifiablePresentation>
  createVerifiableCredential?(args: {
    credential: ICredential
    save?: boolean
    proofFormat: 'jwt'
  }): Promise<IVerifiableCredential>
}
export interface IContext {
  agent: IAgentBase & IAgentIdentityManager & IAgentResolve & IAgentDataStore & IAgentKeyManager
}

export class W3c implements IAgentPlugin {
  readonly methods: Required<IAgentW3c>

  constructor() {
    this.methods = {
      createVerifiablePresentation: this.createVerifiablePresentation,
      createVerifiableCredential: this.createVerifiableCredential,
    }
  }

  async createVerifiablePresentation(
    args: {
      presentation: IPresentation
      save?: boolean
      proofFormat: 'jwt'
    },
    context?: IContext,
  ): Promise<IVerifiablePresentation> {
    try {
      const payload = transformPresentationInput(args.presentation)
      const identity = await context.agent.identityManagerGetIdentity({ did: args.presentation.issuer })
      const { kid } = identity.keys.find(k => k.type === 'Secp256k1')
      const signer = (data: string) => context.agent.keyManagerSignJWT({ kid, data })
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
      if (args.save) {
        await context.agent.dataStoreSaveVerifiablePresentation(presentation)
      }
      return presentation
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  async createVerifiableCredential(
    args: {
      credential: ICredential
      save?: boolean
      proofFormat: 'jwt'
    },
    context?: IContext,
  ): Promise<IVerifiableCredential> {
    try {
      const payload = transformCredentialInput(args.credential)
      const identity = await context.agent.identityManagerGetIdentity({ did: args.credential.issuer })
      const { kid } = identity.keys.find(k => k.type === 'Secp256k1')
      const signer = (data: string) => context.agent.keyManagerSignJWT({ kid, data })

      debug('Signing VC with', identity.did)
      const jwt = await createVerifiableCredential(payload, { did: identity.did, signer })
      debug(jwt)
      const decoded = decodeJWT(jwt)
      const credential = createCredential(decoded.payload as VerifiableCredentialPayload, jwt)
      if (args.save) {
        await context.agent.dataStoreSaveVerifiableCredential(credential)
      }

      return credential
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }
}

const transformCredentialInput = (input: ICredential): VerifiableCredentialPayload => {
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

const transformPresentationInput = (input: IPresentation): PresentationPayload => {
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
