import type {
  IAgentPlugin,
  MediationPolicy,
  IMediationManagerSaveMediationPolicyArgs,
  IMediationManagerRemoveMediationPolicyArgs,
  IMediationManagerGetMediationPolicyArgs,
  IMediationManager,
} from '@veramo/core-types'
import { KeyValueStore } from '@veramo/kv-store'

export class MediationManagerPlugin implements IAgentPlugin {
  readonly #policyStore: KeyValueStore<MediationPolicy>
  readonly methods: IMediationManager

  constructor(kvStore: KeyValueStore<MediationPolicy>) {
    this.#policyStore = kvStore
    this.methods = {
      mediationManagerSaveMediationPolicy: this.mediationManagerSaveMediationPolicy.bind(this),
      mediationManagerRemoveMediationPolicy: this.mediationManagerRemoveMediationPolicy.bind(this),
      mediationManagerGetMediationPolicy: this.mediationManagerGetMediationPolicy.bind(this),
    }
  }

  public async mediationManagerSaveMediationPolicy({
    did,
    policy,
  }: IMediationManagerSaveMediationPolicyArgs): Promise<string> {
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
  }: IMediationManagerGetMediationPolicyArgs): Promise<string | null> {
    const policy = await this.#policyStore.get(did)
    return policy || null
  }

  public async isMediationGranted(args: any, context: any) {
    // logic
  }

  public async getMediationPolicies(args: any, context: any) {
    // logic
  }

  public async saveMediation(args: any, context: any) {
    // logic
  }

  public async getMediation(args: any, context: any) {
    // logic
  }

  public async removeMediation(args: any, context: any) {
    // logic
  }

  public async addRecipientDid(args: any, context: any) {
    // logic
  }

  public async removeRecipientDid(args: any, context: any) {
    // logic
  }

  public async getRecipientDids(args: any, context: any) {
    // logic
  }
}
