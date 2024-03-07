import { RequiredAgentMethods, VeramoLdSignature } from '../ld-suites.js'
import {
  CredentialPayload,
  DIDDocComponent,
  DIDDocument,
  IAgentContext,
  IKey,
  IResolver,
  TKeyType,
} from '@veramo/core-types'
import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020'
import { Ed25519VerificationKey2020 } from '@digitalcredentials/ed25519-verification-key-2020'
import {
  asArray,
  base64ToBytes,
  bytesToBase64,
  bytesToMultibase,
  extractPublicKeyHex,
  hexToBytes,
} from '@veramo/utils'
import { VerificationMethod } from 'did-resolver'

import Debug from 'debug'

const debug = Debug('veramo:credential-ld:Ed25519Signature2020')

/**
 * Veramo wrapper for the Ed25519Signature2020 suite by digitalcredentials
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export class VeramoEd25519Signature2020 extends VeramoLdSignature {
  getSupportedVerificationType(): string[] {
    return ['Ed25519VerificationKey2020', 'Ed25519VerificationKey2018']
    // TODO: add support for ['JsonWebKey2020', 'Multikey']
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
        const messageString = bytesToBase64(args.data)
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
      publicKeyMultibase: bytesToMultibase(hexToBytes(key.publicKeyHex), 'base58btc', 'ed25519-pub'),
      // signer: () => signer,
      // type: this.getSupportedVerificationType(),
    })
    // overwrite the signer since we're not passing the private key
    verificationKey.signer = () => signer as any
    verificationKey.type = 'Ed25519VerificationKey2020'
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

  async preDidResolutionModification(
    didUrl: string,
    doc: DIDDocument | Exclude<string, DIDDocComponent>,
    context: IAgentContext<IResolver>,
  ): Promise<DIDDocument | Exclude<string, DIDDocComponent>> {
    let document = doc
    // The verification method (key) must contain "https://w3id.org/security/suites/ed25519-2020/v1" context.
    if ((document as DIDDocument).verificationMethod) {
      document.verificationMethod = asArray(document.verificationMethod)?.map(
        this.transformVerificationMethod,
      )
    }

    // this signature suite requires the document loader to dereference the DID URL
    if (didUrl.includes('#') && didUrl !== document.id) {
      const contexts = (document as DIDDocument)['@context']
      try {
        let newDoc: any = (await context.agent.getDIDComponentById({
          didDocument: document,
          didUrl: didUrl,
        })) as Exclude<string, DIDDocComponent>

        // other signature suites require the full DID document, so as a workaround
        // we'll only return the 2020 verification method, even if the 2018 would also be compatible
        if (
          [
            'Ed25519VerificationKey2020',
            // 'Ed25519VerificationKey2018',
            // 'JsonWebKey2020'
          ].includes(newDoc.type)
        ) {
          newDoc['@context'] = [...new Set([...asArray(contexts), ...asArray(document['@context'])])]
          document = newDoc
        }
      } catch (e: any) {
        debug(`document loader could not locate DID component by fragment: ${didUrl}`)
      }
    }

    if ((document as VerificationMethod).type === 'Ed25519VerificationKey2020') {
      document = this.transformVerificationMethod(document as VerificationMethod)
    }

    return document
  }

  private transformVerificationMethod(vm: VerificationMethod): VerificationMethod {
    if (vm.type === 'Ed25519VerificationKey2020') {
      ;(vm as any)['@context'] = 'https://w3id.org/security/suites/ed25519-2020/v1'
      // publicKeyMultibase is required by this suite
      if (!vm.publicKeyMultibase) {
        const { publicKeyHex } = extractPublicKeyHex(vm)
        vm.publicKeyMultibase = bytesToMultibase(hexToBytes(publicKeyHex), 'base58btc', 'ed25519-pub')
      }
    }
    return vm
  }
}
