import * as u8a from 'uint8arrays'

export function bytesToBase64url(b: Uint8Array): string {
  return u8a.toString(b, 'base64url')
}

export function base64ToBytes(s: string): Uint8Array {
  const inputBase64Url = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return u8a.fromString(inputBase64Url, 'base64url')
}

export function bytesToBase64(b: Uint8Array): string {
  return u8a.toString(b, 'base64pad')
}

export function encodeBase64url(s: string): string {
  return bytesToBase64url(u8a.fromString(s))
}

export function decodeBase64url(s: string): string {
  return u8a.toString(base64ToBytes(s))
}

export function encodeJoseBlob(payload: {}) {
  return u8a.toString(u8a.fromString(JSON.stringify(payload), 'utf-8'), 'base64url')
}

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
 */
export function hexToBytes(hexString: string): Uint8Array {
  // @ts-ignore
  if (hexString instanceof Uint8Array) {
    return Uint8Array.from(hexString)
  }
  if (typeof hexString !== 'string') {
    throw new Error('illegal_argument: a string must be provided for a hex-string to byte array conversion')
  }
  const noPrefix = hexString.startsWith('0x') ? hexString.substring(2) : hexString
  const padded = noPrefix.length % 2 !== 0 ? `0${noPrefix}` : noPrefix
  return u8a.fromString(padded.toLowerCase(), 'base16')
}

export function bytesToHex(byteArray: Uint8Array, prefix: boolean = false): string {
  if (!(byteArray instanceof Uint8Array)) {
    throw new Error('illegal_argument: only byte arrays can be converted to hex encoding')
  }
  const result = u8a.toString(byteArray, 'base16')
  return prefix ? `0x${result}` : result
}