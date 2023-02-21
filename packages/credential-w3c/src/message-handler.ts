import {
  IAgentContext,
  ICredentialVerifier,
  IResolver,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core-types'
import { AbstractMessageHandler, Message } from '@veramo/message-handler'
import { asArray, computeEntryHash, decodeCredentialToObject, extractIssuer } from '@veramo/utils'
import {
  normalizeCredential,
  normalizePresentation,
  validateJwtCredentialPayload,
  validateJwtPresentationPayload,
} from 'did-jwt-vc'
import { v4 as uuidv4 } from 'uuid'
import Debug from 'debug'

const debug = Debug('veramo:w3c:message-handler')

/**
 * These types are used by `@veramo/data-store` when storing Verifiable Credentials and Presentations
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
export type IContext = IAgentContext<IResolver & ICredentialVerifier>

/**
 * An implementation of the {@link @veramo/message-handler#AbstractMessageHandler}.
 *
 * This plugin can handle incoming W3C Verifiable Credentials and Presentations and prepare them
 * for internal storage as {@link @veramo/message-handler#Message} types.
 *
 * The current version can only handle `JWT` encoded
 *
 * @remarks {@link @veramo/core-types#IDataStore | IDataStore }
 *
 * @public
 */
export class W3cMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, context: IContext): Promise<Message> {
    const meta = message.getLastMetaData()

    // console.log(JSON.stringify(message, null,  2))

    //FIXME: messages should not be expected to be only JWT
    if (meta?.type === 'JWT' && message.raw) {
      const { data } = message

      try {
        validateJwtPresentationPayload(data)

        //FIXME: flagging this for potential privacy leaks
        debug('JWT is', MessageTypes.vp)
        const presentation = normalizePresentation(message.raw)
        const credentials = presentation.verifiableCredential

        message.id = computeEntryHash(message.raw)
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

        message.id = computeEntryHash(message.raw)
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

    // LDS Verification and Handling
    if (message.type === MessageTypes.vc && message.data) {
      // verify credential
      const credential = message.data as VerifiableCredential

      const result = await context.agent.verifyCredential({ credential })
      if (result.verified) {
        message.id = computeEntryHash(message.raw || message.id || uuidv4())
        message.type = MessageTypes.vc
        message.from = extractIssuer(credential)
        message.to = credential.credentialSubject.id

        if (credential.tag) {
          message.threadId = credential.tag
        }

        message.createdAt = credential.issuanceDate
        message.credentials = [credential]
        return message
      } else {
        throw new Error(result.error?.message)
      }
    }

    if (message.type === MessageTypes.vp && message.data) {
      // verify presentation
      const presentation = message.data as VerifiablePresentation

      // throws on error.
      const result = await context.agent.verifyPresentation({
        presentation,
        // FIXME: HARDCODED CHALLENGE VERIFICATION FOR NOW
        challenge: 'VERAMO',
        domain: 'VERAMO',
      })
      if (result.verified) {
        message.id = computeEntryHash(message.raw || message.id || uuidv4())
        message.type = MessageTypes.vp
        message.from = presentation.holder
        // message.to = presentation.verifier?.[0]

        if (presentation.tag) {
          message.threadId = presentation.tag
        }

        // message.createdAt = presentation.issuanceDate
        message.presentations = [presentation]
        message.credentials = asArray(presentation.verifiableCredential).map(decodeCredentialToObject)
        return message
      } else {
        throw new Error(result.error?.message)
      }
    }

    return super.handle(message, context)
  }
}
