import {
  CredentialPayload,
  DIDDocComponent,
  IAgentContext,
  IKey,
  IKeyManager,
  IResolver,
  PresentationPayload,
  TKeyType,
} from '@veramo/core-types'
import { DIDDocument } from 'did-resolver'

export type RequiredAgentMethods = IResolver & Pick<IKeyManager, 'keyManagerGet' | 'keyManagerSign'>

/**
 * Base class for Veramo adapters of LinkedDataSignature suites.
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export abstract class VeramoLdSignature {
  // LinkedDataSignature Suites according to
  // https://github.com/digitalbazaar/jsonld-signatures/blob/main/lib/suites/LinkedDataSignature.js
  // Add type definition as soon as https://github.com/digitalbazaar/jsonld-signatures
  // supports those.

  abstract getSupportedVerificationType(): string | string[]

  abstract getSupportedProofType(): string

  abstract getSupportedVeramoKeyType(): TKeyType

  abstract getSuiteForSigning(
    key: IKey,
    issuerDid: string,
    verificationMethodId: string,
    context: IAgentContext<RequiredAgentMethods>,
  ): any

  abstract getSuiteForVerification(): any

  abstract preDidResolutionModification(
    didUrl: string,
    didDoc: DIDDocument | DIDDocComponent,
    context: IAgentContext<IResolver>,
  ): Promise<DIDDocument | DIDDocComponent>

  abstract preSigningCredModification(credential: CredentialPayload): void

  preSigningPresModification(presentation: PresentationPayload): void {
    // `verifier` is Veramo-only (JWT `aud`); no credentials context defines it, so safe mode would throw.
    // LD proofs bind the audience through `domain` and `challenge` instead.
    delete (presentation as any).verifier
  }
}
