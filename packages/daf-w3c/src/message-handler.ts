import { IAgentContext, IResolver } from 'daf-core'
import { Message, AbstractMessageHandler } from 'daf-message-handler'
import { blake2bHex } from 'blakejs'

import {
  validateJwtCredentialPayload,
  validateJwtPresentationPayload,
  normalizePresentation,
  normalizeCredential,
} from 'did-jwt-vc'

import Debug from 'debug'
const debug = Debug('daf:w3c:message-handler')

/**
 * These types are used by the DAF data store when storing Verifiable Credentials and Presentations
 *
 * @internal
 */
export const MessageTypes = {
  /** Represents a Verifiable Credential */
  vc: 'w3c.vc',
  /** Represents a Verifiable Presentation */
  vp: 'w3c.vp',
}

/**
 * Represents the requirements that this plugin has.
 * The agent that is using this plugin is expected to provide these methods.
 *
 * This interface can be used for static type checks, to make sure your application is properly initialized.
 */
export type IContext = IAgentContext<IResolver>

/**
 * An implementation of the {@link daf-message-handler#AbstractMessageHandler}.
 *
 * This plugin can handle incoming W3C Verifiable Credentials and Presentations and prepare them
 * for internal storage as {@link daf-message-handler#Message} types.
 *
 * The current version can only handle `JWT` encoded
 *
 * @remarks {@link daf-core#IDataStore | IDataStore }
 *
 * @public
 */
export class W3cMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, context: IContext): Promise<Message> {
    const meta = message.getLastMetaData()

    if (meta?.type === 'JWT' && message.raw) {
      const { data } = message

      try {
        validateJwtPresentationPayload(data)

        //FIXME: flagging this for potential privacy leaks
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

        message.createdAt = presentation.issuanceDate
        message.presentations = [presentation]
        message.credentials = credentials

        return message
      } catch (e) {}

      try {
        validateJwtCredentialPayload(data)
        //FIXME: flagging this for potential privacy leaks
        debug('JWT is', MessageTypes.vc)
        const credential = normalizeCredential(message.raw)

        message.id = blake2bHex(message.raw)
        message.type = MessageTypes.vc
        message.from = credential.issuer.id
        message.to = credential.credentialSubject.id

        if (credential.tag) {
          message.threadId = credential.tag
        }

        message.createdAt = credential.issuanceDate
        message.credentials = [credential]
        return message
      } catch (e) {}
    }

    return super.handle(message, context)
  }
}
