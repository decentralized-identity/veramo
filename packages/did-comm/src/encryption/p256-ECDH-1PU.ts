import type { ECDH, EphemeralKeyPair, Recipient } from 'did-jwt'
import { concatKDF } from 'did-jwt'
import { p256 } from '@noble/curves/p256'
import { base64ToBytes, bytesToBase64url } from '@veramo/utils'
const crv = 'P-256'
const keyLen = 256
const pub = (k: Uint8Array) => (k.length === 64 ? new Uint8Array([4, ...k]) : k)
const shared = (s: Uint8Array, p: Uint8Array) => p256.getSharedSecret(s, pub(p)).slice(1)
const kdf = (s: Uint8Array, alg: string, apu?: string, apv?: string) => concatKDF(s, keyLen, alg, apu ? base64ToBytes(apu) : undefined, apv ? base64ToBytes(apv) : undefined)
export async function computeP256Ecdh1PUv3Kek(recipient: Recipient, recipientSecret: Uint8Array | ECDH, senderPublicKey: Uint8Array, alg: string) {
  const { epk, apu, apv } = recipient.header
  if (epk?.crv !== crv || !epk.x || !epk.y) return null
  const publicKey = new Uint8Array([4, ...base64ToBytes(epk.x), ...base64ToBytes(epk.y)])
  const zE = recipientSecret instanceof Uint8Array ? shared(recipientSecret, publicKey) : await recipientSecret(publicKey)
  const zS = recipientSecret instanceof Uint8Array ? shared(recipientSecret, senderPublicKey) : await recipientSecret(senderPublicKey)
  const secret = new Uint8Array(zE.length + zS.length)
  secret.set(zE)
  secret.set(zS, zE.length)
  return kdf(secret, alg, apu, apv)
}
export async function createP256Ecdh1PUv3Kek(recipientPublicKey: Uint8Array, senderSecret: Uint8Array | ECDH, alg: string, apu: string | undefined, apv: string | undefined, ephemeralKeyPair: EphemeralKeyPair | undefined) {
  const secretKey = ephemeralKeyPair?.secretKey ?? p256.utils.randomPrivateKey()
  const publicKey = p256.getPublicKey(secretKey, false)
  const epk = { kty: 'EC', crv, x: bytesToBase64url(publicKey.slice(1, 33)), y: bytesToBase64url(publicKey.slice(33, 65)) }
  const zE = shared(secretKey, recipientPublicKey)
  const zS = senderSecret instanceof Uint8Array ? shared(senderSecret, recipientPublicKey) : await senderSecret(recipientPublicKey)
  const secret = new Uint8Array(zE.length + zS.length)
  secret.set(zE)
  secret.set(zS, zE.length)
  return { epk, kek: kdf(secret, alg, apu, apv) }
}






// import type { ECDH, EphemeralKeyPair, Recipient } from 'did-jwt'
// import { concatKDF } from 'did-jwt'
// import { x25519 } from '@noble/curves/ed25519'
// import { generateX25519KeyPair, generateX25519KeyPairFromSeed } from '../utils.js'
// import { base64ToBytes, bytesToBase64url } from '@veramo/utils'
//
// export async function computeX25519Ecdh1PUv3Kek(
//   recipient: Recipient,
//   recipientSecret: Uint8Array | ECDH,
//   senderPublicKey: Uint8Array,
//   alg: string,
// ) {
//   const crv = 'X25519'
//   const keyLen = 256
//   const header = recipient.header
//   if (header.epk?.crv !== crv || typeof header.epk.x == 'undefined') return null
//   // ECDH-1PU requires additional shared secret between
//   // static key of sender and static key of recipient
//   const publicKey = base64ToBytes(header.epk.x)
//   let zE: Uint8Array
//   let zS: Uint8Array
//
//   if (recipientSecret instanceof Uint8Array) {
//     zE = x25519.getSharedSecret(recipientSecret, publicKey)
//     zS = x25519.getSharedSecret(recipientSecret, senderPublicKey)
//   } else {
//     zE = await recipientSecret(publicKey)
//     zS = await recipientSecret(senderPublicKey)
//   }
//
//   const sharedSecret = new Uint8Array(zE.length + zS.length)
//   sharedSecret.set(zE)
//   sharedSecret.set(zS, zE.length)
//
//   // Key Encryption Key
//   let producerInfo
//   let consumerInfo
//   if (recipient.header.apu) producerInfo = base64ToBytes(recipient.header.apu)
//   if (recipient.header.apv) consumerInfo = base64ToBytes(recipient.header.apv)
//
//   return concatKDF(sharedSecret, keyLen, alg, producerInfo, consumerInfo)
// }
//
// export async function createX25519Ecdh1PUv3Kek(
//   recipientPublicKey: Uint8Array,
//   senderSecret: Uint8Array | ECDH,
//   alg: string, // must be provided as this is the key agreement alg + the key wrapper alg, Example: 'ECDH-ES+A256KW'
//   apu: string | undefined,
//   apv: string | undefined,
//   ephemeralKeyPair: EphemeralKeyPair | undefined
// ) {
//   const crv = 'X25519'
//   const keyLen = 256
//   const ephemeral = ephemeralKeyPair ? generateX25519KeyPairFromSeed(ephemeralKeyPair.secretKey) : generateX25519KeyPair()
//   const epk = { kty: 'OKP', crv, x: bytesToBase64url(ephemeral.publicKey) }
//   const zE = x25519.getSharedSecret(ephemeral.secretKey, recipientPublicKey)
//
//   // ECDH-1PU requires additional shared secret between
//   // static key of sender and static key of recipient
//   let zS
//   if (senderSecret instanceof Uint8Array) {
//     zS = x25519.getSharedSecret(senderSecret, recipientPublicKey)
//   } else {
//     zS = await senderSecret(recipientPublicKey)
//   }
//
//   const sharedSecret = new Uint8Array(zE.length + zS.length)
//   sharedSecret.set(zE)
//   sharedSecret.set(zS, zE.length)
//
//   let partyUInfo: Uint8Array = new Uint8Array(0)
//   let partyVInfo: Uint8Array = new Uint8Array(0)
//   if (apu) partyUInfo = base64ToBytes(apu)
//   if (apv) partyVInfo = base64ToBytes(apv)
//
//   // Key Encryption Key
//   const kek = concatKDF(sharedSecret, keyLen, alg, partyUInfo, partyVInfo)
//   return { epk, kek }
// }
