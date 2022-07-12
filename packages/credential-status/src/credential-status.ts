import { IAgentContext, IAgentPlugin, VerifiableCredential } from '@veramo/core'
import { CredentialStatus, Status, StatusMethod } from 'credential-status'
import { ICheckCredentialStatus, ICheckCredentialStatusArgs } from './types'

/**
 * This plugin implements the {@link @veramo/credential-status#ICheckCredentialStatus | ICheckCredentialStatus}
 * interface.
 *
 * This aggregates some {@link credential-status#StatusMethod | credential status implementations} to provide a second
 * layer of validation when verifying Verifiable Credentials.
 *
 * This is used for the discovery of information about the current status of a verifiable credential, such as whether
 * it is suspended or revoked. The precise contents of the credential status information is determined by the specific
 * `credentialStatus` type definition.
 *
 * The results provided by this plugin depend on whether the {@link credential-status#StatusMethod | StatusMethod}
 * required by the credential is installed.
 *
 * @see {@link credential-status#Status}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class CredentialStatusPlugin implements IAgentPlugin {
  private readonly status: Status
  readonly methods: ICheckCredentialStatus

  constructor(registry: Record<string, StatusMethod> = {}) {
    this.status = new Status(registry)
    this.methods = {
      checkCredentialStatus: this.checkCredentialStatus.bind(this),
    }
  }

  private async checkCredentialStatus(args: ICheckCredentialStatusArgs, context: IAgentContext<any>) {
    return this.status.checkStatus(args.credential, args.didDoc)
  }
}

