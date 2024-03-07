import type {
  PreMediationRequestPolicy,
  IMediationManagerSaveMediationPolicyArgs,
  IMediationManagerRemoveMediationPolicyArgs,
  IMediationManagerGetMediationPolicyArgs,
  IMediationManager,
  IMediationGetArgs,
  MediationResponse,
  RequesterDid,
  IMediationManagerSaveMediationArgs,
  IMediationManagerRecipientDidArgs,
  IMediationManagerAddRecipientDidArgs,
  RecipientDid,
  IMediationManagerListRecipientDidsArgs,
} from './types/IMediationManager.js'
import type { IAgentPlugin } from '@veramo/core-types'
import type { KeyValueStore } from '@veramo/kv-store'

type PreRequestPolicyStore = KeyValueStore<PreMediationRequestPolicy>
type MediationResponseStore = KeyValueStore<MediationResponse>
type RecipientDidStore = KeyValueStore<RequesterDid>

/**
 * Mediation Manager Plugin for {@link @veramo/core#Agent}
 *
 * This plugin exposes methods pertaining to the {@link @veramo/core-types#IMediationManager} interface.
 *
 * @remarks be advised that the {@link @veramo/mediation-manager#IMediationManager} interface is for use with
 * {@link @veramo/did-comm#DIDComm | DIDCOmm} and specifically the V3 Coordinate Mediation Protocol implementation.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class MediationManagerPlugin implements IAgentPlugin {
  private readonly preRequestPolicyStore: KeyValueStore<PreMediationRequestPolicy>
  private readonly mediationResponseStore: KeyValueStore<MediationResponse>
  private readonly recipientDidStore: KeyValueStore<RequesterDid>
  readonly methods: IMediationManager

  constructor(
    isMediateDefaultGrantAll = true,
    preRequestPolicyStore: PreRequestPolicyStore,
    mediationResponseStore: MediationResponseStore,
    recipientDidStore: RecipientDidStore,
  ) {
    this.preRequestPolicyStore = preRequestPolicyStore
    this.mediationResponseStore = mediationResponseStore
    this.recipientDidStore = recipientDidStore
    this.methods = {
      isMediateDefaultGrantAll: () => Promise.resolve(isMediateDefaultGrantAll),
      /* Mediation Policy Methods */
      mediationManagerSaveMediationPolicy: this.mediationManagerSaveMediationPolicy.bind(this),
      mediationManagerRemoveMediationPolicy: this.mediationManagerRemoveMediationPolicy.bind(this),
      mediationManagerGetMediationPolicy: this.mediationManagerGetMediationPolicy.bind(this),
      mediationManagerListMediationPolicies: this.mediationManagerListMediationPolicies.bind(this),
      /* Mediation Methods */
      mediationManagerSaveMediation: this.mediationManagerSaveMediation.bind(this),
      mediationManagerGetMediation: this.mediationManagerGetMediation.bind(this),
      mediationManagerRemoveMediation: this.mediationManagerRemoveMediation.bind(this),
      mediationManagerGetAllMediations: this.mediationManagerGetAllMediations.bind(this),
      /* Recipient Did Methods */
      mediationManagerAddRecipientDid: this.mediationManagerAddRecipientDid.bind(this),
      mediationManagerRemoveRecipientDid: this.mediationManagerRemoveRecipientDid.bind(this),
      mediationManagerGetRecipientDid: this.mediationManagerGetRecipientDid.bind(this),
      mediationManagerListRecipientDids: this.mediationManagerListRecipientDids.bind(this),
      mediationManagerIsMediationGranted: this.mediationManagerIsMediationGranted.bind(this),
    }
  }

  public async mediationManagerSaveMediationPolicy({
    requesterDid,
    policy,
  }: IMediationManagerSaveMediationPolicyArgs): Promise<RequesterDid> {
    const res = await this.preRequestPolicyStore.set(requesterDid, policy)
    if (!res || !res.value) throw new Error('mediation_manager: failed to save mediation policy')
    return requesterDid
  }

  public async mediationManagerRemoveMediationPolicy({
    requesterDid,
  }: IMediationManagerRemoveMediationPolicyArgs): Promise<boolean> {
    return await this.preRequestPolicyStore.delete(requesterDid)
  }

  public async mediationManagerGetMediationPolicy({
    requesterDid,
  }: IMediationManagerGetMediationPolicyArgs): Promise<PreMediationRequestPolicy | null> {
    return (await this.preRequestPolicyStore.get(requesterDid)) || null
  }

  public async mediationManagerListMediationPolicies(): Promise<Record<string, PreMediationRequestPolicy>> {
    const policies: Record<string, PreMediationRequestPolicy> = {}
    for await (const [requesterDid, policy] of this.preRequestPolicyStore.getIterator()) {
      policies[requesterDid] = policy
    }
    return policies
  }

  public async mediationManagerGetMediation({
    requesterDid,
  }: IMediationGetArgs): Promise<MediationResponse | null> {
    return (await this.mediationResponseStore.get(requesterDid)) || null
  }

  public async mediationManagerSaveMediation({
    requesterDid,
    status,
  }: IMediationManagerSaveMediationArgs): Promise<MediationResponse> {
    const res = await this.mediationResponseStore.set(requesterDid, status)
    if (!res.value) throw new Error('mediation_manager: failed to save mediation')
    return res.value
  }

  public async mediationManagerRemoveMediation({ requesterDid }: IMediationGetArgs): Promise<boolean> {
    return await this.mediationResponseStore.delete(requesterDid)
  }

  public async mediationManagerGetAllMediations(): Promise<Record<string, MediationResponse>> {
    const mediationResponses: Record<string, MediationResponse> = {}
    for await (const [requesterDid, response] of this.mediationResponseStore.getIterator()) {
      mediationResponses[requesterDid] = response
    }
    return mediationResponses
  }

  public async mediationManagerAddRecipientDid({
    recipientDid,
    requesterDid,
  }: IMediationManagerAddRecipientDidArgs): Promise<RequesterDid> {
    const addResult = await this.recipientDidStore.set(recipientDid, requesterDid)
    if (!addResult || !addResult.value) throw new Error('mediation_manager: failed to add recipient did')
    return addResult.value
  }

  public async mediationManagerRemoveRecipientDid({
    recipientDid,
  }: IMediationManagerRecipientDidArgs): Promise<boolean> {
    return await this.recipientDidStore.delete(recipientDid)
  }

  public async mediationManagerGetRecipientDid({
    recipientDid,
  }: IMediationManagerRecipientDidArgs): Promise<RequesterDid | null> {
    return (await this.recipientDidStore.get(recipientDid)) || null
  }

  public async mediationManagerListRecipientDids({
    requesterDid,
  }: IMediationManagerListRecipientDidsArgs): Promise<RecipientDid[]> {
    const recipientDids: RecipientDid[] = []
    for await (const [recipientDid, did] of this.recipientDidStore.getIterator()) {
      if (did === requesterDid) recipientDids.push(recipientDid)
    }
    return recipientDids
  }

  public async mediationManagerIsMediationGranted({
    recipientDid,
  }: IMediationManagerRecipientDidArgs): Promise<boolean> {
    return !!(await this.recipientDidStore.get(recipientDid))
  }
}
