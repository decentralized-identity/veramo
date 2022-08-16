/**
 * Error interface
 * @public
 */

export interface IError {

  /**
   * The details of the error being throw or forwarded
   */
  errorMessage?: string

  /**
   * The code for the error being throw
   */
  errorCode?: string
}