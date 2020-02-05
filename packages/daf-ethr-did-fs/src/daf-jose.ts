import base64url from 'base64url'
import { keccak_256 } from 'js-sha3'
import { sha256 as sha256js, Message } from 'js-sha256'
import * as jose from 'jose'

export function sha256(payload: Message): Buffer {
  return Buffer.from(sha256js.arrayBuffer(payload))
}

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
