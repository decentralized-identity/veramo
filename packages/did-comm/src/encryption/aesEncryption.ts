import type {
  AuthEncryptParams,
  Decrypter,
  ECDH,
  Encrypter,
  EncryptionResult,
  KeyWrapper,
  ProtectedHeader,
  Recipient,
} from 'did-jwt'
import {
  computeX25519Ecdh1PUv3Kek,
  computeX25519EcdhEsKek,
  createFullEncrypter,
  createX25519Ecdh1PUv3Kek,
  createX25519EcdhEsKek,
  xc20pDirDecrypter,
  xc20pDirEncrypter,
} from 'did-jwt'
import { randomBytes } from '@noble/hashes/utils'
import { AESKW } from '@stablelib/aes-kw'
import { AES } from '@stablelib/aes'
import { GCM } from '@stablelib/gcm'
import { fromString } from 'uint8arrays/from-string'
import { base64ToBytes, bytesToBase64url, encodeBase64url } from '@veramo/utils'

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

export function a256gcmEncrypter(
  key: Uint8Array,
): (cleartext: Uint8Array, aad?: Uint8Array) => EncryptionResult {
  const blockcipher = new AES(key)
  const cipher = new GCM(blockcipher)
  return (cleartext: Uint8Array, aad?: Uint8Array) => {
    const iv = randomBytes(cipher.nonceLength)
    const sealed = cipher.seal(iv, cleartext, aad)
    return {
      ciphertext: sealed.subarray(0, sealed.length - cipher.tagLength),
      tag: sealed.subarray(sealed.length - cipher.tagLength),
      iv,
    }
  }
}

export function a256gcmDirEncrypter(key: Uint8Array): Encrypter {
  const a256gcmEncrypt = a256gcmEncrypter(key)
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
      ...a256gcmEncrypt(cleartext, encodedAad),
      protectedHeader: protHeader,
    }
  }

  return { alg, enc, encrypt }
}

export function a256gcmDirDecrypter(key: Uint8Array): Decrypter {
  const cipher = new GCM(new AES(key))

  async function decrypt(sealed: Uint8Array, iv: Uint8Array, aad?: Uint8Array): Promise<Uint8Array | null> {
    return cipher.open(iv, sealed, aad)
  }

  return { alg: 'dir', enc: 'A256GCM', decrypt }
}

export function a256gcmAnonEncrypterX25519WithA256KW(
  recipientPublicKey: Uint8Array,
  kid?: string,
  apv?: string,
): Encrypter {
  return createFullEncrypter(
    recipientPublicKey,
    undefined,
    { apv, kid },
    { createKek: createX25519EcdhEsKek, alg: 'ECDH-ES' },
    a256KeyWrapper,
    { from: (cek: Uint8Array) => a256gcmDirEncrypter(cek), enc: 'XC20P' },
  )
}

export function xc20pAnonEncrypterX25519WithA256KW(
  recipientPublicKey: Uint8Array,
  kid?: string,
  apv?: string,
): Encrypter {
  return createFullEncrypter(
    recipientPublicKey,
    undefined,
    { apv, kid },
    { createKek: createX25519EcdhEsKek, alg: 'ECDH-ES' },
    a256KeyWrapper,
    { from: (cek: Uint8Array) => xc20pDirEncrypter(cek), enc: 'XC20P' },
  )
}

export function xc20pAnonDecrypterX25519WithA256KW(receiverSecret: Uint8Array | ECDH): Decrypter {
  const alg = 'ECDH-ES+A256KW'
  const enc = 'XC20P'

  async function decrypt(
    sealed: Uint8Array,
    iv: Uint8Array,
    aad?: Uint8Array,
    recipient?: Recipient,
  ): Promise<Uint8Array | null> {
    recipient = <Recipient>recipient
    const kek = await computeX25519EcdhEsKek(recipient, receiverSecret, alg)
    if (kek === null) return null
    // Content Encryption Key
    const unwrapper = a256KeyUnwrapper(kek)
    const cek = await unwrapper.unwrap(base64ToBytes(recipient.encrypted_key))
    if (cek === null) return null

    return xc20pDirDecrypter(cek).decrypt(sealed, iv, aad)
  }

  return { alg, enc, decrypt }
}

export function a256gcmAnonDecrypterX25519WithA256KW(receiverSecret: Uint8Array | ECDH): Decrypter {
  const alg = 'ECDH-ES+A256KW'
  const enc = 'A256GCM'

  async function decrypt(
    sealed: Uint8Array,
    iv: Uint8Array,
    aad?: Uint8Array,
    recipient?: Recipient,
  ): Promise<Uint8Array | null> {
    recipient = <Recipient>recipient
    const kek = await computeX25519EcdhEsKek(recipient, receiverSecret, alg)
    if (kek === null) return null
    // Content Encryption Key
    const unwrapper = a256KeyUnwrapper(kek)
    const cek = await unwrapper.unwrap(base64ToBytes(recipient.encrypted_key))
    if (cek === null) return null

    return a256gcmDirDecrypter(cek).decrypt(sealed, iv, aad)
  }

  return { alg, enc, decrypt }
}

export function xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW(
  recipientPublicKey: Uint8Array,
  senderSecret: Uint8Array | ECDH,
  options: Partial<AuthEncryptParams> = {},
): Encrypter {
  return createFullEncrypter(
    recipientPublicKey,
    senderSecret,
    options,
    { createKek: createX25519Ecdh1PUv3Kek, alg: 'ECDH-1PU' },
    a256KeyWrapper,
    { from: (cek: Uint8Array) => xc20pDirEncrypter(cek), enc: 'XC20P' },
  )
}

export function xc20pAuthDecrypterEcdh1PuV3x25519WithA256KW(
  recipientSecret: Uint8Array | ECDH,
  senderPublicKey: Uint8Array,
): Decrypter {
  const alg = 'ECDH-1PU+A256KW'
  const enc = 'XC20P'

  async function decrypt(
    sealed: Uint8Array,
    iv: Uint8Array,
    aad?: Uint8Array,
    recipient?: Recipient,
  ): Promise<Uint8Array | null> {
    recipient = <Recipient>recipient
    const kek = await computeX25519Ecdh1PUv3Kek(recipient, recipientSecret, senderPublicKey, alg)
    if (!kek) return null
    // Content Encryption Key
    const unwrapper = a256KeyUnwrapper(kek)
    const cek = await unwrapper.unwrap(base64ToBytes(recipient.encrypted_key))
    if (cek === null) return null

    return xc20pDirDecrypter(cek).decrypt(sealed, iv, aad)
  }

  return { alg, enc, decrypt }
}

export function a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW(
  recipientPublicKey: Uint8Array,
  senderSecret: Uint8Array | ECDH,
  options: Partial<AuthEncryptParams> = {},
): Encrypter {
  return createFullEncrypter(
    recipientPublicKey,
    senderSecret,
    options,
    { createKek: createX25519Ecdh1PUv3Kek, alg: 'ECDH-1PU' },
    a256KeyWrapper,
    { from: (cek: Uint8Array) => a256gcmDirEncrypter(cek), enc: 'A256GCM' },
  )
}

export function a256gcmAuthDecrypterEcdh1PuV3x25519WithA256KW(
  recipientSecret: Uint8Array | ECDH,
  senderPublicKey: Uint8Array,
): Decrypter {
  const alg = 'ECDH-1PU+A256KW'
  const enc = 'A256GCM'

  async function decrypt(
    sealed: Uint8Array,
    iv: Uint8Array,
    aad?: Uint8Array,
    recipient?: Recipient,
  ): Promise<Uint8Array | null> {
    recipient = <Recipient>recipient
    const kek = await computeX25519Ecdh1PUv3Kek(recipient, recipientSecret, senderPublicKey, alg)
    if (!kek) return null
    // Content Encryption Key
    const unwrapper = a256KeyUnwrapper(kek)
    const cek = await unwrapper.unwrap(base64ToBytes(recipient.encrypted_key))
    if (cek === null) return null

    return a256gcmDirDecrypter(cek).decrypt(sealed, iv, aad)
  }

  return { alg, enc, decrypt }
}
