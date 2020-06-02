import { AbstractMessageHandler, Message, IAgent, IAgentIdentityManager } from 'daf-core'
import Debug from 'debug'
const debug = Debug('daf:did-comm:message-handler')

interface IContext {
  agent: IAgent & IAgentIdentityManager
}

export class DIDCommMessageHandler extends AbstractMessageHandler {
  constructor() {
    super()
  }

  async handle(message: Message, context: IContext): Promise<Message> {
    try {
      const parsed = JSON.parse(message.raw)
      if (parsed.ciphertext && parsed.protected) {
        const identities = await context.agent.getIdentities()
        for (const identity of identities) {
          let decrypted
          try {
            const key = await identity.keyByType('Ed25519')
            decrypted = await key.decrypt(message.raw)
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

    return super.handle(message, context)
  }
}
