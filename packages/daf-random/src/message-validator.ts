import { AbstractMessageValidator, Types } from 'daf-core'

export class MessageValidator extends AbstractMessageValidator {
  async validate(
    rawMessage: Types.RawMessage,
    core: any,
  ): Promise<Types.PreValidatedMessage | null> {
    if (rawMessage.meta && rawMessage.meta[0].sourceType == 'random') {
      return {
        type: 'random',
        issuer: 'did:web:example.com',
        meta: rawMessage.meta,
        raw: rawMessage.raw,
      }
    }

    return super.validate(rawMessage, core)
  }
}
