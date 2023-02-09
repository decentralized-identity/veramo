import { RequiredAgentMethods, VeramoLdSignature } from '../ld-suites.js'
import { CredentialPayload, DIDDocument, IAgentContext, IKey, TKeyType } from '@veramo/core-types'
import * as u8a from 'uint8arrays'
import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020'
import { Ed25519VerificationKey2020 } from '@digitalcredentials/ed25519-verification-key-2020'

/**
 * Veramo wrapper for the Ed25519Signature2020 suite by digitalcredentials
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export class VeramoEd25519Signature2020 extends VeramoLdSignature {
  private readonly MULTIBASE_BASE58BTC_PREFIX = 'z'
  private readonly MULTICODEC_PREFIX = [0xed, 0x01]

  getSupportedVerificationType(): string {
    return 'Ed25519VerificationKey2020'
  }

  getSupportedVeramoKeyType(): TKeyType {
    return 'Ed25519'
  }

  getSuiteForSigning(
    key: IKey,
    issuerDid: string,
    verificationMethodId: string,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<any> {
    const controller = issuerDid

    // DID Key ID
    let id = verificationMethodId

    const signer = {
      // returns signatureBytes
      sign: async (args: { data: Uint8Array }): Promise<Uint8Array> => {
        const messageString = u8a.toString(args.data, 'base64')
        const signature = await context.agent.keyManagerSign({
          keyRef: key.kid,
          data: messageString,
          encoding: 'base64',
        })
        return u8a.fromString(signature)
      },
    }

    const verificationKey = new Ed25519VerificationKey2020({
      id,
      controller,
      publicKeyMultibase: this.preSigningKeyModification(u8a.fromString(key.publicKeyHex, 'hex')),
      // signer: () => signer,
      // type: this.getSupportedVerificationType(),
    })
    // overwrite the signer since we're not passing the private key
    verificationKey.signer = () => signer as any
    verificationKey.type = this.getSupportedVerificationType()
    return new Ed25519Signature2020({
      key: verificationKey,
      signer: signer,
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

  preSigningKeyModification(key: Uint8Array): string {
    const modifiedKey = u8a.concat([this.MULTICODEC_PREFIX, key])
    return `${this.MULTIBASE_BASE58BTC_PREFIX}${u8a.toString(modifiedKey, 'base58btc')}`
  }
}
