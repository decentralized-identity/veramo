import { IAgentContext, IDidManager, IKeyManager } from 'daf-core'
import { AbstractMessageHandler, Message } from 'daf-message-handler'
import Debug from 'debug'
const debug = Debug('daf:did-comm:message-handler')

type IContext = IAgentContext<IDidManager & IKeyManager>

/**
 * A plugin for the {@link daf-message-handler#MessageHandler} that decrypts DIDComm messages
 * @beta
 */
export class DIDCommMessageHandler extends AbstractMessageHandler {
  constructor() {
    super()
  }

  async handle(message: Message, context: IContext): Promise<Message> {
    if (message.raw) {
      try {
        const parsed = JSON.parse(message.raw)
        if (parsed.ciphertext && parsed.protected) {
          const identifiers = await context.agent.ddidManagerFind()
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
              } catch (e) {
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
}
