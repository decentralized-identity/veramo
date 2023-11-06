import { IPluginMethodMap } from './IAgent.js'

export interface IMediationManagerSaveMediationPolicyArgs {
  did: string
  policy: MediationPolicy
}

export interface IMediationManagerRemoveMediationPolicyArgs {
  did: string
}

export interface IMediationManagerGetMediationPolicyArgs {
  did: string
}

export type MediationPolicy = 'ALLOW' | 'DENY'

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
