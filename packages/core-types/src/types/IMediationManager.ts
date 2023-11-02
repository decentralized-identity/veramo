import { IPluginMethodMap } from './IAgent.js'

/**
 * Represents mediation policy
 * @public
 */
export enum MediationPolicies {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
}

export interface IMediationManagerSaveMediationPolicyArgs {
  did: string
  policy: MediationPolicies
}

export interface IMediationManagerRemoveMediationPolicyArgs {
  did: string
}

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

export type IMediationManagerRemoveMediationPolicyResult = string | null

export interface IMediationManager extends IPluginMethodMap {
  mediationManagerSaveMediationPolicy(args: IMediationManagerSaveMediationPolicyArgs): Promise<string>
  mediationManagerRemoveMediationPolicy(
    args: IMediationManagerRemoveMediationPolicyArgs,
  ): Promise<IMediationManagerRemoveMediationPolicyResult>
  mediationManagerGetMediationPolicies(): Promise<MediationPolicy>
}
