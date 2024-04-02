import { bytesToBase64, concat, encodeJoseBlob, hexToBytes, stringToUtf8Bytes } from '@veramo/utils'
import { RequiredAgentMethods, VeramoLdSignature } from '../ld-suites.js'
import { CredentialPayload, DIDDocument, IAgentContext, IKey, TKeyType } from '@veramo/core-types'
import { Ed25519Signature2018, Ed25519VerificationKey2018 } from '@transmute/ed25519-signature-2018'

/**
 * Veramo wrapper for the Ed25519Signature2018 suite by Transmute Industries
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export class VeramoEd25519Signature2018 extends VeramoLdSignature {
  getSupportedVerificationType(): string[] {
    return ['Ed25519VerificationKey2018', 'JsonWebKey2020']
    // TODO: add support for ['Ed25519VerificationKey2020', 'Multikey']
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
    const controller = issuerDid

    // DID Key ID
    let id = verificationMethodId

    const signer = {
      // returns a JWS detached
      sign: async (args: { data: Uint8Array }): Promise<string> => {
        const header = {
          alg: 'EdDSA',
          b64: false,
          crit: ['b64'],
        }
        const headerString = encodeJoseBlob(header)
        const messageBuffer = concat([stringToUtf8Bytes(`${headerString}.`), args.data])
        const messageString = bytesToBase64(messageBuffer)
        const signature = await context.agent.keyManagerSign({
          keyRef: key.kid,
          algorithm: 'EdDSA',
          data: messageString,
          encoding: 'base64',
        })
        return `${headerString}..${signature}`
      },
    }

    const verificationKey = new Ed25519VerificationKey2018({
      id,
      controller,
      publicKey: hexToBytes(key.publicKeyHex),
      signer: () => signer,
      type: 'Ed25519VerificationKey2018',
    })
    // overwrite the signer since we're not passing the private key and transmute doesn't support that behavior
    verificationKey.signer = () => signer as any

    return new Ed25519Signature2018({
      key: verificationKey,
      signer: signer,
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
