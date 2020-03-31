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

    if (meta?.type === 'JWT' && meta?.value === 'ES256K-R') {
      const { data } = message

      try {
        validatePresentationAttributes(data)

        debug('JWT is', MessageTypes.vp)
        const credentials: Credential[] = []
        for (const jwt of data.vp.verifiableCredential) {
          const verified = await verifyCredential(jwt, agent.didResolver)
          credentials.push(this.createCredential(verified.payload, jwt))
        }

        message.id = blake2bHex(message.raw)
        message.type = MessageTypes.vp

        message.from = new Identity()
        message.from.did = message.data.iss

        message.to = new Identity()
        message.to.did = message.data.aud

        if (message.data.tag) {
          message.threadId = message.data.tag
        }

        message.createdAt = this.timestampToDate(message.data.nbf || message.data.iat)
        message.presentations = [this.createPresentation(data, message.raw, credentials)]
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

        message.createdAt = this.timestampToDate(message.data.nbf || message.data.iat)
        message.credentials = [this.createCredential(message.data, message.raw)]
        return message
      } catch (e) {}
    }

    return super.handle(message, agent)
  }

  private createCredential(payload: VerifiableCredentialPayload, jwt: string): Credential {
    const vc = new Credential()

    vc.issuer = new Identity()
    vc.issuer.did = payload.iss

    vc.subject = new Identity()
    vc.subject.did = payload.sub

    vc.raw = jwt

    if (payload.nbf || payload.iat) {
      vc.issuanceDate = this.timestampToDate(payload.nbf || payload.iat)
    }

    if (payload.exp) {
      vc.expirationDate = this.timestampToDate(payload.exp)
    }

    vc.context = payload.vc['@context']
    vc.type = payload.vc.type

    vc.credentialSubject = payload.vc.credentialSubject

    return vc
  }

  private createPresentation(
    payload: PresentationPayload,
    jwt: string,
    credentials: Credential[],
  ): Presentation {
    const vp = new Presentation()

    vp.issuer = new Identity()
    vp.issuer.did = payload.iss

    vp.audience = new Identity()
    vp.audience.did = payload.aud

    vp.raw = jwt

    if (payload.nbf || payload.iat) {
      vp.issuanceDate = this.timestampToDate(payload.nbf || payload.iat)
    }

    if (payload.exp) {
      vp.expirationDate = this.timestampToDate(payload.exp)
    }

    vp.context = payload.vp['@context']
    vp.type = payload.vp.type

    vp.credentials = credentials

    return vp
  }

  private timestampToDate(timestamp: number): Date {
    const date = new Date(0)
    date.setUTCSeconds(timestamp)
    return date
  }
}
