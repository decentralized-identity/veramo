import base64url from 'base64url'
import { keccak_256 } from 'js-sha3'
import * as jose from 'jose'

function keccak(data: any): Buffer {
  return Buffer.from(keccak_256.arrayBuffer(data))
}
export function toEthereumAddress(hexPublicKey: string): string {
  return `0x${keccak(Buffer.from(hexPublicKey.slice(2), 'hex'))
    .slice(-20)
    .toString('hex')}`
}

export function convertECKeyToEthHexKeys(key: jose.JWK.ECKey) {
  const bx = base64url.toBuffer(key.x)
  const by = base64url.toBuffer(key.y)
  const hexPrivateKey = key.d ? base64url.toBuffer(key.d).toString('hex') : ''
  const hexPublicKey = '04' + Buffer.concat([bx, by], 64).toString('hex')
  const address = toEthereumAddress(hexPublicKey)
  return {
    hexPrivateKey,
    hexPublicKey,
    address,
  }
}
