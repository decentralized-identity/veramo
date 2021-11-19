import { IAgentContext, IKey, IKeyManager, IResolver, TKeyType } from '@veramo/core'
import { CredentialPayload, PresentationPayload } from 'did-jwt-vc'
import { DIDDocument } from 'did-resolver/src/resolver'

export type RequiredAgentMethods = IResolver & Pick<IKeyManager, 'keyManagerGet' | 'keyManagerSign'>

export abstract class VeramoLdSignature {
  // LinkedDataSignature Suites according to
  // https://github.com/digitalbazaar/jsonld-signatures/blob/main/lib/suites/LinkedDataSignature.js
  // Add type definition as soon as https://github.com/digitalbazaar/jsonld-signatures
  // supports those.

  abstract getSupportedVerificationType(): string

  abstract getSupportedVeramoKeyType(): TKeyType

  abstract getSuiteForSigning(
    key: IKey,
    issuerDid: string,
    verificationMethodId: string,
    context: IAgentContext<RequiredAgentMethods>,
  ): any

  abstract getSuiteForVerification(): any

  abstract preDidResolutionModification(didUrl: string, didDoc: DIDDocument): void

  abstract preSigningCredModification(credential: Partial<CredentialPayload>): void

  preSigningPresModification(presentation: Partial<PresentationPayload>): void {
    // TODO: Remove invalid field 'verifiers' from Presentation. Needs to be adapted for LD credentials
    // Only remove empty array (vc.signPresentation will throw then)
    const sanitizedPresentation = presentation as any
    if (sanitizedPresentation.verifier.length == 0) {
      delete sanitizedPresentation.verifier
    }
  }
}


