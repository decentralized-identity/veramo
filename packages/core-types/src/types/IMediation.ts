/**
 * Represents mediation status
 * @public
 */

export enum MediationStatus {
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
}

/**
 * Represents mediation
 * @public
 */
export interface IMediation {
  /**
   * required: did
   */
  did: string

  /**
   * required: mediation status
   */
  status: MediationStatus
}

/**
 * Represents data store get mediation result
 **/
export type DataStoreGetMediationResult = IMediation | null
