import type { IAgentPlugin, IAgentContext, MediationPolicy, MediationPolicies } from '@veramo/core-types'
import { KeyValueStore } from '@veramo/kv-store'
import { v4 as uuidv4 } from 'uuid'

// type Context = IAgentContext<>

interface SaveMediationPolicyArgs {
  did: string
  policy: MediationPolicies
}

type RemoveMediationPolicyArgs = Pick<SaveMediationPolicyArgs, 'did'>

export class MediationManager implements IAgentPlugin {
  readonly #policyStore: KeyValueStore<MediationPolicy>
  readonly methods: any

  constructor() {
    this.#policyStore = new KeyValueStore({ store: new Map<string, MediationPolicy>() })
    this.methods = {
      mediationManagerSaveMediationPolicy: this.saveMediationPolicy.bind(this),
      mediationManagerRemoveMediationPolicy: this.removeMediationPolicy.bind(this),
    }
  }

  public async saveMediationPolicy({ did, policy }: SaveMediationPolicyArgs): Promise<string> {
    const id = uuidv4()
    const res = await this.#policyStore.set(id, { did, policy })
    if (!res || !res.value) throw new Error('Failed to save mediation policy')
    return id
  }

  public async removeMediationPolicy({ did }: RemoveMediationPolicyArgs): Promise<string | null> {
    const res = await this.#policyStore.delete(did)
    console.log(res)
    return did
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
