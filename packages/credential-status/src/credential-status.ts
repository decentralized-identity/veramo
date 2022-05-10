import { IAgentContext, IAgentPlugin, IPluginMethodMap } from '@veramo/core';
import { Status, StatusMethod } from 'credential-status';
import { ICheckCredentialStatusArgs } from './types';

export class CredentialStatusPlugin implements IAgentPlugin {
  private readonly status: Status;
  readonly methods: IPluginMethodMap;

  constructor(registry: Record<string, StatusMethod> = {}) {
    this.status = new Status(registry);
    this.methods = {
      checkCredentialStatus: this.checkCredentialStatus.bind(this),
    };
  }

  private async checkCredentialStatus(
    args: ICheckCredentialStatusArgs,
    context: IAgentContext<any>,
  ) {
    return this.status.checkStatus(args.credential, args.didDoc);
  }
}
