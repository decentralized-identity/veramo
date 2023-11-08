import type {
  IAgentPlugin,
  MediationPolicy,
  IMediationManagerSaveMediationPolicyArgs,
  IMediationManagerRemoveMediationPolicyArgs,
  IMediationManagerGetMediationPolicyArgs,
  IMediationManager,
  IMediationGetArgs,
  MediationStatus,
  Did,
  IMediationManagerSaveMediationArgs,
} from '@veramo/core-types'
import { KeyValueStore } from '@veramo/kv-store'

type PolicyStore = KeyValueStore<MediationPolicy>
type MediationStore = KeyValueStore<MediationStatus>

export class MediationManagerPlugin implements IAgentPlugin {
  readonly #policyStore: KeyValueStore<MediationPolicy>
  readonly #mediationStore: KeyValueStore<MediationStatus>
  readonly methods: IMediationManager

  constructor(isMediateDefaultGrantAll = true, policyStore: PolicyStore, mediationStore: MediationStore) {
    this.#policyStore = policyStore
    this.#mediationStore = mediationStore
    this.methods = {
      isMediateDefaultGrantAll: () => Promise.resolve(isMediateDefaultGrantAll),
      /* Mediation Policy Methods */
      mediationManagerSaveMediationPolicy: this.mediationManagerSaveMediationPolicy.bind(this),
      mediationManagerRemoveMediationPolicy: this.mediationManagerRemoveMediationPolicy.bind(this),
      mediationManagerGetMediationPolicy: this.mediationManagerGetMediationPolicy.bind(this),
      /* Mediation Methods */
      mediationManagerIsMediationGranted: this.mediationManagerIsMediationGranted.bind(this),
      mediationManagerSaveMediation: this.mediationManagerSaveMediation.bind(this),
      mediationManagerGetMediation: this.mediationManagerGetMediation.bind(this),
      mediationManagerRemoveMediation: this.mediationManagerRemoveMediation.bind(this),
    }
  }

  public async mediationManagerSaveMediationPolicy({
    did,
    policy,
  }: IMediationManagerSaveMediationPolicyArgs): Promise<Did> {
    const res = await this.#policyStore.set(did, policy)
    if (!res || !res.value) throw new Error('mediation_manager: failed to save mediation policy')
    return did
  }

  public async mediationManagerRemoveMediationPolicy({
    did,
  }: IMediationManagerRemoveMediationPolicyArgs): Promise<boolean> {
    return await this.#policyStore.delete(did)
  }

  public async mediationManagerGetMediationPolicy({
    did,
  }: IMediationManagerGetMediationPolicyArgs): Promise<MediationPolicy | null> {
    const policy = await this.#policyStore.get(did)
    return policy || null
  }

  public async mediationManagerIsMediationGranted(args: IMediationGetArgs): Promise<boolean> {
    const policy = await this.#mediationStore.get(args.did)
    return policy === 'GRANTED'
  }

  public async mediationManagerGetMediation({ did }: IMediationGetArgs): Promise<MediationStatus | null> {
    const mediation = await this.#mediationStore.get(did)
    return mediation || null
  }

  public async mediationManagerSaveMediation({
    did,
    status,
  }: IMediationManagerSaveMediationArgs): Promise<MediationStatus> {
    const res = await this.#mediationStore.set(did, status)
    if (!res.value) throw new Error('mediation_manager: failed to save mediation')
    return res.value
  }

  public async mediationManagerRemoveMediation(args: IMediationGetArgs): Promise<boolean> {
    return await this.#mediationStore.delete(args.did)
  }

  public async addRecipientDid(args: any, context: any) {
    // logic
  }

  public async removeRecipientDid(args: any, context: any) {
    // logic
  }

  public async getRecipientDids({ args, context }: { args: any; context: any }) {
    // logic
  }
}
