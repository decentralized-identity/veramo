import type { IAgentPlugin } from '@veramo/core-types'

export class MediationManager implements IAgentPlugin {
  readonly methods: any

  constructor() {
    this.methods = {
      mediationManagerSaveMediationPolicy: this.saveMediationPolicy.bind(this),
    }
  }

  public async saveMediationPolicy(args: any, context: any) {
    // logic
  }

  public async removeMediationPolicy(args: any, context: any) {
    // logic
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
