import type {
  IAgentPlugin,
  MediationPolicies,
  IMediationManagerSaveMediationPolicyArgs,
  IMediationManagerRemoveMediationPolicyArgs,
  IMediationManagerGetMediationPolicyArgs,
  IMediationManagerRemoveMediationPolicyResult,
  IMediationManagerGetMediationPolicyResult,
  IMediationManager,
} from '@veramo/core-types'
import { KeyValueStore } from '@veramo/kv-store'

export class MediationManagerPlugin implements IAgentPlugin {
  readonly #policyStore: KeyValueStore<MediationPolicies>
  readonly methods: IMediationManager

  constructor(kvStore: KeyValueStore<MediationPolicies>) {
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
    console.log('did', did)
    console.log('policy', policy)
    // @ts-ignore
    const res = await this.#policyStore.set(did, JSON.stringify(policy))
    console.log('SUCCESS')
    if (!res || !res.value) throw new Error('Failed to save mediation policy')
    return did
  }

  public async mediationManagerRemoveMediationPolicy({
    did,
  }: IMediationManagerRemoveMediationPolicyArgs): Promise<IMediationManagerRemoveMediationPolicyResult> {
    const res = await this.#policyStore.delete(did)
    console.log(res)
    return did
  }

  public async mediationManagerGetMediationPolicy({
    did,
  }: IMediationManagerGetMediationPolicyArgs): Promise<string> {
    const policy = await this.#policyStore.get(did)
    if (!policy) throw new Error('Failed to get mediation policy')
    return policy
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
