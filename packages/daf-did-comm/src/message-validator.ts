import { Core, AbstractMessageValidator, Types } from 'daf-core'
import { DIDComm } from 'DIDComm-js'
import Debug from 'debug'
const debug = Debug('did-comm-message-validator')

export class MessageValidator extends AbstractMessageValidator {
  private didcomm: DIDComm

  constructor() {
    super()
    this.didcomm = new DIDComm()
  }

  async validate(
    rawMessage: Types.RawMessage,
    core: Core,
  ): Promise<Types.PreValidatedMessage | null> {
    if (core.encryptionKeyManager) {
      try {
        const parsed = JSON.parse(rawMessage.raw)
        if (parsed.ciphertext && parsed.protected) {
          const keyPairs = await core.encryptionKeyManager.listKeyPairs()
          for (const keyPair of keyPairs) {
            const unpacked = await this.didcomm.unpackMessage(
              rawMessage.raw,
              keyPair,
            )
            if (unpacked.message) {
              debug('Unpacked for publicKey %s', keyPair.publicKeyHex)
              debug(unpacked.message)
              return super.validate(
                {
                  raw: unpacked.message,
                  meta: [
                    ...rawMessage.meta,
                    {
                      sourceType: 'DIDComm',
                      data: {
                        raw: rawMessage.raw,
                      },
                    },
                  ],
                },
                core,
              )
            }
          }
        }
      } catch (e) {
        // not a JSON string
      }
    }
    return super.validate(rawMessage, core)
  }
}
