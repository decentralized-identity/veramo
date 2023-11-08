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

export interface IMediationManagerSaveMediationArgs {
  did: string
  status: MediationStatus
}

export interface IMediationManagerAddRecipientDidArgs {
  recipientDid: string
  did: string
}

export interface IMediationManagerRecipientDidArgs {
  recipientDid: string
}

export type Did = string
export type MediationPolicy = 'ALLOW' | 'DENY'
export type MediationStatus = 'GRANTED' | 'DENIED'

export interface IMediationManager extends IPluginMethodMap {
  isMediateDefaultGrantAll(): Promise<boolean>
  mediationManagerSaveMediationPolicy(args: IMediationManagerSaveMediationPolicyArgs): Promise<Did>
  mediationManagerRemoveMediationPolicy(args: IMediationManagerRemoveMediationPolicyArgs): Promise<boolean>
  mediationManagerGetMediationPolicy(
    args: IMediationManagerGetMediationPolicyArgs,
  ): Promise<MediationPolicy | null>
  mediationManagerIsMediationGranted(args: IMediationGetArgs): Promise<boolean>
  mediationManagerGetMediation(args: IMediationGetArgs): Promise<MediationStatus | null>
  mediationManagerRemoveMediation(args: IMediationGetArgs): Promise<boolean>
  mediationManagerSaveMediation(args: IMediationManagerSaveMediationArgs): Promise<Did>
  mediationManagerAddRecipientDid(args: IMediationManagerAddRecipientDidArgs): Promise<Did>
  mediationManagerRemoveRecipientDid(args: IMediationManagerRecipientDidArgs): Promise<boolean>
  mediationManagerGetRecipientDid(args: IMediationManagerRecipientDidArgs): Promise<Did | null>
}
