import type { Decrypter, KeyWrapper, WrappingResult } from 'did-jwt'
import { randomBytes } from '@noble/hashes/utils'
import { concat } from '@veramo/utils'
import { XChaCha20Poly1305 } from '@stablelib/xchacha20poly1305'

export const xc20pKeyWrapper: KeyWrapper = {
  from: (wrappingKey: Uint8Array) => {
    const cipher = new XChaCha20Poly1305(wrappingKey)
    const wrap = async (cek: Uint8Array): Promise<WrappingResult> => {
      const iv = randomBytes(cipher.nonceLength)
      const sealed = cipher.seal(iv, cek)
      return {
        ciphertext: sealed.subarray(0, sealed.length - cipher.tagLength),
        tag: sealed.subarray(sealed.length - cipher.tagLength),
        iv,
      }
    }
    return { wrap }
  },

  alg: 'XC20PKW',
}

export function xc20pDecrypter(key: Uint8Array): Decrypter {
  const cipher = new XChaCha20Poly1305(key)

  async function decrypt(sealed: Uint8Array, iv: Uint8Array, aad?: Uint8Array): Promise<Uint8Array | null> {
    return cipher.open(iv, sealed, aad)
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
