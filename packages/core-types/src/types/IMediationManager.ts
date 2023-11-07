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

export interface IMediationGetArgs {
  did: string
}

export interface IMediationManagerSaveMediationPolicyArgs {
  did: string
  status: MediationStatus
}

export type MediationPolicy = 'ALLOW' | 'DENY'
export type MediationStatus = 'GRANTED' | 'DENIED'
export type IMediationManagerGetMediationPolicyResult = string

export interface IMediationManager extends IPluginMethodMap {
  mediationManagerSaveMediationPolicy(args: IMediationManagerSaveMediationPolicyArgs): Promise<string>
  mediationManagerRemoveMediationPolicy(args: IMediationManagerRemoveMediationPolicyArgs): Promise<boolean>
  mediationManagerGetMediationPolicy(args: IMediationManagerGetMediationPolicyArgs): Promise<string | null>
  mediationManagerIsMediationGranted(args: IMediationGetArgs): Promise<boolean>
  mediationManagerGetMediation(args: IMediationGetArgs): Promise<string | null>
  mediationManagerRemoveMediation(args: IMediationGetArgs): Promise<string | null>
  mediationManagerSaveMediation(args: IMediationManagerSaveMediationPolicyArgs): Promise<string>
}
