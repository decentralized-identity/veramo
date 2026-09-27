import { describe, expect, it } from 'vitest'
import { ed25519 } from '@noble/curves/ed25519'
import { p256 } from '@noble/curves/p256'
import { p384 } from '@noble/curves/p384'
import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256, sha384 } from '@noble/hashes/sha2'
import { computeAddress } from 'ethers'
import {
  bytesToBase64url,
  bytesToHex,
  concat,
  encodeJoseBlob,
  stringToUtf8Bytes,
} from '../../../utils/src/index.js'
import { JwsAlgorithm, JwsDetachedSignature } from '../suites/jws-detached-signature.js'

const verifyData = sha256(stringToUtf8Bytes('proof options')).map((b, i) => b ^ i) // any 32+ bytes
const edPriv = ed25519.utils.randomPrivateKey()
const edPub = bytesToHex(ed25519.getPublicKey(edPriv))
const kPriv = secp256k1.utils.randomPrivateKey()
const kPub = bytesToHex(secp256k1.getPublicKey(kPriv, true))
const kAddress = computeAddress('0x' + bytesToHex(secp256k1.getPublicKey(kPriv, false)))
const pPriv = p256.utils.randomPrivateKey()
const pPub = bytesToHex(p256.getPublicKey(pPriv, false))

const p384Priv = p384.utils.randomPrivateKey()
const p384Point = p384.getPublicKey(p384Priv, false)
const p384Vm = {
  id: 'did:ex:5#k',
  controller: 'did:ex:5',
  type: 'P384Key2021',
  publicKeyJwk: {
    kty: 'EC',
    crv: 'P-384',
    x: bytesToBase64url(p384Point.slice(1, 49)),
    y: bytesToBase64url(p384Point.slice(49)),
  },
}
const p384Sign = (input: Uint8Array) => p384.sign(sha384(input), p384Priv).toCompactRawBytes()

const suite = (algorithms: JwsAlgorithm[], verificationMethodTypes = ['JsonWebKey2020']) =>
  new JwsDetachedSignature({ type: 'TestSignature', algorithms, verificationMethodTypes })

function jws(
  alg: string,
  sign: (input: Uint8Array) => Uint8Array,
  header: any = { alg, b64: false, crit: ['b64'] },
) {
  const h = encodeJoseBlob(header)
  return `${h}..${bytesToBase64url(sign(concat([stringToUtf8Bytes(`${h}.`), verifyData])))}`
}
const edSign = (input: Uint8Array) => ed25519.sign(input, edPriv)
const kSign = (input: Uint8Array) => secp256k1.sign(sha256(input), kPriv).toCompactRawBytes()
const kSignR = (v: (bit: number) => number) => (input: Uint8Array) => {
  const s = secp256k1.sign(sha256(input), kPriv)
  return concat([s.toCompactRawBytes(), new Uint8Array([v(s.recovery)])])
}
const pSign = (input: Uint8Array) => p256.sign(sha256(input), pPriv).toCompactRawBytes()

const edVm = {
  id: 'did:ex:1#k',
  controller: 'did:ex:1',
  type: 'Ed25519VerificationKey2018',
  publicKeyHex: edPub,
}
const kVm = {
  id: 'did:ex:2#k',
  controller: 'did:ex:2',
  type: 'EcdsaSecp256k1VerificationKey2019',
  publicKeyHex: kPub,
}
const pVm = {
  id: 'did:ex:3#k',
  controller: 'did:ex:3',
  type: 'EcdsaSecp256r1VerificationKey2019',
  publicKeyHex: pPub,
}
const addressVm = (extra: any) => ({
  id: 'did:ex:4#k',
  controller: 'did:ex:4',
  type: 'EcdsaSecp256k1RecoveryMethod2020',
  ...extra,
})

const verify = (s: JwsDetachedSignature, proofJws: string, verificationMethod: any) =>
  s.verifySignature({ verifyData, verificationMethod, proof: { jws: proofJws } })

describe('JwsDetachedSignature.verifySignature', () => {
  it('verifies EdDSA, ES256K, ES256 and ES256K-R', async () => {
    expect(await verify(suite(['EdDSA']), jws('EdDSA', edSign), edVm)).toBe(true)
    expect(await verify(suite(['ES256K']), jws('ES256K', kSign), kVm)).toBe(true)
    expect(await verify(suite(['ES256']), jws('ES256', pSign), pVm)).toBe(true)
    expect(
      await verify(
        suite(['ES256K-R']),
        jws(
          'ES256K-R',
          kSignR((v) => v),
        ),
        kVm,
      ),
    ).toBe(true)
    expect(await verify(suite(['ES384']), jws('ES384', p384Sign), p384Vm)).toBe(true)
  })

  it('rejects a signature from another key', async () => {
    const other = ed25519.utils.randomPrivateKey()
    const wrong = jws('EdDSA', (input) => ed25519.sign(input, other))
    expect(await verify(suite(['EdDSA']), wrong, edVm)).toBe(false)
  })

  it('rejects an alg the suite does not accept, and an alg that does not fit the key', async () => {
    await expect(verify(suite(['EdDSA']), jws('ES256K', kSign), kVm)).rejects.toThrow(/not supported/)
    expect(await verify(suite(['EdDSA', 'ES256K']), jws('ES256K', kSign), edVm)).toBe(false)
  })

  it('requires an RFC 7797 detached JWS with exactly crit ["b64"]', async () => {
    const s = suite(['EdDSA'])
    await expect(verify(s, jws('EdDSA', edSign, { alg: 'EdDSA' }), edVm)).rejects.toThrow(/b64/)
    await expect(
      verify(s, jws('EdDSA', edSign, { alg: 'EdDSA', b64: false, crit: ['b64', 'exp'] }), edVm),
    ).rejects.toThrow(/crit/)
    await expect(verify(s, 'eyJhbGciOiJFZERTQSJ9.cGF5bG9hZA.c2ln', edVm)).rejects.toThrow(/detached/)
  })

  it('rejects ES256/ES256K signatures that are not exactly 64 bytes', async () => {
    const padded = (input: Uint8Array) => concat([kSign(input), new Uint8Array([1])])
    expect(await verify(suite(['ES256K']), jws('ES256K', padded), kVm)).toBe(false)
  })

  it('accepts only 0, 1, 27 or 28 as the ES256K-R recovery byte', async () => {
    const s = suite(['ES256K-R'])
    expect(
      await verify(
        s,
        jws(
          'ES256K-R',
          kSignR((v) => v + 27),
        ),
        kVm,
      ),
    ).toBe(true)
    expect(
      await verify(
        s,
        jws(
          'ES256K-R',
          kSignR((v) => v + 54),
        ),
        kVm,
      ),
    ).toBe(false)
  })

  it('matches ES256K-R against an address-only verification method', async () => {
    const s = suite(['ES256K-R'])
    const sig = jws(
      'ES256K-R',
      kSignR((v) => v),
    )
    expect(await verify(s, sig, addressVm({ blockchainAccountId: `eip155:1:${kAddress}` }))).toBe(true)
    expect(await verify(s, sig, addressVm({ blockchainAccountId: `${kAddress}@eip155:1` }))).toBe(true)
    expect(await verify(s, sig, addressVm({ ethereumAddress: kAddress.toLowerCase() }))).toBe(true)
    expect(
      await verify(
        s,
        sig,
        addressVm({
          ethereumAddress: '0x0000000000000000000000000000000000000001',
          blockchainAccountId: `eip155:1:${kAddress}`,
        }),
      ),
    ).toBe(true)
    expect(
      await verify(
        s,
        sig,
        addressVm({ blockchainAccountId: 'eip155:1:0x0000000000000000000000000000000000000001' }),
      ),
    ).toBe(false)
  })
})

describe('JwsDetachedSignature.getVerificationMethod', () => {
  const doc = {
    id: 'did:ex:1',
    verificationMethod: [
      { id: '#k', type: 'JsonWebKey2020', controller: 'did:ex:1', publicKeyJwk: {} },
      {
        id: 'did:ex:1#old',
        type: 'JsonWebKey2020',
        controller: 'did:ex:1',
        publicKeyJwk: {},
        revoked: '2020-01-01',
      },
      {
        id: 'did:ex:1#other',
        type: 'Ed25519VerificationKey2020',
        controller: 'did:ex:1',
        publicKeyMultibase: 'z',
      },
    ],
  }
  const documentLoader = async () => ({ document: doc })
  const get = (verificationMethod: string) =>
    suite(['EdDSA']).getVerificationMethod({ proof: { verificationMethod }, documentLoader })

  it('finds a verification method with a relative id and returns absolute ids', async () => {
    expect(await get('did:ex:1#k')).toMatchObject({ id: 'did:ex:1#k', controller: 'did:ex:1' })
  })

  it('rejects unknown, revoked and unsupported verification methods', async () => {
    await expect(get('did:ex:1#missing')).rejects.toThrow(/not found/)
    await expect(get('did:ex:1#old')).rejects.toThrow(/revoked/)
    await expect(get('did:ex:1#other')).rejects.toThrow(/does not support/)
  })
})
