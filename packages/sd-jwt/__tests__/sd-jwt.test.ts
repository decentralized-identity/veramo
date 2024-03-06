import { subtle } from 'node:crypto'
import { digest, generateSalt } from '@sd-jwt/crypto-nodejs'
import { DisclosureFrame, kbPayload } from '@sd-jwt/types'
import { createAgent } from '@veramo/core'
import { IDIDManager, IKeyManager, IResolver, TAgent } from '@veramo/core-types'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { JwkCreateIdentifierOptions, JwkDIDProvider, getDidJwkResolver } from '@veramo/did-provider-jwk'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { JwkDidSupportedKeyTypes, createJWK } from '@veramo/utils'
import { DIDDocument, Resolver, VerificationMethod } from 'did-resolver'
import { SdJwtVcPayload } from '@sd-jwt/sd-jwt-vc'
import { decodeSdJwt } from '@sd-jwt/decode'
import { KBJwt } from '@sd-jwt/core'
import { ISDJwtPlugin, SDJwtPlugin } from '../src/index'

async function verifySignature<T>(data: string, signature: string, key: JsonWebKey) {
  let { alg, crv } = key
  if (alg === 'ES256') alg = 'ECDSA'
  const publicKey = await subtle.importKey(
    'jwk',
    key,
    { name: alg, namedCurve: crv } as EcKeyImportParams,
    true,
    ['verify'],
  )
  return Promise.resolve(
    subtle.verify(
      { name: alg as string, hash: 'SHA-256' },
      publicKey,
      Buffer.from(signature, 'base64'),
      Buffer.from(data),
    ),
  )
}

type AgentType = IDIDManager & IKeyManager & IResolver & ISDJwtPlugin

describe('Agent plugin', () => {
  let agent: TAgent<AgentType>

  let issuer: string

  let holder: string

  // Issuer Define the claims object with the user's information
  const claims = {
    sub: '',
    given_name: 'John',
    family_name: 'Deo',
    email: 'johndeo@example.com',
    phone: '+1-202-555-0101',
    address: {
      street_address: '123 Main St',
      locality: 'Anytown',
      region: 'Anystate',
      country: 'US',
    },
    birthdate: '1940-01-01',
  }

  // Issuer Define the disclosure frame to specify which claims can be disclosed
  const disclosureFrame: DisclosureFrame<typeof claims> = {
    _sd: ['given_name', 'family_name', 'email', 'phone', 'address', 'birthdate'],
  }

  beforeAll(async () => {
    agent = createAgent<AgentType>({
      plugins: [
        new SDJwtPlugin({
          hasher: digest,
          saltGenerator: generateSalt,
          verifySignature,
        }),
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: {
            local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
          },
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...getDidJwkResolver(),
          }),
        }),
        new DIDManager({
          store: new MemoryDIDStore(),
          defaultProvider: 'did:jwk',
          providers: {
            'did:jwk': new JwkDIDProvider({
              defaultKms: 'local',
            }),
          },
        }),
      ],
    })
    issuer = await agent
      .didManagerCreate({
        kms: 'local',
        provider: 'did:jwk',
        alias: 'issuer',
        //we use this curve since nodejs does not support ES256k which is the default one.
        options: { keyType: 'Secp256r1' } as JwkCreateIdentifierOptions,
      })
      .then((did) => {
        // we add a key reference
        return `${did.did}#0`
      })
    holder = await agent
      .didManagerCreate({
        kms: 'local',
        provider: 'did:jwk',
        alias: 'holder',
        //we use this curve since nodejs does not support ES256k which is the default one.
        options: { keyType: 'Secp256r1' } as JwkCreateIdentifierOptions,
      })
      .then((did) => `${did.did}#0`)
    claims.sub = holder
  })

  it('create a sd-jwt', async () => {
    const credentialPayload: SdJwtVcPayload = {
      ...claims,
      iss: issuer,
      iat: new Date().getTime() / 1000,
      vct: '',
    }
    const credential = await agent.createSdJwtVc({
      credentialPayload,
      disclosureFrame,
    })
    expect(credential).toBeDefined()
  })

  it('create sd without an issuer', async () => {
    const credentialPayload = {
      ...claims,
      iat: new Date().getTime() / 1000,
      vct: '',
    }
    expect(
      agent.createSdJwtVc({
        credentialPayload: credentialPayload as unknown as SdJwtVcPayload,
        disclosureFrame,
      }),
    ).rejects.toThrow('credential.issuer must not be empty')
  })

  it('creat sd without the issuers key reference', async () => {
    const credentialPayload: SdJwtVcPayload = {
      ...claims,
      iss: 'did:web:issuer',
      iat: new Date().getTime() / 1000,
      vct: '',
    }
    expect(
      agent.createSdJwtVc({
        credentialPayload,
        disclosureFrame,
      }),
    ).rejects.toThrow('credential.issuer must reference a key')
  })

  it('verify a sd-jwt', async () => {
    const credentialPayload: SdJwtVcPayload = {
      ...claims,
      iss: issuer,
      iat: new Date().getTime() / 1000,
      vct: '',
    }
    const credential = await agent.createSdJwtVc({
      credentialPayload,
      disclosureFrame: disclosureFrame,
    })
    const verified = await agent.verifySdJwtVc({
      credential: credential.credential,
    })
  }, 5000)

  it('create a presentation', async () => {
    const credentialPayload: SdJwtVcPayload = {
      ...claims,
      iss: issuer,
      iat: new Date().getTime() / 1000,
      vct: '',
    }
    const credential = await agent.createSdJwtVc({
      credentialPayload,
      disclosureFrame,
    })
    const presentation = await agent.createSdJwtVcPresentation({
      presentation: credential.credential,
      presentationKeys: ['given_name'],
      kb: {
        payload: {
          aud: '1',
          iat: 1,
          nonce: '342',
        },
      },
    })
    expect(presentation).toBeDefined()
    const decoded = await decodeSdJwt(presentation.presentation, digest)
    expect(decoded.kbJwt).toBeDefined()
    expect(((decoded.kbJwt as KBJwt).payload as kbPayload).aud).toBe('1')
  })

  it('create presentation with cnf', async () => {
    const did = await agent.didManagerFind({ alias: 'holder' }).then((dids) => dids[0])
    const jwk = createJWK(did.keys[0].type as JwkDidSupportedKeyTypes, did.keys[0].publicKeyHex) as JsonWebKey
    const credentialPayload: SdJwtVcPayload = {
      ...claims,
      cnf: {
        jwk,
      },
      iss: issuer,
      iat: new Date().getTime() / 1000,
      vct: '',
    }
    const credential = await agent.createSdJwtVc({
      credentialPayload,
      disclosureFrame,
    })
    const presentation = await agent.createSdJwtVcPresentation({
      presentation: credential.credential,
      presentationKeys: ['given_name'],
      kb: {
        payload: {
          aud: '1',
          iat: 1,
          nonce: '342',
        },
      },
    })
    expect(presentation).toBeDefined()
    const decoded = await decodeSdJwt(presentation.presentation, digest)
    expect(decoded.kbJwt).toBeDefined()
    expect(((decoded.kbJwt as KBJwt).payload as kbPayload).aud).toBe('1')
  })

  it('includes no holder reference', async () => {
    const newClaims = JSON.parse(JSON.stringify(claims))
    newClaims.sub = undefined
    const credentialPayload: SdJwtVcPayload = {
      ...newClaims,
      iss: issuer,
      iat: new Date().getTime() / 1000,
      vct: '',
    }
    const credential = await agent.createSdJwtVc({
      credentialPayload,
      disclosureFrame,
    })
    const presentation = agent.createSdJwtVcPresentation({
      presentation: credential.credential,
      presentationKeys: ['given_name'],
      kb: {
        payload: {
          aud: '1',
          iat: 1,
          nonce: '342',
        },
      },
    })
    expect(presentation).rejects.toThrow('credential does not include a holder reference')
  })

  it('verify a presentation', async () => {
    const holderDId = await agent.resolveDid({ didUrl: holder })
    const jwk: JsonWebKey = (
      (holderDId.didDocument as DIDDocument).verificationMethod as VerificationMethod[]
    )[0].publicKeyJwk as JsonWebKey
    const credentialPayload: SdJwtVcPayload = {
      ...claims,
      iss: issuer,
      iat: new Date().getTime() / 1000,
      vct: '',
      cnf: {
        jwk,
      },
    }
    const credential = await agent.createSdJwtVc({
      credentialPayload,
      disclosureFrame,
    })
    const presentation = await agent.createSdJwtVcPresentation({
      presentation: credential.credential,
      presentationKeys: ['given_name'],
      kb: {
        payload: {
          aud: '1',
          iat: 1,
          nonce: '342',
        },
      },
    })
    const result = await agent.verifySdJwtVcPresentation({
      presentation: presentation.presentation,
      requiredClaimKeys: ['given_name'],
      // we are not able to verify the kb yet since we have no reference to the public key of the holder.
      kb: true,
    })
    expect(result).toBeDefined()
    expect((result.verifiedPayloads.payload as typeof claims).given_name).toBe('John')
  })

  it('verify a presentation with sub set', async () => {
    const holderDId = await agent.resolveDid({ didUrl: holder })
    const jwk: JsonWebKey = (
      (holderDId.didDocument as DIDDocument).verificationMethod as VerificationMethod[]
    )[0].publicKeyJwk as JsonWebKey
    const credentialPayload: SdJwtVcPayload = {
      ...claims,
      iss: issuer,
      iat: new Date().getTime() / 1000,
      vct: '',
      cnf: {
        jwk,
      },
    }
    const credential = await agent.createSdJwtVc({
      credentialPayload,
      disclosureFrame,
    })
    const presentation = await agent.createSdJwtVcPresentation({
      presentation: credential.credential,
      presentationKeys: ['given_name'],
      kb: {
        payload: {
          aud: '1',
          iat: 1,
          nonce: '342',
        },
      },
    })
    const result = await agent.verifySdJwtVcPresentation({
      presentation: presentation.presentation,
      requiredClaimKeys: ['given_name'],
      // we are not able to verify the kb yet since we have no reference to the public key of the holder.
      kb: true,
    })
    expect(result).toBeDefined()
    expect((result.verifiedPayloads.payload as typeof claims).given_name).toBe('John')
  })
})
