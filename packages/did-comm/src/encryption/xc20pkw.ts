import type { Decrypter, KeyWrapper, WrappingResult } from 'did-jwt'
import { randomBytes } from '@noble/hashes/utils'
import { concat } from '@veramo/utils'
import { xchacha20poly1305 } from '@noble/ciphers/chacha'

export const xc20pKeyWrapper: KeyWrapper = {
  from: (wrappingKey: Uint8Array) => {
    const wrap = async (cek: Uint8Array): Promise<WrappingResult> => {
      const iv = randomBytes(xchacha20poly1305.nonceLength)
      const cipher = xchacha20poly1305(wrappingKey, iv)
      const sealed = cipher.encrypt(cek)
      return {
        ciphertext: sealed.subarray(0, sealed.length - xchacha20poly1305.tagLength),
        tag: sealed.subarray(sealed.length - xchacha20poly1305.tagLength),
        iv,
      }
    }
    return { wrap }
  },

  alg: 'XC20PKW',
}

export function xc20pDecrypter(key: Uint8Array): Decrypter {

  async function decrypt(sealed: Uint8Array, iv: Uint8Array, aad?: Uint8Array): Promise<Uint8Array | null> {
    const cipher = xchacha20poly1305(key, iv, aad)
    return cipher.decrypt(sealed)
  }

  return { alg: 'dir', enc: 'XC20P', decrypt }
}

export function xc20pKeyUnwrapper(wrappingKey: Uint8Array) {
  const unwrap = async (
    wrappedCek: Uint8Array,
    iv: Uint8Array,
    tag: Uint8Array,
  ): Promise<Uint8Array | null> => {
    try {
      const sealed = concat([wrappedCek, tag])
      return xc20pDecrypter(wrappingKey).decrypt(sealed, iv)
    } catch (e) {
      return null
    }
  }
  return { unwrap, alg: 'XC20PKW' }
}
