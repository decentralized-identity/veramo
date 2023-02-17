/**
 * Represents a Json Web Token in compact form.
 * "header.payload.signature"
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type CompactJWT = string

/**
 * The issuer of a {@link VerifiableCredential} or the holder of a {@link VerifiablePresentation }.
 *
 * The value of the issuer property MUST be either a URI or an object containing an id property.
 * It is RECOMMENDED that the URI in the issuer or its id be one which, if de-referenced, results in a document
 * containing machine-readable information about the issuer that can be used to verify the information expressed in the
 * credential.
 *
 * See {@link https://www.w3.org/TR/vc-data-model/#issuer | Issuer data model}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type IssuerType = { id: string; [x: string]: any } | string

/**
 * The value of the credentialSubject property is defined as a set of objects that contain one or more properties that
 * are each related to a subject of the verifiable credential.
 * Each object MAY contain an id.
 *
 * See {@link https://www.w3.org/TR/vc-data-model/#credential-subject | Credential Subject}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type CredentialSubject = {
  id?: string
  [x: string]: any
}

/**
 * Used for the discovery of information about the current status of a verifiable credential, such as whether it is
 * suspended or revoked.
 * The precise contents of the credential status information is determined by the specific `credentialStatus` type
 * definition, and varies depending on factors such as whether it is simple to implement or if it is privacy-enhancing.
 *
 * See {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type CredentialStatusReference = {
  id: string
  type: string
  [x: string]: any
}

/**
 * Represents the result of a status check.
 *
 * Implementations MUST populate the `revoked` boolean property, but they can return additional metadata that is
 * method specific.
 *
 * @see {@link credential-status#CredentialStatus | CredentialStatus}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type CredentialStatus = {
  revoked: boolean
  [x: string]: any
}

/**
 * A proof property of a {@link VerifiableCredential} or {@link VerifiablePresentation}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface ProofType {
  type?: string

  [x: string]: any
}

/**
 * The data type for `@context` properties of credentials, presentations, etc.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type ContextType = string | Record<string, any> | (string | Record<string, any>)[]

/**
 * Represents an unsigned W3C Credential payload.
 * See {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface UnsignedCredential {
  issuer: IssuerType
  credentialSubject: CredentialSubject
  type?: string[] | string
  '@context': ContextType
  issuanceDate: string
  expirationDate?: string
  credentialStatus?: CredentialStatusReference
  id?: string

  [x: string]: any
}

/**
 * Represents a signed Verifiable Credential payload (includes proof), using a JSON representation.
 * See {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type VerifiableCredential = UnsignedCredential & { proof: ProofType }

/**
 * Represents a signed Verifiable Credential (includes proof), in either JSON or compact JWT format.
 * See {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model}
 * See {@link https://www.w3.org/TR/vc-data-model/#proof-formats | proof formats}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type W3CVerifiableCredential = VerifiableCredential | CompactJWT

/**
 * Represents an unsigned W3C Presentation payload.
 * See {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model}
 * @public
 */
export interface UnsignedPresentation {
  holder: string
  verifiableCredential?: W3CVerifiableCredential[]
  type?: string[] | string
  '@context': ContextType
  verifier?: string[]
  issuanceDate?: string
  expirationDate?: string
  id?: string

  [x: string]: any
}

/**
 * Represents a signed Verifiable Presentation (includes proof), using a JSON representation.
 * See {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model}
 * @public
 */
export type VerifiablePresentation = UnsignedPresentation & { proof: ProofType }

/**
 * Represents a signed Verifiable Presentation (includes proof) in either JSON or compact JWT format.
 * See {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model}
 *
 * @public
 */
export type W3CVerifiablePresentation = VerifiablePresentation | CompactJWT

/**
 * Represents an issuance or expiration date for Credentials / Presentations.
 * This is used as input when creating them.
 *
 * @beta This API may change without prior notice.
 */
export type DateType = string | Date

/**
 * Used as input when creating Verifiable Credentials
 *
 * @beta This API may change without prior notice.
 */
export interface CredentialPayload {
  issuer: IssuerType
  credentialSubject?: CredentialSubject
  type?: string[]
  '@context'?: ContextType
  issuanceDate?: DateType
  expirationDate?: DateType
  credentialStatus?: CredentialStatusReference
  id?: string

  [x: string]: any
}

/**
 * Used as input when creating Verifiable Presentations
 *
 * @beta This API may change without prior notice.
 */
export interface PresentationPayload {
  holder: string
  verifiableCredential?: W3CVerifiableCredential[]
  type?: string[]
  '@context'?: ContextType
  verifier?: string[]
  issuanceDate?: DateType
  expirationDate?: DateType
  id?: string

  [x: string]: any
}
