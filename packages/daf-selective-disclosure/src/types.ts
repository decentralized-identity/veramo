import {
  IAgentContext,
  IIdentityManager,
  IKeyManager,
  IPluginMethodMap,
  VerifiableCredential,
  VerifiablePresentation,
} from 'daf-core'
import { IDataStoreORM } from 'daf-typeorm'

export interface Issuer {
  did: string
  url: string
}

export interface ISelectiveDisclosureRequest {
  issuer: string
  subject?: string
  replyUrl?: string
  tag?: string
  claims: ICredentialRequestInput[]
  credentials?: string[]
}

export interface ICredentialRequestInput {
  reason?: string
  essential?: boolean
  credentialType?: string
  credentialContext?: string
  claimType: string
  claimValue?: string
  issuers?: Issuer[]
}

export interface ICredentialsForSdr extends ICredentialRequestInput {
  credentials: VerifiableCredential[]
}

export interface IPresentationValidationResult {
  valid: boolean
  claims: ICredentialsForSdr[]
}

export interface ICreateSelectiveDisclosureRequestArgs {
  data: ISelectiveDisclosureRequest
}

export interface IGetVerifiableCredentialsForSdrArgs {
  sdr: Omit<ISelectiveDisclosureRequest, 'issuer'>
  did?: string
}

export interface IValidatePresentationAgainstSdrArgs {
  presentation: VerifiablePresentation
  sdr: ISelectiveDisclosureRequest
}

export interface ISelectiveDisclosure extends IPluginMethodMap {
  createSelectiveDisclosureRequest(
    args: ICreateSelectiveDisclosureRequestArgs,
    context: IAgentContext<IIdentityManager & IKeyManager>,
  ): Promise<string>
  getVerifiableCredentialsForSdr(
    args: IGetVerifiableCredentialsForSdrArgs,
    context: IAgentContext<IDataStoreORM>,
  ): Promise<Array<ICredentialsForSdr>>
  validatePresentationAgainstSdr(
    args: IValidatePresentationAgainstSdrArgs,
    context: IAgentContext<{}>,
  ): Promise<IPresentationValidationResult>
}
