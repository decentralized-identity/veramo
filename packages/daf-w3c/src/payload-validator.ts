import { DidJwtPayloadValidator } from 'daf-did-jwt'
import { Types, Resolver } from 'daf-core'
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

export class PayloadValidator implements DidJwtPayloadValidator {
  async validate(
    verifiedJwt: any,
    didResolver: Resolver,
  ): Promise<Types.PreValidatedMessage> {
    try {
      validatePresentationAttributes(verifiedJwt.payload)

      debug('JWT is', MessageTypes.vp)

      const vc = await Promise.all(
        verifiedJwt.payload.vp.verifiableCredential.map((vcJwt: string) =>
          verifyCredential(vcJwt, didResolver ),
        ),
      )

      return {
        type: MessageTypes.vp,
        raw: verifiedJwt.jwt,
        issuer: verifiedJwt.payload.iss,
        subject: verifiedJwt.payload.sub,
        time: verifiedJwt.payload.nbf || verifiedJwt.payload.iat,
        verified: verifiedJwt,
        custom: {
          vc,
        },
      }
    } catch (e) {}

    try {
      validateVerifiableCredentialAttributes(verifiedJwt.payload)
      debug('JWT is', MessageTypes.vc)
      return {
        type: MessageTypes.vc,
        raw: verifiedJwt.jwt,
        issuer: verifiedJwt.payload.iss,
        subject: verifiedJwt.payload.sub,
        time: verifiedJwt.payload.nbf || verifiedJwt.payload.iat,
        verified: verifiedJwt,
        custom: {
          vc: [verifiedJwt],
        },
      }
    } catch (e) {}

    return Promise.reject()
  }
}
