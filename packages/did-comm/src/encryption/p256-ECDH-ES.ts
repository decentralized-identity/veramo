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

export async function computeP256EcdhEsKek(recipient: Recipient, receiverSecret: Uint8Array | ECDH, alg: string) {
  const publicKey = epkToPublicKey(recipient.header.epk)
  if (!publicKey) return null
  const sharedSecret = receiverSecret instanceof Uint8Array ? p256.getSharedSecret(receiverSecret, publicKey).slice(1, 33) : await receiverSecret(publicKey)
  const producerInfo = recipient.header.apu ? base64ToBytes(recipient.header.apu) : undefined
  const consumerInfo = recipient.header.apv ? base64ToBytes(recipient.header.apv) : undefined
  return concatKDF(sharedSecret, 256, alg, producerInfo, consumerInfo)
}

export async function createP256EcdhEsKek(recipientPublicKey: Uint8Array, senderSecret: Uint8Array | ECDH | undefined, alg: string, apu: string | undefined, apv: string | undefined, ephemeralKeyPair: EphemeralKeyPair | undefined) {
  const ephemeralSecret = ephemeralKeyPair ? ephemeralKeyPair.secretKey : p256.utils.randomPrivateKey()
  const ephemeralPublic = p256.getPublicKey(ephemeralSecret, false)
  const epk = { kty: 'EC', crv: 'P-256', x: bytesToBase64url(ephemeralPublic.slice(1, 33)), y: bytesToBase64url(ephemeralPublic.slice(33, 65)) }
  const sharedSecret = p256.getSharedSecret(ephemeralSecret, recipientPublicKey).slice(1, 33)
  const kek = concatKDF(sharedSecret, 256, alg, undefined, base64ToBytes(apv ?? ''))
  return { epk, kek }
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
