import { IVerifiableCredential } from 'daf-core'
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
  credentials: IVerifiableCredential[]
}

export interface IPresentationValidationResult {
  valid: boolean
  claims: ICredentialsForSdr[]
}
