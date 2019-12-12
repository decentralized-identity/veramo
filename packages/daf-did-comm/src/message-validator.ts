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
    if (core.encryptionKeyManager) {
      try {
        const parsed = JSON.parse(message.raw)
        if (parsed.ciphertext && parsed.protected) {
          const keyPairs = await core.encryptionKeyManager.listKeyPairs()
          for (const keyPair of keyPairs) {
            const unpacked = await this.didcomm.unpackMessage(message.raw, keyPair)
            if (unpacked.message) {
              debug('Unpacked for publicKey %s', keyPair.publicKeyHex)
              debug(unpacked.message)

              try {
                const json = JSON.parse(unpacked.message)
                if (json['@type'] === 'JWT') {
                  message.transform({
                    raw: json.data,
                    meta: { type: 'DIDComm' },
                  })
                } else {
                  if (json['@id']) message.id = json['@id']
                  if (json['@type']) message.type = json['@type']
                  message.transform({
                    raw: unpacked.message,
                    data: json,
                    meta: { type: 'DIDComm' },
                  })
                }
                return super.validate(message, core)
              } catch (e) {
                debug(e)
              }

              message.transform({
                raw: unpacked.message,
                meta: { type: 'DIDComm' },
              })

              return super.validate(message, core)
            }
          }
        }
      } catch (e) {
        // not a JSON string
      }
    }
    return super.validate(message, core)
  }
}
