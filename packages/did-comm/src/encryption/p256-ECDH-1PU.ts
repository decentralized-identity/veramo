// // TODO: Implement this
// // kept the X25519 code for reference
import type { ECDH, EphemeralKeyPair, Recipient } from 'did-jwt'
import { concatKDF } from 'did-jwt'
import { p256 } from '@noble/curves/p256'
import { base64ToBytes, bytesToBase64url } from '@veramo/utils'
function epkToPublicKey(epk: any): Uint8Array | null {
  if (epk?.crv !== 'P-256' || !epk.x || !epk.y) return null
  const key = new Uint8Array(65); key[0] = 4
  key.set(base64ToBytes(epk.x), 1); key.set(base64ToBytes(epk.y), 33)
  return key
}

export async function computeP256Ecdh1PUv3Kek(recipient: Recipient, recipientSecret: Uint8Array | ECDH, senderPublicKey: Uint8Array, alg: string) {
  const publicKey = epkToPublicKey(recipient.header.epk)
  if (!publicKey) return null
  const zE = recipientSecret instanceof Uint8Array ? p256.getSharedSecret(recipientSecret, publicKey).slice(1, 33) : await recipientSecret(publicKey)
  const zS = recipientSecret instanceof Uint8Array ? p256.getSharedSecret(recipientSecret, senderPublicKey).slice(1, 33) : await recipientSecret(senderPublicKey)
  const sharedSecret = new Uint8Array(zE.length + zS.length); sharedSecret.set(zE); sharedSecret.set(zS, zE.length)
  const producerInfo = recipient.header.apu ? base64ToBytes(recipient.header.apu) : undefined
  const consumerInfo = recipient.header.apv ? base64ToBytes(recipient.header.apv) : undefined
  return concatKDF(sharedSecret, 256, alg, producerInfo, consumerInfo)
}

export async function createP256Ecdh1PUv3Kek(recipientPublicKey: Uint8Array, senderSecret: Uint8Array | ECDH, alg: string, apu: string | undefined, apv: string | undefined, ephemeralKeyPair: EphemeralKeyPair | undefined) {
  const ephemeralSecret = ephemeralKeyPair ? ephemeralKeyPair.secretKey : p256.utils.randomPrivateKey()
  const ephemeralPublic = p256.getPublicKey(ephemeralSecret, false)
  const epk = { kty: 'EC', crv: 'P-256', x: bytesToBase64url(ephemeralPublic.slice(1, 33)), y: bytesToBase64url(ephemeralPublic.slice(33, 65)) }
  const zE = p256.getSharedSecret(ephemeralSecret, recipientPublicKey).slice(1, 33)
  const zS = senderSecret instanceof Uint8Array ? p256.getSharedSecret(senderSecret, recipientPublicKey).slice(1, 33) : await senderSecret(recipientPublicKey)
  const sharedSecret = new Uint8Array(zE.length + zS.length); sharedSecret.set(zE); sharedSecret.set(zS, zE.length)
  const kek = concatKDF(sharedSecret, 256, alg, apu ? base64ToBytes(apu) : undefined, apv ? base64ToBytes(apv) : undefined)
  return { epk, kek }
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
