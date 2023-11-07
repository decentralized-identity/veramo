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
export type IMediationGetArgs = {
  did: string
}

export type MediationPolicy = 'ALLOW' | 'DENY'
export type MediationStatus = 'GRANTED' | 'DENIED'

export type IMediationManagerGetMediationPolicyResult = string

export interface IMediationManager extends IPluginMethodMap {
  mediationManagerSaveMediationPolicy(args: IMediationManagerSaveMediationPolicyArgs): Promise<string>
  mediationManagerRemoveMediationPolicy(args: IMediationManagerRemoveMediationPolicyArgs): Promise<boolean>
  mediationManagerGetMediationPolicy(args: IMediationManagerGetMediationPolicyArgs): Promise<string | null>
  mediationManagerIsMediationGranted(args: IMediationGetArgs): Promise<boolean>

}
