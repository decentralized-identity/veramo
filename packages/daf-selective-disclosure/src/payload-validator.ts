import { DidJwtPayloadValidator } from 'daf-did-jwt'
import { Types } from 'daf-core'
import { Resolver } from 'did-resolver'

import Debug from 'debug'
const debug = Debug('sdr-validator')

export const MessageTypes = {
  sdr: 'sdr',
}

export class PayloadValidator implements DidJwtPayloadValidator {
  async validate(
    verifiedJwt: any,
    didResolver: Resolver,
  ): Promise<Types.PreValidatedMessage> {
    const p = verifiedJwt.payload
    if (p.type == MessageTypes.sdr && p.claims) {
      debug('JWT type is', MessageTypes.sdr)

      return {
        type: MessageTypes.sdr,
        raw: verifiedJwt.jwt,
        issuer: verifiedJwt.payload.iss,
        subject: verifiedJwt.payload.sub,
        time: verifiedJwt.payload.iat,
        verified: verifiedJwt,
      }
    } else {
      return Promise.reject()
    }
  }
}
