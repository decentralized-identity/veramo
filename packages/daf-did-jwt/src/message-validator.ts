import { Core, AbstractMessageValidator, Types } from 'daf-core'
import { Resolver } from 'did-resolver'
import { verifyJWT, decodeJWT } from 'did-jwt'
import Debug from 'debug'
const debug = Debug('did-jwt-validator')

export interface DidJwtPayloadValidator {
  validate: (
    verifiedJwt: any,
    didResolver: Resolver,
  ) => Promise<Types.PreValidatedMessage>
}

interface Options {
  payloadValidators: DidJwtPayloadValidator[]
}

export class MessageValidator extends AbstractMessageValidator {
  private payloadValidators: DidJwtPayloadValidator[]

  constructor(options: Options) {
    super()
    this.payloadValidators = options.payloadValidators
  }

  async validate(
    rawMessage: Types.RawMessage,
    core: Core,
  ): Promise<Types.PreValidatedMessage | null> {
    let jwt = rawMessage.raw

    try {
      // This can be DIDComm message '{"@type": "JWT", "data": "..."}'
      const json = JSON.parse(rawMessage.raw)
      if (json['@type'] === 'JWT') {
        jwt = json.data
      }
    } catch (e) {}

    let verified
    try {
      const decoded = decodeJWT(jwt)
      const audience = decoded.payload.aud
      verified = await verifyJWT(jwt, { resolver: core.didResolver, audience })
      debug('Valid JWT.')

      for (const payloadValidator of this.payloadValidators) {
        try {
          const validMessage = await payloadValidator.validate(
            verified,
            core.didResolver,
          )
          return {
            ...validMessage,
            meta: rawMessage.meta,
          }
        } catch (e) {}
      }
    } catch (e) {
      debug(e.message)
    }

    return super.validate(rawMessage, core)
  }
}
