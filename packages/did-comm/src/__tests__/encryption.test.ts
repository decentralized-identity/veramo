import { createJWE, createX25519ECDH, Decrypter, decryptJWE, ECDH, Encrypter, JWE } from 'did-jwt'
import { randomBytes } from '@noble/hashes/utils'
import { generateX25519KeyPairFromSeed } from '../utils.js'
import {
  a256cbcHs512AnonDecrypterX25519WithA256KW,
  a256cbcHs512AnonEncrypterX25519WithA256KW,
  a256cbcHs512AuthDecrypterX25519WithA256KW,
  a256cbcHs512AuthEncrypterX25519WithA256KW,
  a256gcmAnonDecrypterX25519WithA256KW,
  a256gcmAnonEncrypterX25519WithA256KW,
  a256gcmAuthDecrypterEcdh1PuV3x25519WithA256KW,
  a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW,
  xc20pAnonDecrypterX25519WithA256KW,
  xc20pAnonEncrypterX25519WithA256KW,
  xc20pAuthDecrypterEcdh1PuV3x25519WithA256KW,
  xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW,
} from '../encryption/a256kw-encrypters.js'
import { decodeBase64url, encodeBase64url } from '../../../utils/src'

import * as u8a from 'uint8arrays'

const test_vectors = {
  pass: [
    {
      key: 'b9NnuOCB0hm7YGNvaE9DMhwH_wjZA1-gWD6dA0JWdL0',
      cleartext:
        '{"id":"1234567890","typ":"application/didcomm-plain+json","type":"http://example.com/protocols/lets_do_lunch/1.0/proposal","from":"did:example:alice","to":["did:example:bob"],"created_time":1516269022,"expires_time":1516385931,"body":{"messagespecificattribute":"and its value"}}',
      jwe: {
        ciphertext:
          'KWS7gJU7TbyJlcT9dPkCw-ohNigGaHSukR9MUqFM0THbCTCNkY-g5tahBFyszlKIKXs7qOtqzYyWbPou2q77XlAeYs93IhF6NvaIjyNqYklvj-OtJt9W2Pj5CLOMdsR0C30wchGoXd6wEQZY4ttbzpxYznqPmJ0b9KW6ZP-l4_DSRYe9B-1oSWMNmqMPwluKbtguC-riy356Xbu2C9ShfWmpmjz1HyJWQhZfczuwkWWlE63g26FMskIZZd_jGpEhPFHKUXCFwbuiw_Iy3R0BIzmXXdK_w7PZMMPbaxssl2UeJmLQgCAP8j8TukxV96EKa6rGgULvlo7qibjJqsS5j03bnbxkuxwbfyu3OxwgVzFWlyHbUH6p',
        protected:
          'eyJlcGsiOnsia3R5IjoiT0tQIiwiY3J2IjoiWDI1NTE5IiwieCI6IkpIanNtSVJaQWFCMHpSR193TlhMVjJyUGdnRjAwaGRIYlc1cmo4ZzBJMjQifSwiYXB2IjoiTmNzdUFuclJmUEs2OUEtcmtaMEw5WFdVRzRqTXZOQzNaZzc0QlB6NTNQQSIsInR5cCI6ImFwcGxpY2F0aW9uL2RpZGNvbW0tZW5jcnlwdGVkK2pzb24iLCJlbmMiOiJYQzIwUCIsImFsZyI6IkVDREgtRVMrQTI1NktXIn0',
        recipients: [
          {
            encrypted_key: '3n1olyBR3nY7ZGAprOx-b7wYAKza6cvOYjNwVg3miTnbLwPP_FmE1A',
            header: {
              kid: 'did:example:bob#key-x25519-1',
            },
          },
        ],
        tag: '6ylC_iAs4JvDQzXeY6MuYQ',
        iv: 'ESpmcyGiZpRjc5urDela21TOOTW8Wqd1',
      },
    },

    {
      key: '+Egu1APNlDqx3YHm1LAsAHeEQi7kCUvhIXunTMpuplQ=',
      cleartext: 'i1WprsPZJy9VP2xiqbyHIQ3q0hOdleHb+e7wlV0u9e/+lzO4IYue0NqBcsrPfnF9EVqQkEpi2maC5ym79H4k4w==',
      jwe: {
        protected: 'eyJlbmMiOiJYQzIwUCJ9',
        recipients: [
          {
            header: {
              alg: 'ECDH-ES+A256KW',
              epk: { kty: 'OKP', crv: 'X25519', x: '2s6Xfe4ignhNvVHVn3s25FO4xBNTk170ZqqllhHHBVQ' },
            },
            encrypted_key: 'OHFmMeOC068rgtG_H6NRBvXh-n__bynU_lkL7xMo6hIPGRTW4yNmVA',
          },
          {
            header: {
              alg: 'ECDH-ES+XC20PKW',
              tag: 'oLF5ceVwDl11UMiNYIbnJw',
              iv: '0__i0CcUPS_R_FOQ33hZJqAtxfsfouHj',
              epk: { kty: 'OKP', crv: 'X25519', x: 'fcVzcQ3-lO-hmpDtLX_1N7Z1UP31nNCqjEz3SU23zUU' },
            },
            encrypted_key: 'PBYJSfnq2gunqyc3goI-vSCwF5bMBHvenvxs8q8ntsA',
          },
        ],
        iv: 'vw-eDC1N1KQZrAyTXsCh8bI4Xul2Ap0g',
        ciphertext:
          'X9Qp6fnJIpcxbsKQete7nioEFC4sC9d0gS7SH4TDeSlSlSqT9ln3UP6x2hmjz-gn5hg5PEUFaIUkETNuBSyMzHyUpE_Lx5iNAzuRnstfpQ_ZG6hka93Mbw',
        tag: '9FQnp03c5Us_d1OdPYM7hA',
      },
    },

    {
      key: 'MCFWVpCL17Y6+Ck8mVhlHv0ezly3SWDEya4DS/4zU14=',
      cleartext: 'q3kCxeF6O/OSCD2R2UjkhS+DMjCN09QPchTK91LOEk5w2HQEJ+Ewo1BpkEYAuRE2CDfcMp4hIYIKc+n88BDALA==',
      jwe: {
        protected: 'eyJlbmMiOiJYQzIwUCJ9',
        recipients: [
          {
            header: {
              alg: 'ECDH-ES+A256KW',
              epk: { kty: 'OKP', crv: 'X25519', x: 'h6HwUrtHy0gc7KA5PSrRYtIIJxr4V3L2b0lxhWwLhUo' },
            },
            encrypted_key: '21iyqdWq11QvnngzFHj3wkkIRVOK6rjsdFvXJFH0kMKc8FMA4BXOOg',
          },
          {
            header: {
              alg: 'ECDH-ES+XC20PKW',
              tag: 'TGlpNP9uMvW-y6Uc1jXfZg',
              iv: 'szLQC8qOTAcTVbE_QCljXMaC8CmJX3T7',
              epk: { kty: 'OKP', crv: 'X25519', x: '2rxr9f5MTxxTkmyWVGNnSX4coM3MvJguCRsQCrxt9w4' },
            },
            encrypted_key: 'ndhYa5ZyPr-X9FAeXLQladjmlZirzkmmHCm5rGr98s8',
          },
        ],
        iv: 'Msj-fX46TRocNzhGkzL81wKhfDb9qHeg',
        ciphertext:
          'tcFKEWxhz-Q-nsnJppYqmFC5R0VT8fdNR0vJzUynlx--_3KDFIuDUdf0lwuwycbYXrEw94EyxfVZb3tkOADHXNaIC0njlB07_D7__eyK0N5bD88TXSe4lA',
        tag: 'GNnsfuK6-OYVwVc5N0jyHg',
      },
    },

    {
      key: 'KHJWEr94Z1qgaCCbsKu/oCxb07LR/ufntkr1Lu0stWU=',
      cleartext: '2+YQ5xghWN7RL1BUPHgv39BJRynuZ2+KaiMRsBlnvZzjJclMYSY67SneTmysv3X3yP/DEDkZH2TVPFcHrJRYGg==',
      jwe: {
        protected: 'eyJlbmMiOiJYQzIwUCJ9',
        recipients: [
          {
            header: {
              alg: 'ECDH-ES+A256KW',
              epk: { kty: 'OKP', crv: 'X25519', x: 'e7nXXNUZHQQd1lPTK0bzXWteGZGRg2cr73RsaKr2Lyo' },
            },
            encrypted_key: 'OASoE721beho7x6dGXKj6LL9NR9z7OI12ZaisNHV3b6EyJjxbWIGeg',
          },
          {
            header: {
              alg: 'ECDH-ES+XC20PKW',
              tag: 'bdMaXGwUwNX-obqn7eqO3g',
              iv: 'RzCIyIO4JJbLo544aqpFbIeH7pq1BIR3',
              epk: { kty: 'OKP', crv: 'X25519', x: 'lVudXos0kqGtiGpgYj7W_CoWnlKAR5WiNeB_yHZhSS8' },
            },
            encrypted_key: 'iTxnM7J8iJQHash-un_EMElCjPEpVcXu0BVeKFLjJRM',
          },
        ],
        iv: 'EeBBbmkL5OvvGbuqqiPVZWUhKKJ2L4Pc',
        ciphertext:
          '3ODDtCTQKlX6k0CKOBEE0LsbdUreF7ZeeIj27_pmyZ6uYTKikePR1N24ozdO2oGIGuvC-e9aNMLD8lJmfIbQrCzO6DD-c0AB3xULUF-z92EtI9XaGp08uA',
        tag: 'g0IWefR0xt-ubzkUJ2Ufeg',
      },
    },
  ],
  fail: [],
  invalid: [],
}

describe('One recipient A256KW', () => {
  let pubkey, secretkey, cleartext: Uint8Array, encrypter: Encrypter, decrypter: Decrypter

  beforeEach(() => {
    secretkey = randomBytes(32)
    pubkey = generateX25519KeyPairFromSeed(secretkey).publicKey
    cleartext = u8a.fromString('hello world')
    encrypter = xc20pAnonEncrypterX25519WithA256KW(pubkey)
    decrypter = xc20pAnonDecrypterX25519WithA256KW(secretkey)
  })

  it('Creates with only ciphertext', async () => {
    expect.assertions(3)
    const jwe = await createJWE(cleartext, [encrypter], {}, undefined, true)
    expect(jwe.aad).toBeUndefined()
    expect(JSON.parse(decodeBase64url(jwe.protected)).enc).toEqual('XC20P')
    expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
  })

  it('Creates with data in protected header', async () => {
    expect.assertions(3)
    const jwe = await createJWE(cleartext, [encrypter], { more: 'protected' })
    expect(jwe.aad).toBeUndefined()
    expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P', more: 'protected' })
    expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
  })

  it('Creates with aad', async () => {
    expect.assertions(4)
    const aad = u8a.fromString('this data is authenticated')
    const jwe = await createJWE(cleartext, [encrypter], { more: 'protected' }, aad)
    expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
    expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P', more: 'protected' })
    expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    delete jwe.aad
    await expect(decryptJWE(jwe, decrypter)).rejects.toThrowError('Failed to decrypt')
  })
})

describe('Multiple recipients A256KW', () => {
  let pubkey1, secretkey1, pubkey2, secretkey2, cleartext: Uint8Array
  let encrypter1: Encrypter, decrypter1: Decrypter, encrypter2: Encrypter, decrypter2: Decrypter

  beforeEach(() => {
    secretkey1 = randomBytes(32)
    pubkey1 = generateX25519KeyPairFromSeed(secretkey1).publicKey
    secretkey2 = randomBytes(32)
    pubkey2 = generateX25519KeyPairFromSeed(secretkey2).publicKey
    cleartext = u8a.fromString('my secret message')
    encrypter1 = xc20pAnonEncrypterX25519WithA256KW(pubkey1)
    decrypter1 = xc20pAnonDecrypterX25519WithA256KW(secretkey1)
    encrypter2 = xc20pAnonEncrypterX25519WithA256KW(pubkey2)
    decrypter2 = xc20pAnonDecrypterX25519WithA256KW(secretkey2)
  })

  it('Creates with only ciphertext', async () => {
    expect.assertions(4)
    const jwe = await createJWE(cleartext, [encrypter1, encrypter2])
    expect(jwe.aad).toBeUndefined()
    expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P' })
    expect(await decryptJWE(jwe, decrypter1)).toEqual(cleartext)
    expect(await decryptJWE(jwe, decrypter2)).toEqual(cleartext)
  })

  it('Creates with data in protected header', async () => {
    expect.assertions(4)
    const jwe = await createJWE(cleartext, [encrypter1, encrypter2], { more: 'protected' })
    expect(jwe.aad).toBeUndefined()
    expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P', more: 'protected' })
    expect(await decryptJWE(jwe, decrypter2)).toEqual(cleartext)
    expect(await decryptJWE(jwe, decrypter1)).toEqual(cleartext)
  })

  it('Creates with aad', async () => {
    expect.assertions(6)
    const aad = u8a.fromString('this data is authenticated')
    const jwe = await createJWE(cleartext, [encrypter1, encrypter2], { more: 'protected' }, aad)
    expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
    expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P', more: 'protected' })
    expect(await decryptJWE(jwe, decrypter1)).toEqual(cleartext)
    expect(await decryptJWE(jwe, decrypter2)).toEqual(cleartext)
    delete jwe.aad
    await expect(decryptJWE(jwe, decrypter1)).rejects.toThrowError('Failed to decrypt')
    await expect(decryptJWE(jwe, decrypter2)).rejects.toThrowError('Failed to decrypt')
  })

  it('Incompatible encrypters throw', async () => {
    expect.assertions(1)
    const enc1 = { enc: 'cool enc alg1' } as Encrypter
    const enc2 = { enc: 'cool enc alg2' } as Encrypter
    await expect(createJWE(cleartext, [enc1, enc2])).rejects.toThrowError('Incompatible encrypters passed')
  })
})

describe('ECDH-1PU+A256KW (X25519), Key Wrapping Mode with XC20P content encryption', () => {
  describe('One recipient', () => {
    let cleartext: Uint8Array, recipientKey: any, senderKey: any, decrypter: Decrypter

    beforeEach(() => {
      recipientKey = generateX25519KeyPairFromSeed(randomBytes(32))
      senderKey = generateX25519KeyPairFromSeed(randomBytes(32))
      cleartext = u8a.fromString('my secret message')
      decrypter = xc20pAuthDecrypterEcdh1PuV3x25519WithA256KW(recipientKey.secretKey, senderKey.publicKey)
    })

    it('Creates with only ciphertext', async () => {
      const encrypter = xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
      )
      expect.assertions(3)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with kid, no apu and no apv', async () => {
      const kid = 'did:example:receiver#key-1'
      const encrypter = xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
        {
          kid,
        },
      )
      expect.assertions(6)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P' })
      expect(jwe.recipients!![0].header.kid).toEqual(kid)
      expect(jwe.recipients!![0].header.apu).toBeUndefined()
      expect(jwe.recipients!![0].header.apv).toBeUndefined()
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with no kid, apu and apv', async () => {
      const apu = encodeBase64url('Alice')
      const apv = encodeBase64url('Bob')
      const encrypter = xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
        {
          apu,
          apv,
        },
      )
      expect.assertions(6)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P' })
      expect(jwe.recipients!![0].header.kid).toBeUndefined()
      expect(jwe.recipients!![0].header.apu).toEqual(apu)
      expect(jwe.recipients!![0].header.apv).toEqual(apv)
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with kid, apu and apv', async () => {
      const kid = 'did:example:receiver#key-1'
      const apu = encodeBase64url('Alice')
      const apv = encodeBase64url('Bob')
      const encrypter = xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
        {
          kid,
          apu,
          apv,
        },
      )
      expect.assertions(6)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P' })
      expect(jwe.recipients!![0].header.kid).toEqual(kid)
      expect(jwe.recipients!![0].header.apu).toEqual(apu)
      expect(jwe.recipients!![0].header.apv).toEqual(apv)
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with data in protected header', async () => {
      const encrypter = xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
      )
      const skid = 'did:example:sender#key-1'
      expect.assertions(3)
      const jwe = await createJWE(cleartext, [encrypter], { skid, more: 'protected' })
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P', skid, more: 'protected' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with aad', async () => {
      const encrypter = xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
      )
      expect.assertions(4)
      const aad = u8a.fromString('this data is authenticated')
      const jwe = await createJWE(cleartext, [encrypter], { more: 'protected' }, aad)
      expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P', more: 'protected' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
      delete jwe.aad
      await expect(decryptJWE(jwe, decrypter)).rejects.toThrowError('Failed to decrypt')
    })

    describe('using remote ECDH', () => {
      const message = 'hello world'
      const receiverPair = generateX25519KeyPairFromSeed(randomBytes(32))
      const receiverRemoteECDH = createX25519ECDH(receiverPair.secretKey)
      const senderPair = generateX25519KeyPairFromSeed(randomBytes(32))
      const senderRemoteECDH: ECDH = createX25519ECDH(senderPair.secretKey)

      it('creates anon JWE with remote ECDH', async () => {
        const encrypter = xc20pAnonEncrypterX25519WithA256KW(receiverPair.publicKey)
        const jwe: JWE = await createJWE(u8a.fromString(message), [encrypter])
        const decrypter = xc20pAnonDecrypterX25519WithA256KW(receiverRemoteECDH)
        const decryptedBytes = await decryptJWE(jwe, decrypter)
        const receivedMessage = u8a.toString(decryptedBytes)
        expect(receivedMessage).toEqual(message)
      })

      it('creates and decrypts auth JWE', async () => {
        const encrypter = xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW(
          receiverPair.publicKey,
          senderRemoteECDH,
        )
        const jwe: JWE = await createJWE(u8a.fromString(message), [encrypter])
        const decrypter = xc20pAuthDecrypterEcdh1PuV3x25519WithA256KW(
          receiverRemoteECDH,
          senderPair.publicKey,
        )
        const decryptedBytes = await decryptJWE(jwe, decrypter)
        const receivedMessage = u8a.toString(decryptedBytes)
        expect(receivedMessage).toEqual(message)
      })

      it(`throws error when using bad secret key size`, async () => {
        expect.assertions(1)
        const badSecretKey = randomBytes(64)
        expect(() => {
          createX25519ECDH(badSecretKey)
        }).toThrow('invalid_argument')
      })

      it(`throws error when using bad public key size`, async () => {
        expect.assertions(1)
        const ecdh: ECDH = createX25519ECDH(randomBytes(32))
        const badPublicKey = randomBytes(64)
        expect(ecdh(badPublicKey)).rejects.toThrow('invalid_argument')
      })
    })
  })

  describe('Multiple recipients', () => {
    let cleartext: any, senderkey: any
    const recipients: any[] = []

    beforeEach(() => {
      senderkey = generateX25519KeyPairFromSeed(randomBytes(32))
      cleartext = u8a.fromString('my secret message')

      recipients[0] = {
        kid: 'did:example:receiver1#key-1',
        recipientkey: generateX25519KeyPairFromSeed(randomBytes(32)),
      }
      recipients[0] = {
        ...recipients[0],
        ...{
          encrypter: xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW(
            recipients[0].recipientkey.publicKey,
            senderkey.secretKey,
            { kid: recipients[0].kid },
          ),
          decrypter: xc20pAuthDecrypterEcdh1PuV3x25519WithA256KW(
            recipients[0].recipientkey.secretKey,
            senderkey.publicKey,
          ),
        },
      }

      recipients[1] = {
        kid: 'did:example:receiver2#key-1',
        recipientkey: generateX25519KeyPairFromSeed(randomBytes(32)),
      }
      recipients[1] = {
        ...recipients[1],
        ...{
          encrypter: xc20pAuthEncrypterEcdh1PuV3x25519WithA256KW(
            recipients[1].recipientkey.publicKey,
            senderkey.secretKey,
            { kid: recipients[1].kid },
          ),
          decrypter: xc20pAuthDecrypterEcdh1PuV3x25519WithA256KW(
            recipients[1].recipientkey.secretKey,
            senderkey.publicKey,
          ),
        },
      }
    })

    it('Creates with only ciphertext', async () => {
      expect.assertions(4)
      const jwe = await createJWE(cleartext, [recipients[0].encrypter, recipients[1].encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P' })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[1].decrypter)).toEqual(cleartext)
    })

    it('Creates with data in protected header', async () => {
      expect.assertions(4)
      const skid = 'did:example:sender#key-1'
      const jwe = await createJWE(cleartext, [recipients[0].encrypter, recipients[1].encrypter], {
        more: 'protected',
        skid,
      })
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P', more: 'protected', skid })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
    })

    it('Creates with aad', async () => {
      expect.assertions(6)
      const aad = u8a.fromString('this data is authenticated')
      const jwe = await createJWE(
        cleartext,
        [recipients[0].encrypter, recipients[1].encrypter],
        { more: 'protected' },
        aad,
      )
      expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'XC20P', more: 'protected' })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[1].decrypter)).toEqual(cleartext)
      delete jwe.aad
      await expect(decryptJWE(jwe, recipients[0].decrypter)).rejects.toThrowError('Failed to decrypt')
      await expect(decryptJWE(jwe, recipients[0].decrypter)).rejects.toThrowError('Failed to decrypt')
    })

    it('Incompatible encrypters throw', async () => {
      expect.assertions(1)
      const enc1 = { enc: 'cool enc alg1' } as Encrypter
      const enc2 = { enc: 'cool enc alg2' } as Encrypter
      await expect(createJWE(cleartext, [enc1, enc2])).rejects.toThrowError('Incompatible encrypters passed')
    })
  })
})

describe('ECDH-ES+A256KW (X25519), Key Wrapping Mode with A256GCM content encryption', () => {
  describe('One recipient', () => {
    let cleartext: Uint8Array, recipientKey: any, senderKey: any, decrypter: Decrypter

    beforeEach(() => {
      recipientKey = generateX25519KeyPairFromSeed(randomBytes(32))
      senderKey = generateX25519KeyPairFromSeed(randomBytes(32))
      cleartext = u8a.fromString('my secret message')
      decrypter = a256gcmAnonDecrypterX25519WithA256KW(recipientKey.secretKey)
    })

    it('Creates with only ciphertext', async () => {
      const encrypter = a256gcmAnonEncrypterX25519WithA256KW(recipientKey.publicKey)
      expect.assertions(3)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with kid, no apu and no apv', async () => {
      const kid = 'did:example:receiver#key-1'
      const encrypter = a256gcmAnonEncrypterX25519WithA256KW(recipientKey.publicKey, kid)
      expect.assertions(6)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM' })
      expect(jwe.recipients!![0].header.kid).toEqual(kid)
      expect(jwe.recipients!![0].header.apu).toBeUndefined()
      expect(jwe.recipients!![0].header.apv).toBeUndefined()
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with no kid, with apv', async () => {
      const apv = encodeBase64url('Bob')
      const encrypter = a256gcmAnonEncrypterX25519WithA256KW(recipientKey.publicKey, undefined, apv)
      expect.assertions(5)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM' })
      expect(jwe.recipients!![0].header.kid).toBeUndefined()
      expect(jwe.recipients!![0].header.apv).toEqual(apv)
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with kid and apv', async () => {
      const kid = 'did:example:receiver#key-1'
      const apv = encodeBase64url('Bob')
      const encrypter = a256gcmAnonEncrypterX25519WithA256KW(recipientKey.publicKey, kid, apv)
      expect.assertions(5)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM' })
      expect(jwe.recipients!![0].header.kid).toEqual(kid)
      expect(jwe.recipients!![0].header.apv).toEqual(apv)
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with data in protected header', async () => {
      const encrypter = a256gcmAnonEncrypterX25519WithA256KW(recipientKey.publicKey)
      const skid = 'did:example:sender#key-1'
      expect.assertions(3)
      const jwe = await createJWE(cleartext, [encrypter], { skid, more: 'protected' })
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM', skid, more: 'protected' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with aad', async () => {
      const encrypter = a256gcmAnonEncrypterX25519WithA256KW(recipientKey.publicKey)
      expect.assertions(4)
      const aad = u8a.fromString('this data is authenticated')
      const jwe = await createJWE(cleartext, [encrypter], { more: 'protected' }, aad)
      expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM', more: 'protected' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
      delete jwe.aad
      await expect(decryptJWE(jwe, decrypter)).rejects.toThrowError('Failed to decrypt')
    })

    describe('using remote ECDH', () => {
      const message = 'hello world'
      const receiverPair = generateX25519KeyPairFromSeed(randomBytes(32))
      const receiverRemoteECDH = createX25519ECDH(receiverPair.secretKey)

      it('creates JWE with remote ECDH', async () => {
        const encrypter = a256gcmAnonEncrypterX25519WithA256KW(receiverPair.publicKey)
        const jwe: JWE = await createJWE(u8a.fromString(message), [encrypter])
        const decrypter = a256gcmAnonDecrypterX25519WithA256KW(receiverRemoteECDH)
        const decryptedBytes = await decryptJWE(jwe, decrypter)
        const receivedMessage = u8a.toString(decryptedBytes)
        expect(receivedMessage).toEqual(message)
      })
    })
  })

  describe('Multiple recipients', () => {
    let cleartext: any, senderkey: any
    const recipients: any[] = []

    beforeEach(() => {
      senderkey = generateX25519KeyPairFromSeed(randomBytes(32))
      cleartext = u8a.fromString('my secret message')

      recipients[0] = {
        kid: 'did:example:receiver1#key-1',
        recipientkey: generateX25519KeyPairFromSeed(randomBytes(32)),
      }
      recipients[0] = {
        ...recipients[0],
        ...{
          encrypter: a256gcmAnonEncrypterX25519WithA256KW(
            recipients[0].recipientkey.publicKey,
            recipients[0].kid,
          ),
          decrypter: a256gcmAnonDecrypterX25519WithA256KW(recipients[0].recipientkey.secretKey),
        },
      }

      recipients[1] = {
        kid: 'did:example:receiver2#key-1',
        recipientkey: generateX25519KeyPairFromSeed(randomBytes(32)),
      }
      recipients[1] = {
        ...recipients[1],
        ...{
          encrypter: a256gcmAnonEncrypterX25519WithA256KW(
            recipients[1].recipientkey.publicKey,
            recipients[1].kid,
          ),
          decrypter: a256gcmAnonDecrypterX25519WithA256KW(recipients[1].recipientkey.secretKey),
        },
      }
    })

    it('Creates with only ciphertext', async () => {
      expect.assertions(4)
      const jwe = await createJWE(cleartext, [recipients[0].encrypter, recipients[1].encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM' })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[1].decrypter)).toEqual(cleartext)
    })

    it('Creates with data in protected header', async () => {
      expect.assertions(4)
      const skid = 'did:example:sender#key-1'
      const jwe = await createJWE(cleartext, [recipients[0].encrypter, recipients[1].encrypter], {
        more: 'protected',
        skid,
      })
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM', more: 'protected', skid })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
    })

    it('Creates with aad', async () => {
      expect.assertions(6)
      const aad = u8a.fromString('this data is authenticated')
      const jwe = await createJWE(
        cleartext,
        [recipients[0].encrypter, recipients[1].encrypter],
        { more: 'protected' },
        aad,
      )
      expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM', more: 'protected' })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[1].decrypter)).toEqual(cleartext)
      delete jwe.aad
      await expect(decryptJWE(jwe, recipients[0].decrypter)).rejects.toThrowError('Failed to decrypt')
      await expect(decryptJWE(jwe, recipients[0].decrypter)).rejects.toThrowError('Failed to decrypt')
    })

    it('Incompatible encrypters throw', async () => {
      expect.assertions(1)
      const enc1 = { enc: 'cool enc alg1' } as Encrypter
      const enc2 = { enc: 'cool enc alg2' } as Encrypter
      await expect(createJWE(cleartext, [enc1, enc2])).rejects.toThrowError('Incompatible encrypters passed')
    })
  })
})

describe('ECDH-1PU+A256KW (X25519), Key Wrapping Mode with A256GCM content encryption', () => {
  describe('One recipient', () => {
    let cleartext: Uint8Array, recipientKey: any, senderKey: any, decrypter: Decrypter

    beforeEach(() => {
      recipientKey = generateX25519KeyPairFromSeed(randomBytes(32))
      senderKey = generateX25519KeyPairFromSeed(randomBytes(32))
      cleartext = u8a.fromString('my secret message')
      decrypter = a256gcmAuthDecrypterEcdh1PuV3x25519WithA256KW(recipientKey.secretKey, senderKey.publicKey)
    })

    it('Creates with only ciphertext', async () => {
      const encrypter = a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
      )
      expect.assertions(3)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with kid, no apu and no apv', async () => {
      const kid = 'did:example:receiver#key-1'
      const encrypter = a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
        {
          kid,
        },
      )
      expect.assertions(6)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM' })
      expect(jwe.recipients!![0].header.kid).toEqual(kid)
      expect(jwe.recipients!![0].header.apu).toBeUndefined()
      expect(jwe.recipients!![0].header.apv).toBeUndefined()
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with no kid, with apu and apv', async () => {
      const apu = encodeBase64url('Alice')
      const apv = encodeBase64url('Bob')
      const encrypter = a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
        {
          apu,
          apv,
        },
      )
      expect.assertions(6)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM' })
      expect(jwe.recipients!![0].header.kid).toBeUndefined()
      expect(jwe.recipients!![0].header.apu).toEqual(apu)
      expect(jwe.recipients!![0].header.apv).toEqual(apv)
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with kid and apu and apv', async () => {
      const kid = 'did:example:receiver#key-1'
      const apu = encodeBase64url('Alice')
      const apv = encodeBase64url('Bob')
      const encrypter = a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
        {
          kid,
          apu,
          apv,
        },
      )
      expect.assertions(6)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM' })
      expect(jwe.recipients!![0].header.kid).toEqual(kid)
      expect(jwe.recipients!![0].header.apu).toEqual(apu)
      expect(jwe.recipients!![0].header.apv).toEqual(apv)
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with data in protected header', async () => {
      const encrypter = a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
      )
      const skid = 'did:example:sender#key-1'
      expect.assertions(3)
      const jwe = await createJWE(cleartext, [encrypter], { skid, more: 'protected' })
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM', skid, more: 'protected' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with aad', async () => {
      const encrypter = a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
      )
      expect.assertions(4)
      const aad = u8a.fromString('this data is authenticated')
      const jwe = await createJWE(cleartext, [encrypter], { more: 'protected' }, aad)
      expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM', more: 'protected' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
      delete jwe.aad
      await expect(decryptJWE(jwe, decrypter)).rejects.toThrowError('Failed to decrypt')
    })

    describe('using remote ECDH', () => {
      const message = 'hello world'
      const receiverPair = generateX25519KeyPairFromSeed(randomBytes(32))
      const receiverRemoteECDH = createX25519ECDH(receiverPair.secretKey)
      const senderPair = generateX25519KeyPairFromSeed(randomBytes(32))
      const senderRemoteECDH: ECDH = createX25519ECDH(senderPair.secretKey)

      it('creates JWE with remote ECDH', async () => {
        const encrypter = a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW(
          receiverPair.publicKey,
          senderRemoteECDH,
        )
        const jwe: JWE = await createJWE(u8a.fromString(message), [encrypter])
        const decrypter = a256gcmAuthDecrypterEcdh1PuV3x25519WithA256KW(
          receiverRemoteECDH,
          senderPair.publicKey,
        )
        const decryptedBytes = await decryptJWE(jwe, decrypter)
        const receivedMessage = u8a.toString(decryptedBytes)
        expect(receivedMessage).toEqual(message)
      })
    })
  })

  describe('Multiple recipients', () => {
    let cleartext: any, senderkey: any
    const recipients: any[] = []

    beforeEach(() => {
      senderkey = generateX25519KeyPairFromSeed(randomBytes(32))
      cleartext = u8a.fromString('my secret message')

      recipients[0] = {
        kid: 'did:example:receiver1#key-1',
        recipientkey: generateX25519KeyPairFromSeed(randomBytes(32)),
      }
      recipients[0] = {
        ...recipients[0],
        ...{
          encrypter: a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW(
            recipients[0].recipientkey.publicKey,
            senderkey.secretKey,
            { kid: recipients[0].kid },
          ),
          decrypter: a256gcmAuthDecrypterEcdh1PuV3x25519WithA256KW(
            recipients[0].recipientkey.secretKey,
            senderkey.publicKey,
          ),
        },
      }

      recipients[1] = {
        kid: 'did:example:receiver2#key-1',
        recipientkey: generateX25519KeyPairFromSeed(randomBytes(32)),
      }
      recipients[1] = {
        ...recipients[1],
        ...{
          encrypter: a256gcmAuthEncrypterEcdh1PuV3x25519WithA256KW(
            recipients[1].recipientkey.publicKey,
            senderkey.secretKey,
            { kid: recipients[1].kid },
          ),
          decrypter: a256gcmAuthDecrypterEcdh1PuV3x25519WithA256KW(
            recipients[1].recipientkey.secretKey,
            senderkey.publicKey,
          ),
        },
      }
    })

    it('Creates with only ciphertext', async () => {
      expect.assertions(4)
      const jwe = await createJWE(cleartext, [recipients[0].encrypter, recipients[1].encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM' })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[1].decrypter)).toEqual(cleartext)
    })

    it('Creates with data in protected header', async () => {
      expect.assertions(4)
      const skid = 'did:example:sender#key-1'
      const jwe = await createJWE(cleartext, [recipients[0].encrypter, recipients[1].encrypter], {
        more: 'protected',
        skid,
      })
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM', more: 'protected', skid })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
    })

    it('Creates with aad', async () => {
      expect.assertions(6)
      const aad = u8a.fromString('this data is authenticated')
      const jwe = await createJWE(
        cleartext,
        [recipients[0].encrypter, recipients[1].encrypter],
        { more: 'protected' },
        aad,
      )
      expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256GCM', more: 'protected' })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[1].decrypter)).toEqual(cleartext)
      delete jwe.aad
      await expect(decryptJWE(jwe, recipients[0].decrypter)).rejects.toThrowError('Failed to decrypt')
      await expect(decryptJWE(jwe, recipients[0].decrypter)).rejects.toThrowError('Failed to decrypt')
    })

    it('Incompatible encrypters throw', async () => {
      expect.assertions(1)
      const enc1 = { enc: 'cool enc alg1' } as Encrypter
      const enc2 = { enc: 'cool enc alg2' } as Encrypter
      await expect(createJWE(cleartext, [enc1, enc2])).rejects.toThrowError('Incompatible encrypters passed')
    })
  })
})

describe('ECDH-ES+A256KW (X25519), Key Wrapping Mode with A256CBC-HS512 content encryption', () => {
  describe('One recipient', () => {
    let cleartext: Uint8Array, recipientKey: any, senderKey: any, decrypter: Decrypter

    beforeEach(() => {
      recipientKey = generateX25519KeyPairFromSeed(randomBytes(32))
      senderKey = generateX25519KeyPairFromSeed(randomBytes(32))
      cleartext = u8a.fromString('my secret message')
      decrypter = a256cbcHs512AnonDecrypterX25519WithA256KW(recipientKey.secretKey)
    })

    it('Creates with only ciphertext', async () => {
      const encrypter = a256cbcHs512AnonEncrypterX25519WithA256KW(recipientKey.publicKey)
      expect.assertions(3)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with kid, no apu and no apv', async () => {
      const kid = 'did:example:receiver#key-1'
      const encrypter = a256cbcHs512AnonEncrypterX25519WithA256KW(recipientKey.publicKey, kid)
      expect.assertions(6)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512' })
      expect(jwe.recipients!![0].header.kid).toEqual(kid)
      expect(jwe.recipients!![0].header.apu).toBeUndefined()
      expect(jwe.recipients!![0].header.apv).toBeUndefined()
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with no kid, with apv', async () => {
      const apv = encodeBase64url('Bob')
      const encrypter = a256cbcHs512AnonEncrypterX25519WithA256KW(recipientKey.publicKey, undefined, apv)
      expect.assertions(5)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512' })
      expect(jwe.recipients!![0].header.kid).toBeUndefined()
      expect(jwe.recipients!![0].header.apv).toEqual(apv)
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with kid and apv', async () => {
      const kid = 'did:example:receiver#key-1'
      const apv = encodeBase64url('Bob')
      const encrypter = a256cbcHs512AnonEncrypterX25519WithA256KW(recipientKey.publicKey, kid, apv)
      expect.assertions(5)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512' })
      expect(jwe.recipients!![0].header.kid).toEqual(kid)
      expect(jwe.recipients!![0].header.apv).toEqual(apv)
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with data in protected header', async () => {
      const encrypter = a256cbcHs512AnonEncrypterX25519WithA256KW(recipientKey.publicKey)
      const skid = 'did:example:sender#key-1'
      expect.assertions(3)
      const jwe = await createJWE(cleartext, [encrypter], { skid, more: 'protected' })
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({
        enc: 'A256CBC-HS512',
        skid,
        more: 'protected',
      })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with aad', async () => {
      const encrypter = a256cbcHs512AnonEncrypterX25519WithA256KW(recipientKey.publicKey)
      expect.assertions(4)
      const aad = u8a.fromString('this data is authenticated')
      const jwe = await createJWE(cleartext, [encrypter], { more: 'protected' }, aad)
      expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512', more: 'protected' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
      delete jwe.aad
      await expect(decryptJWE(jwe, decrypter)).rejects.toThrowError('Failed to decrypt')
    })

    describe('using remote ECDH', () => {
      const message = 'hello world'
      const receiverPair = generateX25519KeyPairFromSeed(randomBytes(32))
      const receiverRemoteECDH = createX25519ECDH(receiverPair.secretKey)

      it('creates JWE with remote ECDH', async () => {
        const encrypter = a256cbcHs512AnonEncrypterX25519WithA256KW(receiverPair.publicKey)
        const jwe: JWE = await createJWE(u8a.fromString(message), [encrypter])
        const decrypter = a256cbcHs512AnonDecrypterX25519WithA256KW(receiverRemoteECDH)
        const decryptedBytes = await decryptJWE(jwe, decrypter)
        const receivedMessage = u8a.toString(decryptedBytes)
        expect(receivedMessage).toEqual(message)
      })
    })
  })

  describe('Multiple recipients', () => {
    let cleartext: any, senderkey: any
    const recipients: any[] = []

    beforeEach(() => {
      senderkey = generateX25519KeyPairFromSeed(randomBytes(32))
      cleartext = u8a.fromString('my secret message')

      recipients[0] = {
        kid: 'did:example:receiver1#key-1',
        recipientkey: generateX25519KeyPairFromSeed(randomBytes(32)),
      }
      recipients[0] = {
        ...recipients[0],
        ...{
          encrypter: a256cbcHs512AnonEncrypterX25519WithA256KW(
            recipients[0].recipientkey.publicKey,
            recipients[0].kid,
          ),
          decrypter: a256cbcHs512AnonDecrypterX25519WithA256KW(recipients[0].recipientkey.secretKey),
        },
      }

      recipients[1] = {
        kid: 'did:example:receiver2#key-1',
        recipientkey: generateX25519KeyPairFromSeed(randomBytes(32)),
      }
      recipients[1] = {
        ...recipients[1],
        ...{
          encrypter: a256cbcHs512AnonEncrypterX25519WithA256KW(
            recipients[1].recipientkey.publicKey,
            recipients[1].kid,
          ),
          decrypter: a256cbcHs512AnonDecrypterX25519WithA256KW(recipients[1].recipientkey.secretKey),
        },
      }
    })

    it('Creates with only ciphertext', async () => {
      expect.assertions(4)
      const jwe = await createJWE(cleartext, [recipients[0].encrypter, recipients[1].encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512' })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[1].decrypter)).toEqual(cleartext)
    })

    it('Creates with data in protected header', async () => {
      expect.assertions(4)
      const skid = 'did:example:sender#key-1'
      const jwe = await createJWE(cleartext, [recipients[0].encrypter, recipients[1].encrypter], {
        more: 'protected',
        skid,
      })
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({
        enc: 'A256CBC-HS512',
        more: 'protected',
        skid,
      })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
    })

    it('Creates with aad', async () => {
      expect.assertions(6)
      const aad = u8a.fromString('this data is authenticated')
      const jwe = await createJWE(
        cleartext,
        [recipients[0].encrypter, recipients[1].encrypter],
        { more: 'protected' },
        aad,
      )
      expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512', more: 'protected' })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[1].decrypter)).toEqual(cleartext)
      delete jwe.aad
      await expect(decryptJWE(jwe, recipients[0].decrypter)).rejects.toThrowError('Failed to decrypt')
      await expect(decryptJWE(jwe, recipients[0].decrypter)).rejects.toThrowError('Failed to decrypt')
    })

    it('Incompatible encrypters throw', async () => {
      expect.assertions(1)
      const enc1 = { enc: 'cool enc alg1' } as Encrypter
      const enc2 = { enc: 'cool enc alg2' } as Encrypter
      await expect(createJWE(cleartext, [enc1, enc2])).rejects.toThrowError('Incompatible encrypters passed')
    })
  })
})

describe('ECDH-1PU+A256KW (X25519), Key Wrapping Mode with A256CBC-HS512 content encryption', () => {
  describe('One recipient', () => {
    let cleartext: Uint8Array, recipientKey: any, senderKey: any, decrypter: Decrypter

    beforeEach(() => {
      recipientKey = generateX25519KeyPairFromSeed(randomBytes(32))
      senderKey = generateX25519KeyPairFromSeed(randomBytes(32))
      cleartext = u8a.fromString('my secret message')
      decrypter = a256cbcHs512AuthDecrypterX25519WithA256KW(recipientKey.secretKey, senderKey.publicKey)
    })

    it('Creates with only ciphertext', async () => {
      const encrypter = a256cbcHs512AuthEncrypterX25519WithA256KW(recipientKey.publicKey, senderKey.secretKey)
      expect.assertions(3)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with kid, no apu and no apv', async () => {
      const kid = 'did:example:receiver#key-1'
      const encrypter = a256cbcHs512AuthEncrypterX25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
        {
          kid,
        },
      )
      expect.assertions(6)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512' })
      expect(jwe.recipients!![0].header.kid).toEqual(kid)
      expect(jwe.recipients!![0].header.apu).toBeUndefined()
      expect(jwe.recipients!![0].header.apv).toBeUndefined()
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with no kid, with apu and apv', async () => {
      const apu = encodeBase64url('Alice')
      const apv = encodeBase64url('Bob')
      const encrypter = a256cbcHs512AuthEncrypterX25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
        {
          apu,
          apv,
        },
      )
      expect.assertions(6)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512' })
      expect(jwe.recipients!![0].header.kid).toBeUndefined()
      expect(jwe.recipients!![0].header.apu).toEqual(apu)
      expect(jwe.recipients!![0].header.apv).toEqual(apv)
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with kid and apu and apv', async () => {
      const kid = 'did:example:receiver#key-1'
      const apu = encodeBase64url('Alice')
      const apv = encodeBase64url('Bob')
      const encrypter = a256cbcHs512AuthEncrypterX25519WithA256KW(
        recipientKey.publicKey,
        senderKey.secretKey,
        {
          kid,
          apu,
          apv,
        },
      )
      expect.assertions(6)
      const jwe = await createJWE(cleartext, [encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512' })
      expect(jwe.recipients!![0].header.kid).toEqual(kid)
      expect(jwe.recipients!![0].header.apu).toEqual(apu)
      expect(jwe.recipients!![0].header.apv).toEqual(apv)
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with data in protected header', async () => {
      const encrypter = a256cbcHs512AuthEncrypterX25519WithA256KW(recipientKey.publicKey, senderKey.secretKey)
      const skid = 'did:example:sender#key-1'
      expect.assertions(3)
      const jwe = await createJWE(cleartext, [encrypter], { skid, more: 'protected' })
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({
        enc: 'A256CBC-HS512',
        skid,
        more: 'protected',
      })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
    })

    it('Creates with aad', async () => {
      const encrypter = a256cbcHs512AuthEncrypterX25519WithA256KW(recipientKey.publicKey, senderKey.secretKey)
      expect.assertions(4)
      const aad = u8a.fromString('this data is authenticated')
      const jwe = await createJWE(cleartext, [encrypter], { more: 'protected' }, aad)
      expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512', more: 'protected' })
      expect(await decryptJWE(jwe, decrypter)).toEqual(cleartext)
      delete jwe.aad
      await expect(decryptJWE(jwe, decrypter)).rejects.toThrowError('Failed to decrypt')
    })

    describe('using remote ECDH', () => {
      const message = 'hello world'
      const receiverPair = generateX25519KeyPairFromSeed(randomBytes(32))
      const receiverRemoteECDH = createX25519ECDH(receiverPair.secretKey)
      const senderPair = generateX25519KeyPairFromSeed(randomBytes(32))
      const senderRemoteECDH: ECDH = createX25519ECDH(senderPair.secretKey)

      it('creates JWE with remote ECDH', async () => {
        const encrypter = a256cbcHs512AuthEncrypterX25519WithA256KW(receiverPair.publicKey, senderRemoteECDH)
        const jwe: JWE = await createJWE(u8a.fromString(message), [encrypter])
        const decrypter = a256cbcHs512AuthDecrypterX25519WithA256KW(receiverRemoteECDH, senderPair.publicKey)
        const decryptedBytes = await decryptJWE(jwe, decrypter)
        const receivedMessage = u8a.toString(decryptedBytes)
        expect(receivedMessage).toEqual(message)
      })
    })
  })

  describe('Multiple recipients', () => {
    let cleartext: any, senderkey: any
    const recipients: any[] = []

    beforeEach(() => {
      senderkey = generateX25519KeyPairFromSeed(randomBytes(32))
      cleartext = u8a.fromString('my secret message')

      recipients[0] = {
        kid: 'did:example:receiver1#key-1',
        recipientkey: generateX25519KeyPairFromSeed(randomBytes(32)),
      }
      recipients[0] = {
        ...recipients[0],
        ...{
          encrypter: a256cbcHs512AuthEncrypterX25519WithA256KW(
            recipients[0].recipientkey.publicKey,
            senderkey.secretKey,
            { kid: recipients[0].kid },
          ),
          decrypter: a256cbcHs512AuthDecrypterX25519WithA256KW(
            recipients[0].recipientkey.secretKey,
            senderkey.publicKey,
          ),
        },
      }

      recipients[1] = {
        kid: 'did:example:receiver2#key-1',
        recipientkey: generateX25519KeyPairFromSeed(randomBytes(32)),
      }
      recipients[1] = {
        ...recipients[1],
        ...{
          encrypter: a256cbcHs512AuthEncrypterX25519WithA256KW(
            recipients[1].recipientkey.publicKey,
            senderkey.secretKey,
            { kid: recipients[1].kid },
          ),
          decrypter: a256cbcHs512AuthDecrypterX25519WithA256KW(
            recipients[1].recipientkey.secretKey,
            senderkey.publicKey,
          ),
        },
      }
    })

    it('Creates with only ciphertext', async () => {
      expect.assertions(4)
      const jwe = await createJWE(cleartext, [recipients[0].encrypter, recipients[1].encrypter])
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512' })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[1].decrypter)).toEqual(cleartext)
    })

    it('Creates with data in protected header', async () => {
      expect.assertions(4)
      const skid = 'did:example:sender#key-1'
      const jwe = await createJWE(cleartext, [recipients[0].encrypter, recipients[1].encrypter], {
        more: 'protected',
        skid,
      })
      expect(jwe.aad).toBeUndefined()
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({
        enc: 'A256CBC-HS512',
        more: 'protected',
        skid,
      })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
    })

    it('Creates with aad', async () => {
      expect.assertions(6)
      const aad = u8a.fromString('this data is authenticated')
      const jwe = await createJWE(
        cleartext,
        [recipients[0].encrypter, recipients[1].encrypter],
        { more: 'protected' },
        aad,
      )
      expect(u8a.fromString(jwe.aad!!, 'base64url')).toEqual(aad)
      expect(JSON.parse(decodeBase64url(jwe.protected))).toEqual({ enc: 'A256CBC-HS512', more: 'protected' })
      expect(await decryptJWE(jwe, recipients[0].decrypter)).toEqual(cleartext)
      expect(await decryptJWE(jwe, recipients[1].decrypter)).toEqual(cleartext)
      delete jwe.aad
      await expect(decryptJWE(jwe, recipients[0].decrypter)).rejects.toThrowError('Failed to decrypt')
      await expect(decryptJWE(jwe, recipients[0].decrypter)).rejects.toThrowError('Failed to decrypt')
    })

    it('Incompatible encrypters throw', async () => {
      expect.assertions(1)
      const enc1 = { enc: 'cool enc alg1' } as Encrypter
      const enc2 = { enc: 'cool enc alg2' } as Encrypter
      await expect(createJWE(cleartext, [enc1, enc2])).rejects.toThrowError('Incompatible encrypters passed')
    })
  })
})
