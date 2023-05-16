// // TODO: Implement this
// // kept the X25519 code for reference






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
