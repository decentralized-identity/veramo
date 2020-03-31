import { Agent, AbstractMessageHandler, Message } from 'daf-core'
import Debug from 'debug'
const debug = Debug('daf:did-comm:message-handler')

export class DIDCommMessageHandler extends AbstractMessageHandler {
  constructor() {
    super()
  }

  async handle(message: Message, agent: Agent): Promise<Message> {
    try {
      const parsed = JSON.parse(message.raw)
      if (parsed.ciphertext && parsed.protected) {
        const identities = await agent.identityManager.getIdentities()
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
              if (json['@type'] === 'JWT') {
                message.raw = json.data
                message.addMetaData({ type: 'DIDComm' })
              } else {
                if (json['@id']) message.id = json['@id']
                if (json['@type']) message.type = json['@type']
                message.raw = decrypted
                message.data = json
                message.addMetaData({ type: 'DIDComm' })
              }
              return super.handle(message, agent)
            } catch (e) {
              debug(e.message)
            }

            message.raw = decrypted
            message.addMetaData({ type: 'DIDComm' })

            return super.handle(message, agent)
          }
        }
      }
    } catch (e) {
      // not a JSON string
    }

    return super.handle(message, agent)
  }
}
