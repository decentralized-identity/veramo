import { CredentialPayload, DIDDocument, IAgentContext, IKey, TKeyType } from '@veramo/core-types'
import { RequiredAgentMethods, VeramoLdSignature } from '../ld-suites.js'
import { JwsDetachedSignature, kmsJwsSigner } from './jws-detached-signature.js'

const CONTEXT = 'https://w3id.org/security/suites/jws-2020/v1'

/**
 * The JsonWebSignature2020 Linked Data suite: a detached JWS over the canonicalized document, verified
 * against a `JsonWebKey2020` verification method.
 */
class JsonWebSignature2020 extends JwsDetachedSignature {
  constructor(signer?: ConstructorParameters<typeof JwsDetachedSignature>[0]['signer']) {
    super({
      type: 'JsonWebSignature2020',
      contextUrl: CONTEXT,
      algorithms: ['EdDSA', 'ES256K', 'ES256K-R', 'ES256', 'ES384', 'ES512'],
      // JsonWebKey2020, plus the key types @transmute/json-web-signature converted to it
      verificationMethodTypes: [
        'JsonWebKey2020',
        'Ed25519VerificationKey2018',
        'EcdsaSecp256k1VerificationKey2019',
        'P256Key2021',
        'P384Key2021',
        'P521Key2021',
      ],
      signer,
    })
  }
}

/**
 * Veramo wrapper for the JsonWebSignature2020 suite
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export class VeramoJsonWebSignature2020 extends VeramoLdSignature {
  getSupportedVerificationType(): string {
    return 'JsonWebKey2020'
    // TODO: add support for ['Ed25519VerificationKey2018', 'Ed25519VerificationKey2020', 'Multikey'] and others
  }

  getSupportedProofType(): string {
    return 'JsonWebSignature2020'
  }

  getSupportedVeramoKeyType(): TKeyType {
    return 'Ed25519'
  }

  async getSuiteForSigning(
    key: IKey,
    issuerDid: string,
    verificationMethodId: string,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<any> {
    return new JsonWebSignature2020({
      algorithm: 'EdDSA',
      verificationMethod: verificationMethodId,
      sign: kmsJwsSigner(context, key.kid, 'EdDSA'),
    })
  }

  getSuiteForVerification(): any {
    return new JsonWebSignature2020()
  }

  preSigningCredModification(credential: CredentialPayload): void {
    // nop
  }

  async preDidResolutionModification(didUrl: string, didDoc: DIDDocument): Promise<DIDDocument> {
    // do nothing
    return didDoc
  }
}
