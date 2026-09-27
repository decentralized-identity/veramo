import { RequiredAgentMethods, VeramoLdSignature } from '../ld-suites.js'
import { CredentialPayload, DIDDocument, IAgentContext, IKey, TKeyType } from '@veramo/core-types'
import { asArray, intersect } from '@veramo/utils'
import { JwsDetachedSignature, kmsJwsSigner } from './jws-detached-signature.js'

const CONTEXT = 'https://w3id.org/security/suites/secp256k1recovery-2020/v2'

/**
 * The EcdsaSecp256k1RecoverySignature2020 Linked Data suite: a detached `ES256K-R` JWS over the
 * canonicalized document. The signature carries its recovery bit, so it verifies against a verification
 * method with only a `blockchainAccountId` / `ethereumAddress` as well as one with a public key.
 */
class EcdsaSecp256k1RecoverySignature2020 extends JwsDetachedSignature {
  constructor(signer?: ConstructorParameters<typeof JwsDetachedSignature>[0]['signer']) {
    super({
      type: 'EcdsaSecp256k1RecoverySignature2020',
      contextUrl: CONTEXT,
      algorithms: ['ES256K-R'],
      verificationMethodTypes: ['EcdsaSecp256k1RecoveryMethod2020'],
      signer,
    })
  }
}

/**
 * Veramo wrapper for the EcdsaSecp256k1RecoverySignature2020 suite
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export class VeramoEcdsaSecp256k1RecoverySignature2020 extends VeramoLdSignature {
  getSupportedVerificationType(): string {
    return 'EcdsaSecp256k1RecoveryMethod2020'
    // TODO: add support for ['EcdsaSecp256k1VerificationKey2020', 'EcdsaSecp256k1VerificationKey2019',
    // 'JsonWebKey2020', 'Multikey']
  }

  getSupportedProofType(): string {
    return 'EcdsaSecp256k1RecoverySignature2020'
  }

  getSupportedVeramoKeyType(): TKeyType {
    return 'Secp256k1'
  }

  getSuiteForSigning(
    key: IKey,
    did: string,
    verifiableMethodId: string,
    context: IAgentContext<RequiredAgentMethods>,
  ): any {
    return new EcdsaSecp256k1RecoverySignature2020({
      algorithm: 'ES256K-R',
      verificationMethod: verifiableMethodId,
      sign: kmsJwsSigner(context, key.kid, 'ES256K-R'),
    })
  }

  getSuiteForVerification(): any {
    return new EcdsaSecp256k1RecoverySignature2020()
  }

  preSigningCredModification(credential: CredentialPayload): void {}

  async preDidResolutionModification(didUrl: string, didDoc: DIDDocument): Promise<DIDDocument> {
    const ctx = asArray(didDoc['@context'])
    const legacyContext =
      'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld'
    const unstableContext = 'https://w3id.org/security/v3-unstable'

    //  Old did:ethr resolvers would return a broken context link
    const idx = ctx.indexOf(legacyContext)
    if (idx !== -1) {
      ctx[idx] = this.getContext()
    }

    // this verification suite does not support both https://w3id.org/security/suites/secp256k1recovery-2020/v2 and
    // https://w3id.org/security/v3-unstable as DID document @context, complaining that the `blockchainAccountId` is
    // being redefined.
    if (intersect(ctx, [unstableContext, this.getContext()]).length == 2) {
      ctx.splice(ctx.indexOf(unstableContext), 1)
    }
    didDoc['@context'] = ctx

    if (didUrl.toLowerCase().startsWith('did:ethr')) {
      //EcdsaSecp256k1RecoveryMethod2020 does not support older format blockchainAccountId
      didDoc.verificationMethod?.forEach((x) => {
        if (x.blockchainAccountId) {
          if (x.blockchainAccountId.lastIndexOf('@eip155:') !== -1) {
            const [address, chain] = x.blockchainAccountId.split('@eip155:')
            x.blockchainAccountId = `eip155:${chain}:${address}`
          }
        }
      })
    }
    return didDoc
  }

  getContext(): string {
    return CONTEXT
  }
}
