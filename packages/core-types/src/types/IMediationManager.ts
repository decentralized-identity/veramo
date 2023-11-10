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
  /**
   * Returns a boolean indicating whether the agent is configured to "ALLOW" or "DENY" all mediation requests
   * as the default policy.
   *
   * @returns - a Promise that resolves to a boolean
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  isMediateDefaultGrantAll(): Promise<boolean>

  /**
   * Takes a Requester Did and a {@link PreMediationRequestPolicy} and saves it to the store.
   *
   * @param args - an object {@link IMediationManagerSaveMediationPolicyArgs}
   * @returns - a Promise that resolves to the saved Requester Did
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerSaveMediationPolicy(args: IMediationManagerSaveMediationPolicyArgs): Promise<RequesterDid>

  /**
   * Takes a Requester Did and removes the {@link PreMediationRequestPolicy} associated with it from the store.
   *
   * @param args - an object {@link IMediationManagerRemoveMediationPolicyArgs}
   * @returns - a Promise that resolves to a boolean indicating whether the policy was successfully removed
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerRemoveMediationPolicy(args: IMediationManagerRemoveMediationPolicyArgs): Promise<boolean>

  /**
   * Takes a Requester Did and returns the {@link PreMediationRequestPolicy} associated with it from the store.
   *
   * @param args - an object {@link IMediationManagerRemoveMediationPolicyArgs}
   * @returns - a Promise that resolves to the {@link PreMediationRequestPolicy} associated with the Requester Did or null if no policy exists
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerGetMediationPolicy(
    args: IMediationManagerGetMediationPolicyArgs,
  ): Promise<PreMediationRequestPolicy | null>

  /**
   * Takes a Requester Did and returns the {@link MediationResponse} associated with it from the store.
   *
   * @param args - an object {@link IMediationGetArgs}
   * @returns - a Promise that resolves to the {@link MediationResponse} associated with the Requester Did
   * or null if no {@link MediationResponse} exists
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerGetMediation(args: IMediationGetArgs): Promise<MediationResponse | null>

  /**
   * Takes a Requester Did and removes the {@link MediationResponse} associated with it from the store.
   *
   * @param args - an object {@link IMediationGetArgs}
   * @returns - a Promise that resolves to a boolean indicating success or failure.
   * or null if no {@link MediationResponse} exists
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerRemoveMediation(args: IMediationGetArgs): Promise<boolean>

  /**
   * Takes a Requester Did and saves the {@link MediationResponse} associated with it to the store.
   *
   * @param args - an object {@link IMediationManagerSaveMediationArgs}
   * @returns - a Promise that resolves to a {@link RequesterDid} saved to the store.
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerSaveMediation(args: IMediationManagerSaveMediationArgs): Promise<RequesterDid>

  /**
   * Takes a {@link RecipientDid} and its owning {@link RequesterDid} and adds it to the store.
   *
   * @remarks the {@link RecipientDid} is used as the key and the {@link RequesterDid} is the value.
   * @param args - an object {@link IMediationManagerAddRecipientDidArgs}
   * @returns - a Promise that resolves to a {@link RequesterDid}.
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerAddRecipientDid(args: IMediationManagerAddRecipientDidArgs): Promise<RequesterDid>

  /**
   * Takes a {@link RecipientDid} and removes it from the store.
   *
   * @param args - an object {@link IMediationManagerRecipientDidArgs}
   * @returns - a Promise that resolves to a boolean indicating success or failure.
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerRemoveRecipientDid(args: IMediationManagerRecipientDidArgs): Promise<boolean>

  /**
   * Takes a {@link RecipientDid} and returns its associated value {@link RequesterDid}.
   *
   * @param args - an object {@link IMediationManagerRecipientDidArgs}
   * @returns - a Promise that resolves string which is the {@link RequesterDid}
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerGetRecipientDid(args: IMediationManagerRecipientDidArgs): Promise<RequesterDid | null>

  /**
   * Takes a {@link RecipientDid} and returns a boolean indicating whether it has been granted mediation.
   *
   * @param args - an object {@link IMediationManagerRecipientDidArgs}
   * @returns - a Promise that resolves to a boolean indicating whether mediation has been granted.
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerIsMediationGranted(args: IMediationManagerRecipientDidArgs): Promise<boolean>
}
