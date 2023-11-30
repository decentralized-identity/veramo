import { IPluginMethodMap } from '@veramo/core-types'

/**
 * The input to the {@link IMediationManager.mediationManagerSaveMediationPolicy} method.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IMediationManagerSaveMediationPolicyArgs {
  requesterDid: RequesterDid
  policy: PreMediationRequestPolicy
}

/**
 * The input to the {@link IMediationManager.mediationManagerRemoveMediationPolicy} method.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IMediationManagerRemoveMediationPolicyArgs {
  requesterDid: RequesterDid
}

/**
 * The input to the {@link IMediationManager.mediationManagerListRecipientDids} method.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IMediationManagerListRecipientDidsArgs {
  requesterDid: RequesterDid
}

/**
 * The input to the {@link IMediationManager.mediationManagerGetMediationPolicy} method.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IMediationManagerGetMediationPolicyArgs {
  requesterDid: RequesterDid
}

/**
 * The input to the {@link IMediationManager.mediationManagerGetMediation} method.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IMediationGetArgs {
  requesterDid: RequesterDid
}

/**
 * The input to the {@link IMediationManager.mediationManagerSaveMediation} method.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IMediationManagerSaveMediationArgs {
  requesterDid: RequesterDid
  status: MediationResponse
}

/**
 * The input to the {@link IMediationManager.mediationManagerAddRecipientDid} method.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IMediationManagerAddRecipientDidArgs {
  recipientDid: RecipientDid
  requesterDid: RequesterDid
}

/**
 * The input to the {@link IMediationManager.mediationManagerGetRecipientDid} method.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IMediationManagerRecipientDidArgs {
  recipientDid: RecipientDid
}

/**
 * A string representing the Recipient Did
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type RecipientDid = string

/**
 * A string representing the Requester Did
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type RequesterDid = string

/**
 * Can be "ALLOW" or "DENY" and is used to determine whether a mediation request for a specific {@link RequesterDid} should be ALLOW or DENY.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type PreMediationRequestPolicy = 'ALLOW' | 'DENY'

/**
 * Can be "GRANTED" or "DENIED" and is used to record whether a mediation response for a specific {@link RequesterDid} has been granted or denied.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type MediationResponse = 'GRANTED' | 'DENIED'

/**
 * An object of keys and their associated {@link PreMediationRequestPolicy}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type Mediations = Record<RequesterDid, MediationResponse>

/**
 * MediationManager plugin interface for {@link @veramo/core#Agent}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
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
   * Returns an object of keys and their associated {@link PreMediationRequestPolicy} it from the store.
   *
   * @returns - a Promise that resolves to an object {@link PreMediationRequestPolicy}.
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerListMediationPolicies(): Promise<Record<string, PreMediationRequestPolicy>>

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
   * Returns a record of all {@link RequesterDid} and their associated {@link MediationResponse}.
   *
   * @returns - a Promise that resolves to a list of {@link RequesterDid} saved to the store.
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerGetAllMediations(): Promise<Record<RequesterDid, MediationResponse>>

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
   * Takes a {@link RequesterDid} and returns all associated {@link RecipientDid}.
   *
   * @param args - an object {@link IMediationManagerListRecipientDidsArgs}
   * @returns - a Promise that resolves to an array of {@link RecipientDid}
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerListRecipientDids(args: IMediationManagerListRecipientDidsArgs): Promise<RecipientDid[]>

  /**
   * Takes a {@link RecipientDid} and returns a boolean indicating whether it has been granted mediation.
   *
   * @param args - an object {@link IMediationManagerRecipientDidArgs}
   * @returns - a Promise that resolves to a boolean indicating whether mediation has been granted.
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  mediationManagerIsMediationGranted(args: IMediationManagerRecipientDidArgs): Promise<boolean>
}
