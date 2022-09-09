import { IError } from "./IError.js"
/**
 * Encapsulates the response object to verifyPresentation method after verifying a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @beta
 */
 export interface IVerifyResult {
  /**
   * This value is used to transmit the result of verification.
   */
  verified: boolean

  /**
   * Optional Error object for the
   * but currently the machine readable errors are not expored from DID-JWT package to be imported here
   */
  error?: IError

  /**
   * Other options can be specified for verification.
   * They will be forwarded to the lower level modules. that performt the checks
   */
  [x: string]: any
}