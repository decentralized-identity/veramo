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
import { ed25519 } from '@noble/curves/ed25519'
import {
  asArray,
  base58ToBytes,
  base64ToBytes,
  bytesToBase58,
  bytesToMultibase,
  extractPublicKeyHex,
  hexToBytes,
} from '@veramo/utils'
import { VeramoLinkedDataSignature } from './linked-data-signature.js'
import { kmsJwsSigner, publicKeyOf } from './jws-detached-signature.js'
import { VerificationMethod } from 'did-resolver'

import Debug from 'debug'

const debug = Debug('veramo:credential-ld:Ed25519Signature2020')

const CONTEXT = 'https://w3id.org/security/suites/ed25519-2020/v1'
const VERIFICATION_METHOD_TYPES = ['Ed25519VerificationKey2020', 'Ed25519VerificationKey2018', 'Multikey']

/**
 * The Ed25519Signature2020 Linked Data suite: an Ed25519 signature over the verify data, carried in
 * `proof.proofValue` as a base58btc multibase string (`z...`). Same wire format and checks as
 * `@digitalbazaar/ed25519-signature-2020`.
 */
class Ed25519Signature2020 extends VeramoLinkedDataSignature {
  private readonly signFn?: (data: Uint8Array) => Promise<Uint8Array>

  constructor(signer?: { verificationMethod: string; sign: (data: Uint8Array) => Promise<Uint8Array> }) {
    super({
      type: 'Ed25519Signature2020',
      contextUrl: CONTEXT,
      verificationMethodTypes: VERIFICATION_METHOD_TYPES,
      verificationMethod: signer?.verificationMethod,
    })
    this.signFn = signer?.sign
  }

  async sign({ verifyData, proof }: { verifyData: Uint8Array; proof: any }) {
    if (!this.signFn) throw new Error('invalid_setup: this suite instance has no signer')
    proof.proofValue = 'z' + bytesToBase58(await this.signFn(verifyData))
    return proof
  }

  async verifySignature({ verifyData, verificationMethod, proof }: any): Promise<boolean> {
    const { proofValue } = proof
    if (typeof proofValue !== 'string' || proofValue[0] !== 'z') {
      throw new Error('invalid_signature: proofValue must be a base58btc multibase string')
    }
    const key = publicKeyOf(verificationMethod)
    return (
      key?.keyType === 'Ed25519' &&
      ed25519.verify(base58ToBytes(proofValue.slice(1)), verifyData, hexToBytes(key.publicKeyHex))
    )
  }

  async matchProof(options: any): Promise<boolean> {
    // this suite's terms (proofValue, ...) are defined by its context
    const context = asArray(options.document['@context'])
    return context.includes(CONTEXT) && super.matchProof(options)
  }
}

/**
 * Veramo wrapper for the Ed25519Signature2020 suite
 *
 * @alpha This API is experimental and is very likely to change or disappear in future releases without notice.
 */
export class VeramoEd25519Signature2020 extends VeramoLdSignature {
  getSupportedVerificationType(): string[] {
    return ['Ed25519VerificationKey2020', 'Ed25519VerificationKey2018']
    // TODO: add support for ['JsonWebKey2020', 'Multikey']
  }

  getSupportedProofType(): string {
    return 'Ed25519Signature2020'
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
    const sign = kmsJwsSigner(context, key.kid, 'EdDSA')
    return new Ed25519Signature2020({
      verificationMethod: verificationMethodId,
      sign: async (data) => base64ToBytes(await sign(data)),
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
