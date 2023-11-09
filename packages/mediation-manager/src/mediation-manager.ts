import type {
  IAgentPlugin,
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
} from '@veramo/core-types'
import { KeyValueStore } from '@veramo/kv-store'

type PreRequestPolicyStore = KeyValueStore<PreMediationRequestPolicy>
type MediationResponseStore = KeyValueStore<MediationResponse>
type RecipientDidStore = KeyValueStore<RequesterDid>

export class MediationManagerPlugin implements IAgentPlugin {
  readonly #preRequestPolicyStore: KeyValueStore<PreMediationRequestPolicy>
  readonly #mediationResponseStore: KeyValueStore<MediationResponse>
  readonly #recipientDidStore: KeyValueStore<RequesterDid>
  readonly methods: IMediationManager

  constructor(
    isMediateDefaultGrantAll = true,
    preRequestPolicyStore: PreRequestPolicyStore,
    mediationResponseStore: MediationResponseStore,
    recipientDidStore: RecipientDidStore,
  ) {
    this.#preRequestPolicyStore = preRequestPolicyStore
    this.#mediationResponseStore = mediationResponseStore
    this.#recipientDidStore = recipientDidStore
    this.methods = {
      isMediateDefaultGrantAll: () => Promise.resolve(isMediateDefaultGrantAll),
      /* Mediation Policy Methods */
      mediationManagerSaveMediationPolicy: this.mediationManagerSaveMediationPolicy.bind(this),
      mediationManagerRemoveMediationPolicy: this.mediationManagerRemoveMediationPolicy.bind(this),
      mediationManagerGetMediationPolicy: this.mediationManagerGetMediationPolicy.bind(this),
      /* Mediation Methods */
      mediationManagerSaveMediation: this.mediationManagerSaveMediation.bind(this),
      mediationManagerGetMediation: this.mediationManagerGetMediation.bind(this),
      mediationManagerRemoveMediation: this.mediationManagerRemoveMediation.bind(this),
      /* Receipient Did Methods */
      mediationManagerAddRecipientDid: this.mediationManagerAddRecipientDid.bind(this),
      mediationManagerRemoveRecipientDid: this.mediationManagerRemoveRecipientDid.bind(this),
      mediationManagerGetRecipientDid: this.mediationManagerGetRecipientDid.bind(this),
      mediationManagerIsMediationGranted: this.mediationManagerIsMediationGranted.bind(this),
    }
  }

  public async mediationManagerSaveMediationPolicy({
    requesterDid,
    policy,
  }: IMediationManagerSaveMediationPolicyArgs): Promise<RequesterDid> {
    const res = await this.#preRequestPolicyStore.set(requesterDid, policy)
    if (!res || !res.value) throw new Error('mediation_manager: failed to save mediation policy')
    return requesterDid
  }

  public async mediationManagerRemoveMediationPolicy({
    requesterDid,
  }: IMediationManagerRemoveMediationPolicyArgs): Promise<boolean> {
    return await this.#preRequestPolicyStore.delete(requesterDid)
  }

  public async mediationManagerGetMediationPolicy({
    requesterDid,
  }: IMediationManagerGetMediationPolicyArgs): Promise<PreMediationRequestPolicy | null> {
    return (await this.#preRequestPolicyStore.get(requesterDid)) || null
  }

  public async mediationManagerGetMediation({
    requesterDid,
  }: IMediationGetArgs): Promise<MediationResponse | null> {
    return (await this.#mediationResponseStore.get(requesterDid)) || null
  }

  public async mediationManagerSaveMediation({
    requesterDid,
    status,
  }: IMediationManagerSaveMediationArgs): Promise<MediationResponse> {
    const res = await this.#mediationResponseStore.set(requesterDid, status)
    if (!res.value) throw new Error('mediation_manager: failed to save mediation')
    return res.value
  }

  public async mediationManagerRemoveMediation({ requesterDid }: IMediationGetArgs): Promise<boolean> {
    return await this.#mediationResponseStore.delete(requesterDid)

  }

  public async mediationManagerAddRecipientDid({
    recipientDid,
    requesterDid,
  }: IMediationManagerAddRecipientDidArgs): Promise<RequesterDid> {
    const addResult = await this.#recipientDidStore.set(recipientDid, requesterDid)
    if (!addResult || !addResult.value) throw new Error('mediation_manager: failed to add recipient did')
    return addResult.value
  }

  public async mediationManagerRemoveRecipientDid({
    recipientDid,
  }: IMediationManagerRecipientDidArgs): Promise<boolean> {
    return await this.#recipientDidStore.delete(recipientDid)
  }

  public async mediationManagerGetRecipientDid({
    recipientDid,
  }: IMediationManagerRecipientDidArgs): Promise<RequesterDid | null> {
    return (await this.#recipientDidStore.get(recipientDid)) || null
  }

  public async mediationManagerIsMediationGranted({
    recipientDid,
  }: IMediationManagerRecipientDidArgs): Promise<boolean> {
    return !!(await this.#recipientDidStore.get(recipientDid))
  }
}
