import jsonldSignatures from 'jsonld-signatures'
import { sha256 } from '@noble/hashes/sha2'
import { asArray, bytesToHex, concat, stringToUtf8Bytes } from '@veramo/utils'
import type { VerificationMethod } from 'did-resolver'

const { LinkedDataSignature } = jsonldSignatures.suites

/**
 * rdf-canonize's `MessageDigest` interface over a pure-JS SHA-256. rdf-canonize and jsonld-signatures
 * default to WebCrypto (`crypto.subtle.digest`), which React Native does not ship.
 */
class Sha256MessageDigest {
  private content = ''

  update(msg: string) {
    this.content += msg
  }

  async digest(): Promise<string> {
    return bytesToHex(sha256(stringToUtf8Bytes(this.content)))
  }
}

/**
 * The base of the Linked Data signature suites implemented in this package, on top of
 * `jsonld-signatures`' `LinkedDataSignature` (RDFC-1.0 canonicalization in safe mode; the verify data is
 * `sha256(c14n(proof options)) || sha256(c14n(document))`). It differs from the upstream base only in
 * how it gets there, never in the bytes:
 *
 * - hashing is pure JS (`@noble/hashes`) instead of WebCrypto, so no `crypto.subtle` is needed;
 * - the verification method is taken from the DID document returned by Veramo's document loader instead
 *   of being re-framed with the security v2 context, and its type is checked against the suite's list.
 *
 * Controller and proof-purpose checks still run in `jsonld-signatures`' proof purposes.
 *
 * @internal
 */
export abstract class VeramoLinkedDataSignature extends LinkedDataSignature {
  readonly verificationMethodTypes: string[]

  protected constructor(options: {
    type: string
    contextUrl?: string
    /** verification method types accepted when verifying */
    verificationMethodTypes: string[]
    /** only for signing */
    verificationMethod?: string
  }) {
    super({
      type: options.type,
      contextUrl: options.contextUrl,
      canonizeOptions: { createMessageDigest: () => new Sha256MessageDigest() },
    })
    this.verificationMethodTypes = options.verificationMethodTypes
    if (options.verificationMethod) this.verificationMethod = options.verificationMethod
  }

  async createVerifyData({
    document,
    proof,
    documentLoader,
  }: {
    document: any
    proof: any
    documentLoader: any
  }) {
    const [c14nProofOptions, c14nDocument] = await Promise.all([
      this.canonizeProof(proof, { document, documentLoader }),
      this.canonize(document, { documentLoader }),
    ])
    return concat([sha256(stringToUtf8Bytes(c14nProofOptions)), sha256(stringToUtf8Bytes(c14nDocument))])
  }

  /**
   * Dereferences `proof.verificationMethod` through the document loader and returns the verification method
   * object (with an absolute `id` and `controller`). Veramo's document loader returns either the DID document or,
   * for some suites, the verification method itself.
   */
  async getVerificationMethod({ proof, documentLoader }: { proof: any; documentLoader: any }) {
    const id =
      typeof proof.verificationMethod === 'object' ? proof.verificationMethod.id : proof.verificationMethod
    if (!id) throw new Error('invalid_proof: No "verificationMethod" found in proof.')
    const { document } = await documentLoader(id)
    const vm = findVerificationMethod(document, id)
    if (!vm) throw new Error(`invalid_proof: Verification method ${id} not found.`)
    if (!this.verificationMethodTypes.includes(vm.type)) {
      throw new Error(`invalid_proof: ${this.type} does not support verification method type ${vm.type}`)
    }
    if ((vm as any).revoked !== undefined) {
      throw new Error('invalid_proof: The verification method has been revoked.')
    }
    return vm
  }
}

function findVerificationMethod(document: any, id: string): VerificationMethod | undefined {
  if (!document || typeof document !== 'object') return undefined
  const absolute = (ref: string) => (ref.startsWith('#') ? `${document.id}${ref}` : ref)
  if (typeof document.id === 'string' && absolute(document.id) === id && document.type) {
    return { ...document, id }
  }
  const candidates = ['verificationMethod', 'assertionMethod', 'authentication', 'publicKey']
    .flatMap((prop) => asArray(document[prop]))
    .filter((x: any) => typeof x?.id === 'string')
  const vm = candidates.find((x: any) => absolute(x.id) === id)
  if (!vm) return undefined
  // a VM without a controller is controlled by the document it is embedded in
  return { ...vm, id, controller: typeof vm.controller === 'string' ? absolute(vm.controller) : document.id }
}
