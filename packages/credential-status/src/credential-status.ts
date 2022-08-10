import {
  CredentialStatus,
  IAgentContext,
  IAgentPlugin,
  ICheckCredentialStatusArgs,
  ICredentialStatusVerifier,
  IResolver,
} from '@veramo/core'
import { extractIssuer, isDefined, resolveDidOrThrow } from '@veramo/utils'
import { Status, StatusMethod } from 'credential-status'

/**
 * This plugin implements the {@link @veramo/core#ICredentialStatusVerifier | ICredentialStatusVerifier}
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
  readonly methods: ICredentialStatusVerifier

  constructor(registry: Record<string, StatusMethod> = {}) {
    this.status = new Status(registry)
    this.methods = {
      checkCredentialStatus: this.checkCredentialStatus.bind(this),
    }
  }

  private async checkCredentialStatus(args: ICheckCredentialStatusArgs, context: IAgentContext<IResolver>) {
    let didDoc = args.didDocumentOverride
    if (!didDoc) {
      const issuerDid = extractIssuer(args.credential)
      didDoc = await resolveDidOrThrow(issuerDid, context)
    }
    const statusCheck: CredentialStatus = (await this.status.checkStatus(
      args.credential,
      didDoc,
    )) as CredentialStatus
    if (!isDefined(statusCheck.revoked)) {
      throw new Error(
        `invalid_result: 'revoked' property missing. The Credential Status verification resulted in an ambiguous result: ${JSON.stringify(
          statusCheck,
        )}`,
      )
    }
    return statusCheck
  }
}
