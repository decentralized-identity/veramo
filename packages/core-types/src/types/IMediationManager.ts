import { IPluginMethodMap } from './IAgent.js'

export interface IMediationManagerSaveMediationPolicyArgs {
  did: string
  policy: MediationPolicies
}

export interface IMediationManagerRemoveMediationPolicyArgs {
  did: string
}

export interface IMediationManagerGetMediationPolicyArgs {
  did: string
}

export type MediationPolicies = 'ALLOW' | 'DENY'

export type IMediationManagerRemoveMediationPolicyResult = string | null
export type IMediationManagerGetMediationPolicyResult = string

export interface IMediationManager extends IPluginMethodMap {
  mediationManagerSaveMediationPolicy(args: IMediationManagerSaveMediationPolicyArgs): Promise<string>
  mediationManagerRemoveMediationPolicy(
    args: IMediationManagerRemoveMediationPolicyArgs,
  ): Promise<IMediationManagerRemoveMediationPolicyResult>
  mediationManagerGetMediationPolicy(
    args: IMediationManagerGetMediationPolicyArgs,
  ): Promise<IMediationManagerGetMediationPolicyResult>
}
