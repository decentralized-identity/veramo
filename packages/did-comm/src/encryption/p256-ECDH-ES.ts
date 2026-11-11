import type { ECDH, EphemeralKeyPair, Recipient } from 'did-jwt'
import { concatKDF } from 'did-jwt'
import { p256 } from '@noble/curves/p256'
import { base64ToBytes, bytesToBase64url } from '@veramo/utils'
const crv = 'P-256'
const keyLen = 256
const pub = (k: Uint8Array) => (k.length === 64 ? new Uint8Array([4, ...k]) : k)
const shared = (s: Uint8Array, p: Uint8Array) => p256.getSharedSecret(s, pub(p)).slice(1)
const kdf = (s: Uint8Array, alg: string, apu?: string, apv?: string) => concatKDF(s, keyLen, alg, apu ? base64ToBytes(apu) : undefined, apv ? base64ToBytes(apv) : undefined)
export async function computeP256EcdhEsKek(recipient: Recipient, receiverSecret: Uint8Array | ECDH, alg: string) {
  const { epk, apu, apv } = recipient.header
  if (epk?.crv !== crv || !epk.x || !epk.y) return null
  const publicKey = new Uint8Array([4, ...base64ToBytes(epk.x), ...base64ToBytes(epk.y)])
  const secret = receiverSecret instanceof Uint8Array ? shared(receiverSecret, publicKey) : await receiverSecret(publicKey)
  return kdf(secret, alg, apu, apv)
}
export async function createP256EcdhEsKek(recipientPublicKey: Uint8Array, _senderSecret: Uint8Array | ECDH | undefined, alg: string, _apu: string | undefined, apv: string | undefined, ephemeralKeyPair: EphemeralKeyPair | undefined) {
  const secretKey = ephemeralKeyPair?.secretKey ?? p256.utils.randomPrivateKey()
  const publicKey = p256.getPublicKey(secretKey, false)
  const epk = { kty: 'EC', crv, x: bytesToBase64url(publicKey.slice(1, 33)), y: bytesToBase64url(publicKey.slice(33, 65)) }
  return { epk, kek: kdf(shared(secretKey, recipientPublicKey), alg, undefined, apv) }
}






// import type { ECDH, EphemeralKeyPair, Recipient } from 'did-jwt'
// import { concatKDF } from 'did-jwt'
// import { x25519 } from '@noble/curves/ed25519'
// import { base64ToBytes, bytesToBase64url } from "@veramo/utils";
// import { generateX25519KeyPair, generateX25519KeyPairFromSeed } from "../utils.js";
//
// export async function computeX25519EcdhEsKek(recipient: Recipient, receiverSecret: Uint8Array | ECDH, alg: string) {
//   const crv = 'X25519'
//   const keyLen = 256
//   const header = recipient.header
//   if (header.epk?.crv !== crv || typeof header.epk.x == 'undefined') return null
//   const publicKey = base64ToBytes(header.epk.x)
//   let sharedSecret
//   if (receiverSecret instanceof Uint8Array) {
//     sharedSecret = x25519.getSharedSecret(receiverSecret, publicKey)
//   } else {
//     sharedSecret = await receiverSecret(publicKey)
//   }
//
//   // Key Encryption Key
//   let producerInfo: Uint8Array | undefined = undefined
//   let consumerInfo: Uint8Array | undefined = undefined
//   if (recipient.header.apu) producerInfo = base64ToBytes(recipient.header.apu)
//   if (recipient.header.apv) consumerInfo = base64ToBytes(recipient.header.apv)
//   return concatKDF(sharedSecret, keyLen, alg, producerInfo, consumerInfo)
// }
//
// export async function createX25519EcdhEsKek(
//   recipientPublicKey: Uint8Array,
//   senderSecret: Uint8Array | ECDH | undefined, // unused
//   alg: string,
//   apu: string | undefined, // unused
//   apv: string | undefined,
//   ephemeralKeyPair: EphemeralKeyPair | undefined
// ) {
//   const crv = 'X25519'
//   const keyLen = 256
//   const ephemeral = ephemeralKeyPair ? generateX25519KeyPairFromSeed(ephemeralKeyPair.secretKey) : generateX25519KeyPair()
//   const epk = { kty: 'OKP', crv, x: bytesToBase64url(ephemeral.publicKey) }
//   const sharedSecret = x25519.getSharedSecret(ephemeral.secretKey, recipientPublicKey)
//   // Key Encryption Key
//   const consumerInfo = base64ToBytes(apv ?? '')
//   const kek = concatKDF(sharedSecret, keyLen, alg, undefined, consumerInfo)
//   return { epk, kek }
// }
