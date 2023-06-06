import crypto from 'isomorphic-webcrypto'
import { randomBytes } from '@noble/hashes/utils'
import { base64ToBytes, bytesToBase64url, concat, encodeBase64url } from '@veramo/utils'
import { Decrypter, Encrypter, EncryptionResult, ProtectedHeader } from 'did-jwt'
import { fromString } from 'uint8arrays/from-string'

const MAX_INT32 = 2 ** 32

function writeUInt32BE(buf: Uint8Array, value: number, offset?: number) {
  if (value < 0 || value >= MAX_INT32) {
    throw new RangeError(`value must be >= 0 and <= ${MAX_INT32 - 1}. Received ${value}`)
  }
  buf.set([value >>> 24, value >>> 16, value >>> 8, value & 0xff], offset)
}

function uint64be(value: number) {
  const high = Math.floor(value / MAX_INT32)
  const low = value % MAX_INT32
  const buf = new Uint8Array(8)
  writeUInt32BE(buf, high, 0)
  writeUInt32BE(buf, low, 4)
  return buf
}

/**
 * Code copied and adapted from https://github.com/panva/jose
 * @param enc - the JWE content encryption algorithm (e.g. A256CBC-HS512)
 * @param plaintext - the content to encrypt
 * @param cek - the raw content encryption key
 * @param providedIV - optional provided Initialization Vector
 * @param aad - optional additional authenticated data
 */
async function cbcEncrypt(
  enc: string = 'A256CBC-HS512',
  plaintext: Uint8Array,
  cek: Uint8Array,
  providedIV?: Uint8Array,
  aad: Uint8Array = new Uint8Array(0),
) {
  // A256CBC-HS512 CEK size should be 512 bits; first 256 bits are used for HMAC with SHA-512 and the rest for AES-CBC
  const keySize = parseInt(enc.slice(1, 4), 10)
  const encKey = await crypto.subtle.importKey('raw', cek.subarray(keySize >> 3), 'AES-CBC', false, [
    'encrypt',
  ])
  const macKey = await crypto.subtle.importKey(
    'raw',
    cek.subarray(0, keySize >> 3),
    {
      hash: `SHA-${keySize << 1}`,
      name: 'HMAC',
    },
    false,
    ['sign'],
  )

  if (providedIV && providedIV.length !== keySize >> 4) {
    throw new Error(`illegal_argument: Invalid IV size, expected ${keySize >> 4}, got ${providedIV.length}`)
  }
  const iv = providedIV ?? randomBytes(keySize >> 4)

  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      {
        iv,
        name: 'AES-CBC',
      },
      encKey,
      plaintext,
    ),
  )

  const macData = concat([aad, iv, ciphertext, uint64be(aad.length << 3)])
  const tag = new Uint8Array((await crypto.subtle.sign('HMAC', macKey, macData)).slice(0, keySize >> 3))

  return { enc: 'dir', ciphertext, tag, iv }
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false
  }
  let result = 0
  let len = a.length
  for (let i = 0; i < len; i++) {
    result |= a[i] ^ b[i]
  }
  return result === 0
}

async function cbcDecrypt(
  enc: string = 'A256CBC-HS512',
  cek: Uint8Array,
  ciphertext: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
  aad: Uint8Array,
) {
  const keySize = parseInt(enc.slice(1, 4), 10)
  const encKey = await crypto.subtle.importKey('raw', cek.subarray(keySize >> 3), 'AES-CBC', false, [
    'decrypt',
  ])
  const macKey = await crypto.subtle.importKey(
    'raw',
    cek.subarray(0, keySize >> 3),
    {
      hash: `SHA-${keySize << 1}`,
      name: 'HMAC',
    },
    false,
    ['sign'],
  )

  const macData = concat([aad, iv, ciphertext, uint64be(aad.length << 3)])
  const expectedTag = new Uint8Array(
    (await crypto.subtle.sign('HMAC', macKey, macData)).slice(0, keySize >> 3),
  )

  let macCheckPassed!: boolean
  try {
    macCheckPassed = timingSafeEqual(tag, expectedTag)
  } catch {
    //
  }
  if (!macCheckPassed) {
    // current JWE decryption pipeline tries to decrypt multiple times with different keys, so return null instead of
    // throwing an error
    return null
    // throw new Error('jwe_decryption_failed: MAC check failed')
  }

  let plaintext: Uint8Array | null = null
  try {
    plaintext = new Uint8Array(await crypto.subtle.decrypt({ iv, name: 'AES-CBC' }, encKey, ciphertext))
  } catch (e: any) {
    // current JWE decryption pipeline tries to decrypt multiple times with different keys, so return null instead of
    // throwing an error
  }

  return plaintext
}

export function a256cbcHs512DirDecrypter(key: Uint8Array): Decrypter {
  // const cipher = new GCM(new AES(key))

  async function decrypt(sealed: Uint8Array, iv: Uint8Array, aad?: Uint8Array): Promise<Uint8Array | null> {
    // did-jwt#decryptJWE combines the ciphertext and the tag into a single `sealed` array
    const TAG_LENGTH = 32
    const ciphertext = sealed.subarray(0, sealed.length - TAG_LENGTH)
    const tag = sealed.subarray(sealed.length - TAG_LENGTH)
    return cbcDecrypt('A256CBC-HS512', key, ciphertext, iv, tag, aad ?? new Uint8Array(0))
  }

  return { alg: 'dir', enc: 'A256GCM', decrypt }
}

export function a256cbcHs512DirEncrypter(cek: Uint8Array): Encrypter {
  const enc = 'A256CBC-HS512'
  const alg = 'dir'

  async function encrypt(
    cleartext: Uint8Array,
    protectedHeader: ProtectedHeader = {},
    aad?: Uint8Array,
  ): Promise<EncryptionResult> {
    const protHeader = encodeBase64url(JSON.stringify(Object.assign({ alg }, protectedHeader, { enc })))
    const encodedAad = fromString(aad ? `${protHeader}.${bytesToBase64url(aad)}` : protHeader, 'utf-8')
    const iv: Uint8Array | undefined = protectedHeader.iv ? base64ToBytes(protectedHeader.iv) : undefined
    return {
      ...(await cbcEncrypt('A256CBC-HS512', cleartext, cek, iv, encodedAad)),
      protectedHeader: protHeader,
    }
  }

  return { alg, enc, encrypt }
}
