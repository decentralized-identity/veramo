import crypto from 'crypto'
import { IContext } from './types/ion-provider-types'
import * as u8a from 'uint8arrays'
import base64url from 'base64url'

/**
 * This class is responsible for signing the JWT when sending in Anchor requests to an ION node. It is using the update or recovery key denoted by 'kid'
 */
export class IonSigner {
  private readonly kid: string

  /**
   * Construct the signer object
   *
   * @param context The agent context
   * @param kid The Veramo update or recovery Key ID (kid)
   */
  constructor(private context: IContext, kid: string) {
    this.kid = kid
  }

  /**
   * Sign the JWT header and payload using the Key ID (kid) provided during construction.
   *
   * @param header The JWT header (only 'alg' supported for now)
   * @param payload The ION update delta payload
   */
  async sign(header: any, payload: any): Promise<string> {
    if (!header) {
      header = {
        alg: 'ES256K',
      }
    }
    const encodedHeader = base64url.encode(JSON.stringify(header))
    const encodedPayload = base64url.encode(JSON.stringify(payload))
    const toBeSigned = encodedHeader + '.' + encodedPayload
    const message = u8a.fromString(toBeSigned)
    const digest = crypto.createHash('sha256').update(message).digest('hex')
    const sigObj = await this.context.agent.keyManagerSign({
      keyRef: this.kid,
      algorithm: header.alg,
      data: digest,
      encoding: 'hex',
    })
    const encodedSignature = sigObj // The keyManagerSign already performs base64Url encoding
    return encodedHeader + '.' + encodedPayload + '.' + encodedSignature
  }
}
