/**
 * Represents mediation status
 * @public
 */

export enum MediationStatus {
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
}

export enum AllowOrDeny {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
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
