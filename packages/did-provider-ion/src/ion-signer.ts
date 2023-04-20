import { IContext } from './types/ion-provider-types.js'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToBase64url, bytesToHex, stringToUtf8Bytes } from '@veramo/utils'

/**
 * This class is responsible for signing the JWT when sending in Anchor requests to an ION node. It is using the update
 * or recovery key denoted by 'kid'
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
    const encodedHeader = bytesToBase64url(stringToUtf8Bytes(JSON.stringify(header)))
    const encodedPayload = bytesToBase64url(stringToUtf8Bytes(JSON.stringify(payload)))
    const toBeSigned = `${encodedHeader}.${encodedPayload}`
    const message = stringToUtf8Bytes(toBeSigned)
    const digest = bytesToHex(sha256(message))
    // The keyManagerSign already performs base64url encoding
    const encodedSignature = await this.context.agent.keyManagerSign({
      keyRef: this.kid,
      algorithm: header.alg,
      data: digest,
      encoding: 'hex',
    })
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
  }
}
