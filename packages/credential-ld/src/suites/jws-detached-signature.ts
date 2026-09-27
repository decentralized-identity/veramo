import jsonldSignatures from 'jsonld-signatures'
import { ed25519 } from '@noble/curves/ed25519'
import { p256 } from '@noble/curves/p256'
import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 } from '@noble/hashes/sha2'
import {
  asArray,
  base64ToBytes,
  bytesToBase64,
  concat,
  decodeJoseBlob,
  encodeJoseBlob,
  extractPublicKeyHex,
  getEthereumAddress,
  hexToBytes,
  stringToUtf8Bytes,
} from '@veramo/utils'
import type { VerificationMethod } from 'did-resolver'
import type { IAgentContext, IKeyManager } from '@veramo/core-types'

const { LinkedDataSignature } = jsonldSignatures.suites

/** The JWS algorithms a {@link JwsDetachedSignature} can sign or verify. */
export type JwsAlgorithm = 'EdDSA' | 'ES256K' | 'ES256K-R' | 'ES256'

/**
 * Signs the JWS signing input and returns the base64url encoded signature.
 * Veramo passes the signing input through `keyManagerSign`, so the private key never leaves the KMS.
 */
export type JwsSign = (signingInput: Uint8Array) => Promise<string>

/**
 * A Linked Data signature whose proof value is a detached JWS with an unencoded payload
 * (RFC 7797, `{"b64": false, "crit": ["b64"]}`), carried in `proof.jws`.
 *
 * This is the shape shared by Ed25519Signature2018, JsonWebSignature2020 and
 * EcdsaSecp256k1RecoverySignature2020: canonicalization and hashing come from
 * `jsonld-signatures`' `LinkedDataSignature` (the verify data is
 * `sha256(c14n(proof options)) || sha256(c14n(document))`), and the suite only adds the JWS
 * envelope and the key checks.
 *
 * @internal
 */
export class JwsDetachedSignature extends LinkedDataSignature {
  readonly algorithms: JwsAlgorithm[]
  readonly verificationMethodTypes: string[]
  private readonly signFn?: JwsSign
  private readonly signingAlgorithm?: JwsAlgorithm

  constructor(options: {
    type: string
    contextUrl?: string
    /** algorithms accepted when verifying */
    algorithms: JwsAlgorithm[]
    /** verification method types accepted when verifying */
    verificationMethodTypes: string[]
    /** only for signing */
    signer?: { algorithm: JwsAlgorithm; verificationMethod: string; sign: JwsSign }
  }) {
    super({ type: options.type, contextUrl: options.contextUrl })
    this.algorithms = options.algorithms
    this.verificationMethodTypes = options.verificationMethodTypes
    if (options.signer) {
      this.verificationMethod = options.signer.verificationMethod
      this.signingAlgorithm = options.signer.algorithm
      this.signFn = options.signer.sign
    }
  }

  async sign({ verifyData, proof }: { verifyData: Uint8Array; proof: any }) {
    if (!this.signFn || !this.signingAlgorithm) {
      throw new Error('invalid_setup: this suite instance has no signer')
    }
    const header = encodeJoseBlob({ alg: this.signingAlgorithm, b64: false, crit: ['b64'] })
    const signature = await this.signFn(signingInput(header, verifyData))
    proof.jws = `${header}..${signature}`
    return proof
  }

  async verifySignature({
    verifyData,
    verificationMethod,
    proof,
  }: {
    verifyData: Uint8Array
    verificationMethod: VerificationMethod
    proof: any
  }): Promise<boolean> {
    const [header, payload, signature, ...rest] = String(proof.jws ?? '').split('.')
    if (!header || payload !== '' || !signature || rest.length > 0) {
      throw new Error('invalid_signature: proof.jws is not a detached JWS')
    }
    const { alg, b64, crit } = decodeJoseBlob(header)
    if (b64 !== false || !Array.isArray(crit) || !crit.includes('b64')) {
      throw new Error('invalid_signature: proof.jws must use an unencoded payload (b64: false)')
    }
    if (!this.algorithms.includes(alg)) {
      throw new Error(`invalid_signature: alg ${alg} is not supported by ${this.type}`)
    }
    return verifyJws(alg, signingInput(header, verifyData), base64ToBytes(signature), verificationMethod)
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

function signingInput(encodedHeader: string, verifyData: Uint8Array): Uint8Array {
  return concat([stringToUtf8Bytes(`${encodedHeader}.`), verifyData])
}

function findVerificationMethod(document: any, id: string): VerificationMethod | undefined {
  if (!document || typeof document !== 'object') return undefined
  const absolute = (ref: string) => (ref.startsWith('#') ? `${document.id}${ref}` : ref)
  if (document.id && absolute(document.id) === id && document.type) {
    return { ...document, id }
  }
  const candidates = ['verificationMethod', 'assertionMethod', 'authentication', 'publicKey']
    .flatMap((prop) => asArray(document[prop]))
    .filter((x: any) => typeof x === 'object')
  const vm = candidates.find((x: any) => absolute(x.id) === id)
  if (!vm) return undefined
  return { ...vm, id, controller: vm.controller ? absolute(vm.controller) : document.id }
}

const PUBLIC_KEY_PROPERTIES = [
  'publicKeyHex',
  'publicKeyBase58',
  'publicKeyBase64',
  'publicKeyJwk',
  'publicKeyMultibase',
]

/** The public key a verification method carries, if any (an address-only VM carries none). */
function publicKeyOf(vm: VerificationMethod): { publicKeyHex: string; keyType?: string } | undefined {
  if (!PUBLIC_KEY_PROPERTIES.some((p) => (vm as any)[p])) return undefined
  const { publicKeyHex, keyType } = extractPublicKeyHex(vm)
  return publicKeyHex ? { publicKeyHex: publicKeyHex.toLowerCase(), keyType } : undefined
}

function verifyJws(
  alg: JwsAlgorithm,
  data: Uint8Array,
  signature: Uint8Array,
  vm: VerificationMethod,
): boolean {
  const key = publicKeyOf(vm)
  switch (alg) {
    case 'EdDSA':
      return key?.keyType === 'Ed25519' && ed25519.verify(signature, data, hexToBytes(key.publicKeyHex))
    case 'ES256':
      return (
        key?.keyType === 'P-256' &&
        p256.verify(signature.slice(0, 64), sha256(data), hexToBytes(key.publicKeyHex))
      )
    case 'ES256K':
      return (
        key?.keyType === 'Secp256k1' &&
        secp256k1.verify(signature.slice(0, 64), sha256(data), hexToBytes(key.publicKeyHex), { lowS: false })
      )
    case 'ES256K-R': {
      if (signature.length !== 65) return false
      const recovered = secp256k1.Signature.fromCompact(signature.slice(0, 64))
        .addRecoveryBit(signature[64] % 27)
        .recoverPublicKey(sha256(data))
      // a VM that carries a public key must match it; an address-only VM must match the recovered address
      if (key) return key.keyType === 'Secp256k1' && recovered.toHex(true) === key.publicKeyHex
      const address = getEthereumAddress(vm)
      const recoveredAddress = getEthereumAddress({
        id: '',
        controller: '',
        type: 'EcdsaSecp256k1VerificationKey2019',
        publicKeyHex: recovered.toHex(false),
      })
      return !!address && address === recoveredAddress
    }
    default:
      return false
  }
}

/**
 * Returns a {@link JwsSign} that signs with the agent's `keyManagerSign`, so the private key stays in the KMS.
 * @internal
 */
export function kmsJwsSigner(
  context: IAgentContext<Pick<IKeyManager, 'keyManagerSign'>>,
  keyRef: string,
  algorithm: JwsAlgorithm,
): JwsSign {
  return (signingInput) =>
    context.agent.keyManagerSign({ keyRef, algorithm, data: bytesToBase64(signingInput), encoding: 'base64' })
}
