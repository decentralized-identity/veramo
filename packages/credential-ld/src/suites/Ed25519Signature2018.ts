import { CredentialPayload, DIDDocument, IAgentContext, IKey, TKeyType } from '@veramo/core-types'
import { RequiredAgentMethods, VeramoLdSignature } from '../ld-suites.js'
import { JwsDetachedSignature, kmsJwsSigner } from './jws-detached-signature.js'

const VERIFICATION_METHOD_TYPES = ['Ed25519VerificationKey2018', 'JsonWebKey2020']

/**
 * The Ed25519Signature2018 Linked Data suite: a detached `EdDSA` JWS over the canonicalized document.
 * Its terms are defined by `https://www.w3.org/2018/credentials/v1`, so no suite context is added to
 * credentials and presentations.
 */
class Ed25519Signature2018 extends JwsDetachedSignature {
  constructor(signer?: ConstructorParameters<typeof JwsDetachedSignature>[0]['signer']) {
    super({
      type: 'Ed25519Signature2018',
      algorithms: ['EdDSA'],
      verificationMethodTypes: VERIFICATION_METHOD_TYPES,
      signer,
    })
  }

  ensureSuiteContext() {
    // the credentials v1 context defines this suite's terms
  }
}

/**
 * Veramo wrapper for the Ed25519Signature2018 suite
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export class VeramoEd25519Signature2018 extends VeramoLdSignature {
  getSupportedVerificationType(): string[] {
    return VERIFICATION_METHOD_TYPES
    // TODO: add support for ['Ed25519VerificationKey2020', 'Multikey']
  }

  getSupportedProofType(): string {
    return 'Ed25519Signature2018'
  }

  getSupportedVeramoKeyType(): TKeyType {
    return 'Ed25519'
  }

  getSuiteForSigning(
    key: IKey,
    issuerDid: string,
    verificationMethodId: string,
    context: IAgentContext<RequiredAgentMethods>,
  ): any {
    return new Ed25519Signature2018({
      algorithm: 'EdDSA',
      verificationMethod: verificationMethodId,
      sign: kmsJwsSigner(context, key.kid, 'EdDSA'),
    })
  }

  getSuiteForVerification(): any {
    return new Ed25519Signature2018()
  }

  preSigningCredModification(credential: CredentialPayload): void {
    // nothing to do here
  }

  async preDidResolutionModification(didUrl: string, didDoc: DIDDocument): Promise<DIDDocument> {
    // nothing to do here
    return didDoc
  }
}
