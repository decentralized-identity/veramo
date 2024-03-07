import { IAgentContext, IDIDManager, IKeyManager } from '@veramo/core-types'
import { AbstractMessageHandler, Message } from '@veramo/message-handler'
import Debug from 'debug'
import { IDIDComm } from './types/IDIDComm.js'
import { asArray } from '@veramo/utils'
const debug = Debug('veramo:did-comm:message-handler')

type IContext = IAgentContext<IDIDManager & IKeyManager & IDIDComm>

/**
 * A plugin for the {@link @veramo/message-handler#MessageHandler} that decrypts DIDComm messages.
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class DIDCommMessageHandler extends AbstractMessageHandler {
  constructor() {
    super()
  }

  private async handleDIDCommAlpha(message: Message, context: IContext): Promise<Message> {
    if (message.raw) {
      try {
        const parsed = JSON.parse(message.raw)
        if (parsed.ciphertext && parsed.protected) {
          const identifiers = await context.agent.didManagerFind()
          for (const identifier of identifiers) {
            let decrypted
            try {
              const key = identifier.keys.find((k) => k.type === 'Ed25519')
              if (!key) throw Error('No encryption keys')
              decrypted = await context.agent.keyManagerDecryptJWE({ kid: key.kid, data: message.raw })
            } catch (e) {}
            if (decrypted) {
              debug('Decrypted for %s', identifier.did)
              debug('Message:', decrypted)

              try {
                const json = JSON.parse(decrypted)
                if (json['type'] === 'jwt') {
                  message.raw = json.body
                  message.addMetaData({ type: 'DIDComm' })
                } else {
                  if (json['id']) message.id = json['id']
                  if (json['type']) message.type = json['type']
                  message.raw = decrypted
                  message.data = json
                  message.addMetaData({ type: 'DIDComm' })
                }
                return super.handle(message, context)
              } catch (e: any) {
                debug(e.message)
              }

              message.raw = decrypted
              message.addMetaData({ type: 'DIDComm' })

              return super.handle(message, context)
            }
          }
        } else if (parsed.type === 'jwt') {
          message.raw = parsed.body
          if (parsed['id']) message.id = parsed['id']
          message.addMetaData({ type: 'DIDComm' })
          return super.handle(message, context)
        } else {
          message.data = parsed.body
          if (parsed['id']) message.id = parsed['id']
          if (parsed['type']) message.type = parsed['type']
          message.addMetaData({ type: 'DIDComm' })
          debug('JSON message with id and type', message)
          return super.handle(message, context)
        }
      } catch (e) {
        debug('Raw message is not a JSON string')
      }
    }

    return super.handle(message, context)
  }

  /**
   * Handles a new packed DIDCommV2 Message (also Alpha support but soon deprecated).
   * - Tests whether raw message is a DIDCommV2 message
   * - Unpacks raw message (JWM/JWE/JWS, or plain JSON).
   * -
   */
  async handle(message: Message, context: IContext): Promise<Message> {
    const rawMessage = message.raw
    if (rawMessage) {
      // check whether message is DIDCommV2
      let didCommMessageType = undefined
      try {
        didCommMessageType = await context.agent.getDIDCommMessageMediaType({ message: rawMessage })
      } catch (e) {
        debug(`Could not parse message as DIDComm v2: ${e}`)
      }
      if (didCommMessageType) {
        try {
          const unpackedMessage = await context.agent.unpackDIDCommMessage({
            message: rawMessage,
          })

          const {
            type,
            to,
            from,
            id,
            thid: threadId,
            created_time: createdAt,
            expires_time: expiresAt,
            body: data,
            attachments,
            return_route
          } = unpackedMessage.message

          message.type = type
          message.to = asArray(to)[0]
          message.from = from
          message.id = id
          message.threadId = threadId
          message.createdAt = createdAt
          message.expiresAt = expiresAt
          message.data = data
          message.attachments = attachments
          message.returnRoute = return_route

          message.addMetaData({ type: 'didCommMetaData', value: JSON.stringify(unpackedMessage.metaData) })
          context.agent.emit('DIDCommV2Message-received', unpackedMessage)

          // DIDCommMessageHandler should attempt to forward message to next handler, but
          // shouldn't throw an error if other handlers fail
          let superHandled
          try {
            superHandled = await super.handle(message, context)
          } catch (e) {
            debug(`Could not handle DIDCommV2Message in downstream handlers: ${e}`)
          }

          // if downstream message handlers failed, still treat original unpacked DIDCommV2Message as good
          return superHandled || message
        } catch (e) {
          debug(`Could not unpack message as DIDCommV2Message: ${e}`)
        }
      }
    }

    return this.handleDIDCommAlpha(message, context)
  }
}
