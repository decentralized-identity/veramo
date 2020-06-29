import {
  IAgentContext,
  IResolveDid,
  AbstractMessageHandler,
  Message,
  VerifiablePresentation,
  VerifiableCredential,
} from 'daf-core'
import { blake2bHex } from 'blakejs'

import {
  verifyCredential,
  validateJwtCredentialPayload,
  validateJwtPresentationPayload,
  normalizePresentation,
  normalizeCredential,
} from 'did-jwt-vc'

import Debug from 'debug'
const debug = Debug('daf:w3c:message-handler')

export const MessageTypes = {
  vc: 'w3c.vc',
  vp: 'w3c.vp',
}

export type IContext = IAgentContext<IResolveDid>

export class W3cMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, context: IContext): Promise<Message> {
    const meta = message.getLastMetaData()

    if (meta?.type === 'JWT' && message.raw) {
      const { data } = message

      try {
        validateJwtPresentationPayload(data)

        debug('JWT is', MessageTypes.vp)
        const presentation = normalizePresentation(message.raw)
        const credentials = presentation.verifiableCredential

        message.id = blake2bHex(message.raw)
        message.type = MessageTypes.vp
        message.from = presentation.holder
        message.to = presentation.verifier?.[0]

        if (presentation.tag) {
          message.threadId = presentation.tag
        }

        message.createdAt = presentation.createdAt
        message.presentations = [presentation]
        message.credentials = credentials

        return message
      } catch (e) {}

      try {
        validateJwtCredentialPayload(data)
        debug('JWT is', MessageTypes.vc)
        const credential = normalizeCredential(message.raw)

        message.id = blake2bHex(message.raw)
        message.type = MessageTypes.vc
        message.from = credential.issuer.id
        message.to = credential.credentialSubject.id

        if (credential.tag) {
          message.threadId = credential.tag
        }

        message.createdAt = credential.createdAt
        message.credentials = [credential]
        return message
      } catch (e) {}
    }

    return super.handle(message, context)
  }
}
