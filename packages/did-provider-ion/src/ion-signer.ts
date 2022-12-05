import { IContext } from './types/ion-provider-types'
import * as u8a from 'uint8arrays'
import { hash } from '@stablelib/sha256'

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
    const encodedHeader = u8a.toString(u8a.fromString(JSON.stringify(header)), 'base64url')
    const encodedPayload = u8a.toString(u8a.fromString(JSON.stringify(payload)), 'base64url')
    const toBeSigned = `${encodedHeader}.${encodedPayload}`
    const message = u8a.fromString(toBeSigned)
    const digest = u8a.toString(hash(message), 'base16')
    const sigObj = await this.context.agent.keyManagerSign({
      keyRef: this.kid,
      algorithm: header.alg,
      data: digest,
      encoding: 'hex',
    })
    const encodedSignature = sigObj // The keyManagerSign already performs base64Url encoding
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
  }
}
