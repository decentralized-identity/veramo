import {
  IAgentBase,
  IAgentResolve,
  AbstractMessageHandler,
  Message,
  IIdentity,
  ICredential,
  IPresentation,
  IVerifiablePresentation,
  IVerifiableCredential,
} from 'daf-core'
import { blake2bHex } from 'blakejs'

import {
  verifyCredential,
  validateVerifiableCredentialAttributes,
  validatePresentationAttributes,
  VerifiableCredentialPayload,
  PresentationPayload,
} from 'did-jwt-vc'

import Debug from 'debug'
const debug = Debug('daf:w3c:message-handler')

export const MessageTypes = {
  vc: 'w3c.vc',
  vp: 'w3c.vp',
}

interface IContext {
  agent: Required<IAgentBase & IAgentResolve>
}

export class W3cMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, context: IContext): Promise<Message> {
    const meta = message.getLastMetaData()

    if (meta?.type === 'JWT' && message.raw) {
      const { data } = message

      try {
        validatePresentationAttributes(data)

        debug('JWT is', MessageTypes.vp)
        const credentials: IVerifiableCredential[] = []
        for (const jwt of data.vp.verifiableCredential) {
          const verified = await verifyCredential(jwt, {
            resolve: (didUrl: string) => context.agent.resolveDid({ didUrl }),
          })
          credentials.push(createCredential(verified.payload, jwt))
        }

        message.id = blake2bHex(message.raw)
        message.type = MessageTypes.vp

        message.from = message.data.iss

        const audArray = Array.isArray(message.data.aud) ? (message.data.aud as string[]) : [message.data.aud]
        message.to = audArray[0]

        if (message.data.tag) {
          message.threadId = message.data.tag
        }

        message.createdAt = timestampToDate(message.data.nbf || message.data.iat).toISOString()
        message.presentations = [createPresentation(data, message.raw, credentials)]
        message.credentials = credentials

        return message
      } catch (e) {}

      try {
        validateVerifiableCredentialAttributes(message.data)
        debug('JWT is', MessageTypes.vc)

        message.id = blake2bHex(message.raw)
        message.type = MessageTypes.vc

        message.from = message.data.iss

        message.to = message.data.sub

        if (message.data.tag) {
          message.threadId = message.data.tag
        }

        message.createdAt = timestampToDate(message.data.nbf || message.data.iat).toISOString()
        message.credentials = [createCredential(message.data, message.raw)]
        return message
      } catch (e) {}
    }

    return super.handle(message, context)
  }
}

export function createCredential(payload: VerifiableCredentialPayload, jwt: string): IVerifiableCredential {
  const vc: Partial<IVerifiableCredential> = {
    '@context': payload.vc['@context'],
    type: payload.vc.type,
    issuer: payload.iss,
    proof: {
      jwt,
    },
  }

  if (payload.sub) {
    vc.subject = payload.sub
  }

  if (payload.jti) {
    vc.id = payload.jti
  }

  if (payload.nbf || payload.iat) {
    vc.issuanceDate = timestampToDate(payload.nbf || payload.iat).toISOString()
  }

  if (payload.exp) {
    vc.expirationDate = timestampToDate(payload.exp).toISOString()
  }

  vc.credentialSubject = payload.vc.credentialSubject

  return vc as IVerifiableCredential
}

export function createPresentation(
  payload: PresentationPayload,
  jwt: string,
  credentials: IVerifiableCredential[],
): IVerifiablePresentation {
  if (!payload.aud) throw Error('Audience field required')

  const vp: Partial<IVerifiablePresentation> = {
    '@context': payload.vp['@context'],
    type: payload.vp.type,
    issuer: payload.iss,
    audience: Array.isArray(payload.aud) ? (payload.aud as string[]) : [payload.aud],
    proof: {
      jwt,
    },
  }

  if (payload.jti) {
    vp.id = payload.jti
  }

  if (payload.nbf || payload.iat) {
    vp.issuanceDate = timestampToDate(payload.nbf || payload.iat).toISOString()
  }

  if (payload.exp) {
    vp.expirationDate = timestampToDate(payload.exp).toISOString()
  }

  vp.verifiableCredential = credentials

  return vp as IVerifiablePresentation
}

function timestampToDate(timestamp: number): Date {
  const date = new Date(0)
  date.setUTCSeconds(timestamp)
  return date
}
