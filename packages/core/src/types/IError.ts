/**
 * An error object, which can contain a code.
 * @beta
 */
export interface IError {

  /**
   * The details of the error being throw or forwarded
   */
  message?: string

  /**
   * The code for the error being throw
   */
  errorCode?: string
}