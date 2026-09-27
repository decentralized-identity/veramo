import { ed25519 } from '@noble/curves/ed25519'
import { p256 } from '@noble/curves/p256'
import { p384 } from '@noble/curves/p384'
import { p521 } from '@noble/curves/p521'
import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256, sha384, sha512 } from '@noble/hashes/sha2'
import {
  base64ToBytes,
  bytesToBase64,
  bytesToHex,
  concat,
  decodeJoseBlob,
  encodeJoseBlob,
  extractPublicKeyHex,
  getEthereumAddress,
  hexToBytes,
  stringToUtf8Bytes,
} from '@veramo/utils'
import { VeramoLinkedDataSignature } from './linked-data-signature.js'
import type { VerificationMethod } from 'did-resolver'
import type { IAgentContext, IKeyManager } from '@veramo/core-types'

/** The JWS algorithms a {@link JwsDetachedSignature} can sign or verify. */
export type JwsAlgorithm = 'EdDSA' | 'ES256K' | 'ES256K-R' | 'ES256' | 'ES384' | 'ES512'

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
 * EcdsaSecp256k1RecoverySignature2020. Canonicalization and hashing come from
 * {@link VeramoLinkedDataSignature}; this class adds the JWS envelope and the key checks.
 *
 * @internal
 */
export class JwsDetachedSignature extends VeramoLinkedDataSignature {
  readonly algorithms: JwsAlgorithm[]
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
    super({
      type: options.type,
      contextUrl: options.contextUrl,
      verificationMethodTypes: options.verificationMethodTypes,
      verificationMethod: options.signer?.verificationMethod,
    })
    this.algorithms = options.algorithms
    if (options.signer) {
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
    if (b64 !== false) {
      throw new Error('invalid_signature: proof.jws must use an unencoded payload (b64: false)')
    }
    // RFC 7515 section 4.1.11: unknown critical header parameters must be rejected
    if (!Array.isArray(crit) || crit.length !== 1 || crit[0] !== 'b64') {
      throw new Error('invalid_signature: proof.jws must have crit ["b64"]')
    }
    if (!this.algorithms.includes(alg)) {
      throw new Error(`invalid_signature: alg ${alg} is not supported by ${this.type}`)
    }
    return verifyJws(alg, signingInput(header, verifyData), base64ToBytes(signature), verificationMethod)
  }
}

function signingInput(encodedHeader: string, verifyData: Uint8Array): Uint8Array {
  return concat([stringToUtf8Bytes(`${encodedHeader}.`), verifyData])
}

const PUBLIC_KEY_PROPERTIES = [
  'publicKeyHex',
  'publicKeyBase58',
  'publicKeyBase64',
  'publicKeyJwk',
  'publicKeyMultibase',
]

/** The public key a verification method carries, if any (an address-only VM carries none). @internal */
export function publicKeyOf(vm: VerificationMethod): { publicKeyHex: string; keyType?: string } | undefined {
  if (!PUBLIC_KEY_PROPERTIES.some((p) => (vm as any)[p])) return undefined
  // P-384 / P-521 JWKs (P384Key2021, P521Key2021, JsonWebKey2020) are not covered by extractPublicKeyHex
  const jwk = vm.publicKeyJwk
  if (jwk?.kty === 'EC' && (jwk.crv === 'P-384' || jwk.crv === 'P-521') && jwk.x && jwk.y) {
    const hex = (b64url: string) =>
      bytesToHex(base64ToBytes(b64url)).padStart(jwk.crv === 'P-384' ? 96 : 132, '0')
    return { publicKeyHex: `04${hex(jwk.x)}${hex(jwk.y)}`, keyType: jwk.crv }
  }
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
        signature.length === 64 &&
        p256.verify(signature, sha256(data), hexToBytes(key.publicKeyHex))
      )
    case 'ES384':
      return (
        key?.keyType === 'P-384' &&
        signature.length === 96 &&
        p384.verify(signature, sha384(data), hexToBytes(key.publicKeyHex))
      )
    case 'ES512':
      return (
        key?.keyType === 'P-521' &&
        signature.length === 132 &&
        p521.verify(signature, sha512(data), hexToBytes(key.publicKeyHex))
      )
    case 'ES256K':
      return (
        key?.keyType === 'Secp256k1' &&
        signature.length === 64 &&
        secp256k1.verify(signature, sha256(data), hexToBytes(key.publicKeyHex), { lowS: false })
      )
    case 'ES256K-R': {
      // r || s || v, with v the recovery bit, optionally offset by 27 (Ethereum style)
      if (signature.length !== 65 || ![0, 1, 27, 28].includes(signature[64])) return false
      const recovered = secp256k1.Signature.fromCompact(signature.slice(0, 64))
        .addRecoveryBit(signature[64] % 27)
        .recoverPublicKey(sha256(data))
      // a VM that carries a public key must match it; an address-only VM must match the recovered address
      if (key) return key.keyType === 'Secp256k1' && recovered.toHex(true) === key.publicKeyHex
      const recoveredAddress = getEthereumAddress({
        id: '',
        controller: '',
        type: 'EcdsaSecp256k1VerificationKey2019',
        publicKeyHex: recovered.toHex(false),
      })
      return addressesOf(vm).includes(recoveredAddress ?? '')
    }
    default:
      return false
  }
}

/** Every Ethereum address an address-only verification method declares (lowercase). */
function addressesOf(vm: VerificationMethod): string[] {
  const addresses = [
    vm.ethereumAddress && getEthereumAddress({ ...vm, blockchainAccountId: undefined }),
    vm.blockchainAccountId && getEthereumAddress({ ...vm, ethereumAddress: undefined }),
  ]
  return addresses.filter((a): a is string => !!a)
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
