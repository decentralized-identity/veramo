/**
 * Represents mediation policy
 * @public
 */
export enum MediationPolicies {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
}

/**
 * Represents mediation policy
 * @public
 */
export interface IMediationPolicy {
  /**
   * required: did
   */
  did: string

  /**
   * required: policy
   */
  policy: MediationPolicies
}

/**
 * Represents a list mediation policies
 * @public
 */
export type IMediationPolicies = IMediationPolicy[]
