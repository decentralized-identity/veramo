import type { AuthEncryptParams, Decrypter, ECDH, Encrypter, Recipient } from 'did-jwt'
import {
  computeX25519Ecdh1PUv3Kek,
  computeX25519EcdhEsKek,
  createX25519Ecdh1PUv3Kek,
  createX25519EcdhEsKek,
  xc20pDirDecrypter,
  xc20pDirEncrypter,
} from 'did-jwt'
import { base64ToBytes } from '@veramo/utils'
import { createFullEncrypter } from './createEncrypter.js'
import { a256KeyUnwrapper, a256KeyWrapper } from './a256kw.js'
import { a256gcmDirDecrypter, a256gcmDirEncrypter } from './a256gcm-dir.js'
import { a256cbcHs512DirDecrypter, a256cbcHs512DirEncrypter } from './a256cbc-hs512-dir.js'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A256CBC-HS512
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function a256cbcHs512AnonEncrypterX25519WithA256KW(
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
    { from: (cek: Uint8Array) => a256cbcHs512DirEncrypter(cek), enc: 'A256CBC-HS512' },
  )
}

export function a256cbcHs512AnonDecrypterX25519WithA256KW(receiverSecret: Uint8Array | ECDH): Decrypter {
  const alg = 'ECDH-ES+A256KW'
  const enc = 'A256CBC-HS512'

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

    return a256cbcHs512DirDecrypter(cek).decrypt(sealed, iv, aad)
  }

  return { alg, enc, decrypt }
}

export function a256cbcHs512AuthEncrypterX25519WithA256KW(
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
    { from: (cek: Uint8Array) => a256cbcHs512DirEncrypter(cek), enc: 'A256CBC-HS512' },
  )
}

export function a256cbcHs512AuthDecrypterX25519WithA256KW(
  recipientSecret: Uint8Array | ECDH,
  senderPublicKey: Uint8Array,
): Decrypter {
  const alg = 'ECDH-1PU+A256KW'
  const enc = 'A256CBC-HS512'

  async function decrypt(
    sealed: Uint8Array,
    iv: Uint8Array,
    aad?: Uint8Array,
    recipient?: Recipient,
  ): Promise<Uint8Array | null> {
    recipient = <Recipient>recipient
    const kek = await computeX25519Ecdh1PUv3Kek(recipient, recipientSecret, senderPublicKey, alg)
    if (kek === null) return null
    // Content Encryption Key
    const unwrapper = a256KeyUnwrapper(kek)
    const cek = await unwrapper.unwrap(base64ToBytes(recipient.encrypted_key))
    if (cek === null) return null

    return a256cbcHs512DirDecrypter(cek).decrypt(sealed, iv, aad)
  }

  return { alg, enc, decrypt }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A256GCM
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// XC20P
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    // FIXME: why is there no tag and IV check here?
    const cek = await unwrapper.unwrap(base64ToBytes(recipient.encrypted_key))
    if (cek === null) return null

    return xc20pDirDecrypter(cek).decrypt(sealed, iv, aad)
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
