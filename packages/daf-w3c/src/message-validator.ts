import { Core, AbstractMessageValidator, Message, Identity, Credential, Presentation } from 'daf-core'

import {
  verifyCredential,
  validateVerifiableCredentialAttributes,
  validatePresentationAttributes,
  VerifiableCredentialPayload,
  PresentationPayload,
} from 'did-jwt-vc'

import Debug from 'debug'
const debug = Debug('daf:w3c:message-validator')

export const MessageTypes = {
  vc: 'w3c.vc',
  vp: 'w3c.vp',
}

export class MessageValidator extends AbstractMessageValidator {
  async validate(message: Message, core: Core): Promise<Message> {
    const meta = message.getLastMetaData()

    if (meta?.type === 'JWT' && meta?.value === 'ES256K-R') {
      const { data } = message

      try {
        validatePresentationAttributes(data)

        debug('JWT is', MessageTypes.vp)
        const credentials: Credential[] = []
        for (const jwt of data.vp.verifiableCredential) {
          const verified = await verifyCredential(jwt, core.didResolver)
          credentials.push(this.createCredential(verified.payload, message, jwt))
        }

        message.type = MessageTypes.vp

        message.from = new Identity()
        message.from.did = message.data.iss

        const to = new Identity()
        to.did = message.data.aud
        message.to = [to]

        if (message.data.tag) {
          message.threadId = message.data.tag
        }

        message.createdAt = this.timestampToDate(message.data.nbf || message.data.iat)
        message.presentations = [this.createPresentation(data, message, message.raw, credentials)]
        message.credentials = credentials

        return message
      } catch (e) {}

      try {
        validateVerifiableCredentialAttributes(message.data)
        debug('JWT is', MessageTypes.vc)

        message.type = MessageTypes.vc
        message.from = new Identity()
        message.from.did = message.data.iss

        const to = new Identity()
        to.did = message.data.sub
        message.to = [to]

        if (message.data.tag) {
          message.threadId = message.data.tag
        }

        message.createdAt = this.timestampToDate(message.data.nbf || message.data.iat)
        message.credentials = [this.createCredential(message.data, message, message.raw)]
        return message
      } catch (e) {}
    }

    return super.validate(message, core)
  }

  private createCredential(payload: VerifiableCredentialPayload, message: Message, jwt: string): Credential {
    const vc = new Credential()

    vc.issuer = new Identity()
    vc.issuer.did = payload.iss

    vc.subject = new Identity()
    vc.subject.did = payload.sub

    vc.setRaw(jwt)
    vc.setCredentialSubject(payload.vc.credentialSubject)

    if (payload.iat) {
      vc.issuedAt = this.timestampToDate(payload.iat)
    }

    if (payload.nbf) {
      vc.notBefore = this.timestampToDate(payload.nbf)
    }

    if (payload.exp) {
      vc.expiresAt = this.timestampToDate(payload.exp)
    }

    vc.context = payload.vc['@context']
    vc.type = payload.vc.type
    vc.messages = [message]

    return vc
  }

  private createPresentation(
    payload: PresentationPayload,
    message: Message,
    jwt: string,
    credentials: Credential[],
  ): Presentation {
    const vp = new Presentation()

    vp.issuer = new Identity()
    vp.issuer.did = payload.iss

    vp.audience = new Identity()
    vp.audience.did = payload.aud

    vp.setRaw(jwt)

    if (payload.iat) {
      vp.issuedAt = this.timestampToDate(payload.iat)
    }

    if (payload.nbf) {
      vp.notBefore = this.timestampToDate(payload.nbf)
    }

    if (payload.exp) {
      vp.expiresAt = this.timestampToDate(payload.exp)
    }

    vp.context = payload.vp['@context']
    vp.type = payload.vp.type

    vp.credentials = credentials
    vp.messages = [message]

    return vp
  }

  private timestampToDate(timestamp: number): Date {
    const date = new Date(0)
    date.setUTCSeconds(timestamp)
    return date
  }
}
