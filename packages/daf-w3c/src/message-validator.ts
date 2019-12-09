import { Core, AbstractMessageValidator, Message } from 'daf-core'

import {
  verifyCredential,
  validateVerifiableCredentialAttributes,
  validatePresentationAttributes,
} from 'did-jwt-vc'

import Debug from 'debug'
const debug = Debug('w3c-validator')

export const MessageTypes = {
  vc: 'w3c.vc',
  vp: 'w3c.vp',
}

export class MessageValidator extends AbstractMessageValidator {
  async validate(message: Message, core: Core): Promise<Message> {
    const { type, id } = message.meta

    if (type === 'JWT' && id === 'ES256K-R') {
      try {
        validatePresentationAttributes(message.data)

        debug('JWT is', MessageTypes.vp)

        const vc = await Promise.all(
          message.data.vp.verifiableCredential.map((vcJwt: string) =>
            verifyCredential(vcJwt, core.didResolver),
          ),
        )

        message.type = MessageTypes.vp
        message.from = message.data.iss
        message.to = message.data.aud
        message.threadId = message.data.tag
        message.timestamp = message.data.nbf || message.data.iat
        message.vc = vc

        return message
      } catch (e) {}

      try {
        validateVerifiableCredentialAttributes(message.data)
        debug('JWT is', MessageTypes.vc)

        message.type = MessageTypes.vc
        message.from = message.data.iss
        message.to = message.data.sub
        message.threadId = message.data.tag
        message.timestamp = message.data.nbf || message.data.iat
        message.vc = [{ payload: message.data, jwt: message.raw }]
        return message
      } catch (e) {}
    }

    return super.validate(message, core)
  }
}
