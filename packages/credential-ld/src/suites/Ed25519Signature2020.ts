import { encodeJoseBlob } from '@veramo/utils'
import { RequiredAgentMethods, VeramoLdSignature } from '../ld-suites'
import { CredentialPayload, DIDDocument, IAgentContext, IKey, TKeyType } from '@veramo/core'
import * as u8a from 'uint8arrays'
// @ts-ignore
import { Ed25519VerificationKey2020, Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020'

/**
 * Veramo wrapper for the Ed25519Signature2020 suite by Transmute Industries
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export class VeramoEd25519Signature2020 extends VeramoLdSignature {
  getSupportedVerificationType(): string {
    return 'Ed25519VerificationKey2020'
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
        const messageBuffer = u8a.concat([u8a.fromString(`${headerString}.`, 'utf-8'), args.data])
        const messageString = u8a.toString(messageBuffer, 'base64')
        const signature = await context.agent.keyManagerSign({
          keyRef: key.kid,
          algorithm: 'EdDSA',
          data: messageString,
          encoding: 'base64',
        })
        return `${headerString}..${signature}`
      },
    }

    const verificationKey = await Ed25519VerificationKey2020.from({
      id,
      controller,
      publicKeyMultibase: u8a.fromString(key.publicKeyHex, 'base16'),
      signer: ()=> signer,
      type: this.getSupportedVerificationType(),
    })
    // overwrite the signer since we're not passing the private key and transmute doesn't support that behavior
    verificationKey.signer = () => signer as any
    console.log(verificationKey)
    return new Ed25519Signature2020({
      key: verificationKey,
      signer: signer
    })
  }

  getSuiteForVerification(): any {
    return new Ed25519Signature2020()
  }

  preSigningCredModification(credential: CredentialPayload): void {
    // nothing to do here
  }

  preDidResolutionModification(didUrl: string, didDoc: DIDDocument): void {
    // nothing to do here
  }
}
