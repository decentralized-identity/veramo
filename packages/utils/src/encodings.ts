import { fromString, toString, concat as concatArrays } from 'uint8arrays'
import {
  hexToBytes as hexToBytesRaw,
  bytesToHex as bytesToHexRaw,
  bytesToBase58,
  base58ToBytes,
  base64ToBytes,
  bytesToBase64url,
  bytesToMultibase,
  multibaseToBytes,
} from 'did-jwt'

const u8a = { toString, fromString, concatArrays }

export {
  bytesToBase58,
  base58ToBytes,
  bytesToBase64url,
  base64ToBytes,
  multibaseToBytes,
  bytesToMultibase
}

/**
 * Encodes a Uint8Array to a base64 string representation with padding.
 * @param b - the byte array to convert
 *
 * @public
 */
export function bytesToBase64(b: Uint8Array): string {
  return u8a.toString(b, 'base64pad')
}

/**
 * Encodes the bytes of an input string to base64url
 * @param s - the original string
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function encodeBase64url(s: string): string {
  return bytesToBase64url(u8a.fromString(s))
}

/**
 * Decodes a base64url string to a utf8 string represented by the same bytes.
 * @param s - the base64url string to be decoded
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function decodeBase64url(s: string): string {
  return u8a.toString(base64ToBytes(s))
}

/**
 * Builds a string from a Uint8Array using the utf-8 encoding.
 * @param b - the array to be converted
 *
 * @public
 */
export function bytesToUtf8String(b: Uint8Array): string {
  return u8a.toString(b, 'utf-8')
}

/**
 * Encodes a string to a Uint8Array using the utf-8 encoding.
 * @param s - the string to be encoded
 *
 * @public
 */
export function stringToUtf8Bytes(s: string): Uint8Array {
  return u8a.fromString(s, 'utf-8')
}

/**
 * Stringifies a JSON object and encodes the bytes of the resulting string to a base64url representation.
 * @param payload - the object to be encoded
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function encodeJoseBlob(payload: {}) {
  return u8a.toString(u8a.fromString(JSON.stringify(payload), 'utf-8'), 'base64url')
}

/**
 * Decodes a base64url string representing stringified JSON to a JSON object.
 *
 * @param blob - The base64url encoded stringified JSON to be decoded
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function decodeJoseBlob(blob: string) {
  return JSON.parse(u8a.toString(u8a.fromString(blob, 'base64url'), 'utf-8'))
}

/**
 * Converts a hex string (with or without prefix) to a byte array (Uint8Array)
 *
 * @param hexString - The string representing the encoding
 * @returns the `Uint8Array` represented by the given string
 *
 * @throws `illegal_argument` error if the parameter is not a string
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function hexToBytes(hexString: string): Uint8Array {
  // @ts-ignore
  if (hexString instanceof Uint8Array) {
    return Uint8Array.from(hexString)
  }
  if (typeof hexString !== 'string') {
    throw new Error('illegal_argument: a string must be provided for a hex-string to byte array conversion')
  }
  return hexToBytesRaw(hexString)
}

/**
 * Converts a Uint8Array input to a hex string
 *
 * @param byteArray - The array to be converted
 * @param prefix - If this is set to true, the resulting hex string will be prefixed with 0x
 *
 * @returns the hex encoding of the input byte array
 *
 * @throws `illegal_argument` error if the input is not a Uint8Array
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function bytesToHex(byteArray: Uint8Array, prefix: boolean = false): string {
  if (!(byteArray instanceof Uint8Array)) {
    throw new Error('illegal_argument: only byte arrays can be converted to hex encoding')
  }
  const result = bytesToHexRaw(byteArray)
  return prefix ? `0x${result}` : result
}

/**
 * Concatenates a bunch of arrays into one Uint8Array
 * @param arrays - the arrays to be concatenated
 * @param length - the maximum length of the resulting array
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function concat(arrays: ArrayLike<number>[], length?: number): Uint8Array {
  return u8a.concatArrays(arrays, length)
}
