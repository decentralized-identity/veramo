import { RequiredAgentMethods, VeramoLdSignature } from '../ld-suites.js'
import { CredentialPayload, DIDDocComponent, DIDDocument, IAgentContext, IKey, TKeyType, } from '@veramo/core-types'
import * as u8a from 'uint8arrays'
import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020'
import { Ed25519VerificationKey2020 } from '@digitalcredentials/ed25519-verification-key-2020'
import { asArray, base64ToBytes, bytesToMultibase, extractPublicKeyHex, hexToBytes } from '@veramo/utils'
import { VerificationMethod } from 'did-resolver'

/**
 * Veramo wrapper for the Ed25519Signature2020 suite by digitalcredentials
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
          algorithm: 'EdDSA',
        })
        return base64ToBytes(signature)
      },
    }

    const verificationKey = new Ed25519VerificationKey2020({
      id,
      controller,
      publicKeyMultibase: bytesToMultibase(hexToBytes(key.publicKeyHex), "Ed25519"),
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

  preDidResolutionModification(didUrl: string, doc: DIDDocument | Exclude<string, DIDDocComponent>): void {
    // The verification method (key) must contain "https://w3id.org/security/suites/ed25519-2020/v1" context.
    if ((doc as DIDDocument).verificationMethod) {
      doc.verificationMethod = asArray(doc.verificationMethod)?.map(this.transformVerificationMethod)
    } else if ((doc as VerificationMethod).type === 'Ed25519VerificationKey2020') {
      this.transformVerificationMethod(doc as VerificationMethod)
    }
  }

  private transformVerificationMethod(vm: VerificationMethod): VerificationMethod {
    if (vm.type === 'Ed25519VerificationKey2020') {
      ;(vm as any)['@context'] = 'https://w3id.org/security/suites/ed25519-2020/v1'
      // publicKeyMultibase is required by this suite
      if (!vm.publicKeyMultibase) {
        const publicKeyHex = extractPublicKeyHex(vm)
        vm.publicKeyMultibase = bytesToMultibase(hexToBytes(publicKeyHex), 'Ed25519')
      }
    }
    return vm
  }
}
