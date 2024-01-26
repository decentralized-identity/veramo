import { RequiredAgentMethods, VeramoLdSignature } from '../ld-suites.js'
import { CredentialPayload, DIDDocument, IAgentContext, IKey, TKeyType } from '@veramo/core-types'
import ldsEcdsa from '@veramo-community/lds-ecdsa-secp256k1-recovery2020'
import { asArray, bytesToBase64, concat, encodeJoseBlob, intersect, stringToUtf8Bytes } from '@veramo/utils'

const { EcdsaSecp256k1RecoveryMethod2020, EcdsaSecp256k1RecoverySignature2020 } = ldsEcdsa

/**
 * Veramo wrapper for the EcdsaSecp256k1RecoverySignature2020 suite by Transmute Industries
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export class VeramoEcdsaSecp256k1RecoverySignature2020 extends VeramoLdSignature {
  getSupportedVerificationType(): string {
    return 'EcdsaSecp256k1RecoveryMethod2020'
    // TODO: add support for ['EcdsaSecp256k1VerificationKey2020', 'EcdsaSecp256k1VerificationKey2019',
    // 'JsonWebKey2020', 'Multikey']
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
    const controller = did
    const signer = {
      //returns a JWS detached
      sign: async (args: { data: Uint8Array }): Promise<string> => {
        const header = {
          alg: 'ES256K-R',
          b64: false,
          crit: ['b64'],
        }
        const headerString = encodeJoseBlob(header)
        const messageBuffer = concat([stringToUtf8Bytes(`${headerString}.`), args.data])
        const messageString = bytesToBase64(messageBuffer)
        const signature = await context.agent.keyManagerSign({
          keyRef: key.kid,
          algorithm: 'ES256K-R',
          data: messageString,
          encoding: 'base64',
        })
        return `${headerString}..${signature}`
      },
    }

    const suite = new EcdsaSecp256k1RecoverySignature2020({
      // signer,
      key: new EcdsaSecp256k1RecoveryMethod2020({
        publicKeyHex: key.publicKeyHex,
        signer: () => signer,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller,
        id: verifiableMethodId,
      }),
    })

    suite.ensureSuiteContext = ({ document }: { document: any; addSuiteContext: boolean }) => {
      document['@context'] = [...asArray(document['@context'] || []), this.getContext()]
    }

    return suite
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
    return 'https://w3id.org/security/suites/secp256k1recovery-2020/v2'
  }
}
