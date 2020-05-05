import { Agent, AbstractMessageHandler, Message, Identity, Credential, Presentation } from 'daf-core'
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

export class W3cMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, agent: Agent): Promise<Message> {
    const meta = message.getLastMetaData()

    if (meta?.type === 'JWT') {
      const { data } = message

      try {
        validatePresentationAttributes(data)

        debug('JWT is', MessageTypes.vp)
        const credentials: Credential[] = []
        for (const jwt of data.vp.verifiableCredential) {
          const verified = await verifyCredential(jwt, agent.didResolver)
          credentials.push(createCredential(verified.payload, jwt))
        }

        message.id = blake2bHex(message.raw)
        message.type = MessageTypes.vp

        message.from = new Identity()
        message.from.did = message.data.iss

        message.to = new Identity()
        const audArray = Array.isArray(message.data.aud) ? (message.data.aud as string[]) : [message.data.aud]
        message.to.did = audArray[0]

        if (message.data.tag) {
          message.threadId = message.data.tag
        }

        message.createdAt = timestampToDate(message.data.nbf || message.data.iat)
        message.presentations = [createPresentation(data, message.raw, credentials)]
        message.credentials = credentials

        return message
      } catch (e) {}

      try {
        validateVerifiableCredentialAttributes(message.data)
        debug('JWT is', MessageTypes.vc)

        message.id = blake2bHex(message.raw)
        message.type = MessageTypes.vc

        message.from = new Identity()
        message.from.did = message.data.iss

        message.to = new Identity()
        message.to.did = message.data.sub

        if (message.data.tag) {
          message.threadId = message.data.tag
        }

        message.createdAt = timestampToDate(message.data.nbf || message.data.iat)
        message.credentials = [createCredential(message.data, message.raw)]
        return message
      } catch (e) {}
    }

    return super.handle(message, agent)
  }
}

export function createCredential(payload: VerifiableCredentialPayload, jwt: string): Credential {
  const vc = new Credential()

  vc.issuer = new Identity()
  vc.issuer.did = payload.iss

  if (payload.sub) {
    vc.subject = new Identity()
    vc.subject.did = payload.sub
  }

  vc.raw = jwt

  if (payload.jti) {
    vc.id = payload.jti
  }

  if (payload.nbf || payload.iat) {
    vc.issuanceDate = timestampToDate(payload.nbf || payload.iat)
  }

  if (payload.exp) {
    vc.expirationDate = timestampToDate(payload.exp)
  }

  vc.context = payload.vc['@context']
  vc.type = payload.vc.type

  vc.credentialSubject = payload.vc.credentialSubject

  return vc
}

export function createPresentation(
  payload: PresentationPayload,
  jwt: string,
  credentials: Credential[],
): Presentation {
  const vp = new Presentation()

  vp.issuer = new Identity()
  vp.issuer.did = payload.iss

  const audArray = Array.isArray(payload.aud) ? (payload.aud as string[]) : [payload.aud]

  vp.audience = audArray.map((did: string) => {
    const id = new Identity()
    id.did = did
    return id
  })

  vp.raw = jwt

  if (payload.jti) {
    vp.id = payload.jti
  }

  if (payload.nbf || payload.iat) {
    vp.issuanceDate = timestampToDate(payload.nbf || payload.iat)
  }

  if (payload.exp) {
    vp.expirationDate = timestampToDate(payload.exp)
  }

  vp.context = payload.vp['@context']
  vp.type = payload.vp.type

  vp.credentials = credentials

  return vp
}

function timestampToDate(timestamp: number): Date {
  const date = new Date(0)
  date.setUTCSeconds(timestamp)
  return date
}
