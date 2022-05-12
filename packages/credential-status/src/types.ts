import { IAgentContext, IPluginMethodMap } from '@veramo/core'
import { CredentialJwtOrJSON, CredentialStatus } from 'credential-status'
import { DIDDocument } from 'did-resolver'

export interface ICheckCredentialStatusArgs {
  credential: CredentialJwtOrJSON
  didDoc: DIDDocument
}

export interface ICheckCredentialStatusResult {
  revoked: boolean

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any
}

export interface ICheckCredentialStatus extends IPluginMethodMap {
  checkCredentialStatus(
    args: ICheckCredentialStatusArgs,
    context: IAgentContext<any>,
  ): Promise<CredentialStatus>
}
