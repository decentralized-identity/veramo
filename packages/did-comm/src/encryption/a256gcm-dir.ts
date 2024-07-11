import type { Decrypter, Encrypter, EncryptionResult, ProtectedHeader } from 'did-jwt'
import { gcm } from '@noble/ciphers/aes'
import { randomBytes } from '@noble/hashes/utils'
import { bytesToBase64url, encodeBase64url } from '@veramo/utils'
import { fromString } from 'uint8arrays/from-string'

function createA256GCMEncrypter(
  key: Uint8Array,
): (cleartext: Uint8Array, aad?: Uint8Array) => EncryptionResult {
  return (cleartext: Uint8Array, aad?: Uint8Array) => {
    const iv = randomBytes(gcm.nonceLength)
    const sealed = gcm(key, iv, aad).encrypt(cleartext)
    return {
      ciphertext: sealed.subarray(0, sealed.length - gcm.tagLength),
      tag: sealed.subarray(sealed.length - gcm.tagLength),
      iv,
    }
  }
}

export function a256gcmDirEncrypter(key: Uint8Array): Encrypter {
  const enc = 'A256GCM'
  const alg = 'dir'

  async function encrypt(
    cleartext: Uint8Array,
    protectedHeader: ProtectedHeader = {},
    aad?: Uint8Array,
  ): Promise<EncryptionResult> {
    const protHeader = encodeBase64url(JSON.stringify(Object.assign({ alg }, protectedHeader, { enc })))
    const encodedAad = fromString(aad ? `${protHeader}.${bytesToBase64url(aad)}` : protHeader, 'utf-8')
    return {
      ...createA256GCMEncrypter(key)(cleartext, encodedAad),
      protectedHeader: protHeader,
    }
  }

  return { alg, enc, encrypt }
}

export function a256gcmDirDecrypter(key: Uint8Array): Decrypter {

  async function decrypt(sealed: Uint8Array, iv: Uint8Array, aad?: Uint8Array): Promise<Uint8Array | null> {
    return gcm(key, iv, aad).decrypt(sealed)
  }

  return { alg: 'dir', enc: 'A256GCM', decrypt }
}
