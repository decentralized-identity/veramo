import { AbstractMessageHandler, Message, IAgentContext, IIdentityManager, IKeyManager } from 'daf-core'
import Debug from 'debug'
const debug = Debug('daf:did-comm:message-handler')

type IContext = IAgentContext<IIdentityManager & IKeyManager>

export class DIDCommMessageHandler extends AbstractMessageHandler {
  constructor() {
    super()
  }

  async handle(message: Message, context: IContext): Promise<Message> {
    if (message.raw) {
      try {
        const parsed = JSON.parse(message.raw)
        if (parsed.ciphertext && parsed.protected) {
          const identities = await context.agent.identityManagerGetIdentities()
          for (const identity of identities) {
            let decrypted
            try {
              const key = identity.keys.find(k => k.type === 'Ed25519')
              if (!key) throw Error('No encryption keys')
              decrypted = await context.agent.keyManagerDecryptJWE({ kid: key.kid, data: message.raw })
            } catch (e) {}
            if (decrypted) {
              debug('Decrypted for %s', identity.did)
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
          return super.handle(message, context)
        }
      } catch (e) {
        // not a JSON string
      }
    }

    return super.handle(message, context)
  }
}
