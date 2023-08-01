import { AESKW } from '@stablelib/aes-kw'
import type { EncryptionResult, KeyWrapper } from 'did-jwt'

/**
 * Creates a wrapper using AES-KW
 * @param wrappingKey
 */
export const a256KeyWrapper: KeyWrapper = {
  from: (wrappingKey: Uint8Array) => {
    const wrap = async (cek: Uint8Array): Promise<EncryptionResult> => {
      return { ciphertext: new AESKW(wrappingKey).wrapKey(cek) }
    }
    return { wrap }
  },

  alg: 'A256KW',
}

export function a256KeyUnwrapper(wrappingKey: Uint8Array) {
  const unwrap = async (wrappedCek: Uint8Array): Promise<Uint8Array | null> => {
    try {
      return new AESKW(wrappingKey).unwrapKey(wrappedCek)
    } catch (e) {
      return null
    }
  }
  return { unwrap, alg: 'A256KW' }
}
