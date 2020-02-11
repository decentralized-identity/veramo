import { Core, AbstractMessageValidator, Message } from 'daf-core'
import { DIDComm } from 'DIDComm-js'
import Debug from 'debug'
const debug = Debug('daf:did-comm:message-validator')

export class MessageValidator extends AbstractMessageValidator {
  private didcomm: DIDComm

  constructor() {
    super()
    this.didcomm = new DIDComm()
  }

  async validate(message: Message, core: Core): Promise<Message> {
    try {
      const parsed = JSON.parse(message.raw)
      if (parsed.ciphertext && parsed.protected) {
        const identities = await core.identityManager.getIdentities()
        for (const identity of identities) {
          let decrypted
          try {
            decrypted = await identity.decrypt(message.raw)
          } catch (e) {}
          if (decrypted) {
            debug('Decrypted for %s', identity.did)
            debug('Message:', decrypted)

            try {
              const json = JSON.parse(decrypted)
              if (json['@type'] === 'JWT') {
                message.transform({
                  raw: json.data,
                  meta: { type: 'DIDComm' },
                })
              } else {
                if (json['@id']) message.id = json['@id']
                if (json['@type']) message.type = json['@type']
                message.transform({
                  raw: decrypted,
                  data: json,
                  meta: { type: 'DIDComm' },
                })
              }
              return super.validate(message, core)
            } catch (e) {
              debug(e.message)
            }

            message.transform({
              raw: decrypted,
              meta: { type: 'DIDComm' },
            })

            return super.validate(message, core)
          }
        }
      }
    } catch (e) {
      // not a JSON string
    }

    return super.validate(message, core)
  }
}
