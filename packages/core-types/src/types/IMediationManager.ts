import { IPluginMethodMap } from './IAgent.js'

export interface IMediationManagerSaveMediationPolicyArgs {
  requesterDid: RequesterDid
  policy: PreMediationRequestPolicy
}

export interface IMediationManagerRemoveMediationPolicyArgs {
  requesterDid: RequesterDid
}

export interface IMediationManagerGetMediationPolicyArgs {
  requesterDid: RequesterDid
}

export interface IMediationGetArgs {
  requesterDid: RequesterDid
}

export interface IMediationManagerSaveMediationArgs {
  requesterDid: RequesterDid
  status: MediationResponse
}

export interface IMediationManagerAddRecipientDidArgs {
  recipientDid: RecipientDid
  requesterDid: RequesterDid
}

export interface IMediationManagerRecipientDidArgs {
  recipientDid: RecipientDid
}

export type RecipientDid = string
export type RequesterDid = string
export type PreMediationRequestPolicy = 'ALLOW' | 'DENY'
export type MediationResponse = 'GRANTED' | 'DENIED'

export interface IMediationManager extends IPluginMethodMap {
  isMediateDefaultGrantAll(): Promise<boolean>
  mediationManagerSaveMediationPolicy(args: IMediationManagerSaveMediationPolicyArgs): Promise<RequesterDid>
  mediationManagerRemoveMediationPolicy(args: IMediationManagerRemoveMediationPolicyArgs): Promise<boolean>
  mediationManagerGetMediationPolicy(
    args: IMediationManagerGetMediationPolicyArgs,
  ): Promise<PreMediationRequestPolicy | null>
  mediationManagerGetMediation(args: IMediationGetArgs): Promise<MediationResponse | null>
  mediationManagerRemoveMediation(args: IMediationGetArgs): Promise<boolean>
  mediationManagerSaveMediation(args: IMediationManagerSaveMediationArgs): Promise<RequesterDid>
  mediationManagerAddRecipientDid(args: IMediationManagerAddRecipientDidArgs): Promise<RequesterDid>
  mediationManagerRemoveRecipientDid(args: IMediationManagerRecipientDidArgs): Promise<boolean>
  mediationManagerGetRecipientDid(args: IMediationManagerRecipientDidArgs): Promise<RequesterDid | null>
  mediationManagerIsMediationGranted(args: IMediationManagerRecipientDidArgs): Promise<boolean>
}
