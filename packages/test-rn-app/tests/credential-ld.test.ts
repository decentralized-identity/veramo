// @veramo/credential-ld through its public entry point, replaying its golden fixtures
// (packages/credential-ld/test-fixtures/golden, issued by the pre-de-fork stack with fixed keys, DIDs and clock), one
// agent per suite: verify the golden credential and presentation, then re-issue both with the same inputs and a
// frozen clock and require identical output.
import { describe, expect, it } from 'vitest'
import { createAgent } from '@veramo/core'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { CredentialPlugin } from '@veramo/credential-w3c'
import {
  CredentialProviderLD,
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
  VeramoEd25519Signature2018,
  VeramoEd25519Signature2020,
  VeramoJsonWebSignature2020,
} from '@veramo/credential-ld'
import { getDidKeyResolver } from '@veramo/did-provider-key'
import { getDidPkhResolver } from '@veramo/did-provider-pkh'
import { Resolver } from 'did-resolver'
import ed25519_2018 from '../../credential-ld/test-fixtures/golden/ed25519-2018.json' with { type: 'json' }
import ed25519_2020 from '../../credential-ld/test-fixtures/golden/ed25519-2020.json' with { type: 'json' }
import jws_2020 from '../../credential-ld/test-fixtures/golden/jws-2020.json' with { type: 'json' }
import ecdsa_2020 from '../../credential-ld/test-fixtures/golden/ecdsa-secp256k1-recovery-2020.json' with { type: 'json' }

// Same fixed inputs as packages/credential-ld/src/__tests__/golden-compat.test.ts.
const NOW = Date.parse('2026-01-02T03:04:05Z')
const ED25519 = {
  type: 'Ed25519',
  kid: 'golden-ed25519',
  kms: 'local',
  publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
  privateKeyHex:
    'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
}
const SECP256K1 = {
  type: 'Secp256k1',
  kid: 'golden-secp256k1',
  kms: 'local',
  privateKeyHex: '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f',
}
const DID_KEY = 'did:key:z6MkgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo'
const DID_PKH = 'did:pkh:eip155:1:0xF3beAC30C498D9E26865F34fCAa57dBB935b0D74'

type GoldenCase = {
  name: string
  suite: () => any
  did: string
  key: any
  resolutionOptions?: any
  golden: { credential: any; presentation: any }
}

const CASES: GoldenCase[] = [
  {
    name: 'Ed25519Signature2018',
    suite: () => new VeramoEd25519Signature2018(),
    did: DID_KEY,
    key: ED25519,
    resolutionOptions: { publicKeyFormat: 'Ed25519VerificationKey2018' },
    golden: ed25519_2018,
  },
  {
    name: 'Ed25519Signature2020',
    suite: () => new VeramoEd25519Signature2020(),
    did: DID_KEY,
    key: ED25519,
    resolutionOptions: { publicKeyFormat: 'Ed25519VerificationKey2020' },
    golden: ed25519_2020,
  },
  {
    name: 'JsonWebSignature2020',
    suite: () => new VeramoJsonWebSignature2020(),
    did: DID_KEY,
    key: ED25519,
    resolutionOptions: { publicKeyFormat: 'JsonWebKey2020' },
    golden: jws_2020,
  },
  {
    name: 'EcdsaSecp256k1RecoverySignature2020',
    suite: () => new VeramoEcdsaSecp256k1RecoverySignature2020(),
    did: DID_PKH,
    key: SECP256K1,
    golden: ecdsa_2020,
  },
]

/** An agent with only this case's suite, and its DID imported with the fixed key. */
async function makeAgent(c: GoldenCase) {
  const agent: any = createAgent({
    plugins: [
      new KeyManager({
        store: new MemoryKeyStore(),
        kms: { local: new KeyManagementSystem(new MemoryPrivateKeyStore()) },
      }),
      new DIDManager({ providers: {}, store: new MemoryDIDStore(), defaultProvider: 'none' }),
      new DIDResolverPlugin({ resolver: new Resolver({ ...getDidKeyResolver(), ...getDidPkhResolver() }) }),
      new CredentialPlugin([
        new CredentialProviderLD({ contextMaps: [LdDefaultContexts], suites: [c.suite()] }),
      ]),
    ],
  })
  await agent.didManagerImport({ did: c.did, provider: 'none', keys: [c.key] })
  return agent
}

/** Runs `fn` with `new Date()` / `Date.now()` pinned to NOW (proofs carry a `created` timestamp). */
async function atFixedTime<T>(fn: () => Promise<T>): Promise<T> {
  const RealDate = Date
  class FixedDate extends RealDate {
    constructor(...args: any[]) {
      super(...((args.length ? args : [NOW]) as [any]))
    }
    static now() {
      return NOW
    }
  }
  globalThis.Date = FixedDate as DateConstructor
  try {
    return await fn()
  } finally {
    globalThis.Date = RealDate
  }
}

describe('@veramo/credential-ld golden fixtures', () => {
  it.each(CASES)('verifies the $name credential', async (c) => {
    const agent = await makeAgent(c)
    const result = await agent.verifyCredential({
      credential: c.golden.credential,
      resolutionOptions: c.resolutionOptions,
    })
    expect(result.error).toBeUndefined()
    expect(result.verified).toBe(true)
  })

  it.each(CASES)('verifies the $name presentation', async (c) => {
    const agent = await makeAgent(c)
    const result = await agent.verifyPresentation({
      presentation: c.golden.presentation,
      challenge: 'golden-challenge',
      domain: 'golden.example',
      resolutionOptions: c.resolutionOptions,
    })
    expect(result.error).toBeUndefined()
    expect(result.verified).toBe(true)
  })

  // issues the golden credential and presentation again, from the same inputs, at the fixtures' time
  it.each(CASES)('re-issues the $name credential and presentation identically', async (c) => {
    const agent = await makeAgent(c)
    const { credential, presentation } = c.golden
    const reissued = await atFixedTime(async () => {
      const vc = await agent.createVerifiableCredential({
        credential: {
          '@context': credential['@context'].slice(0, 2),
          type: credential.type,
          issuer: credential.issuer,
          issuanceDate: credential.issuanceDate,
          credentialSubject: credential.credentialSubject,
        },
        proofFormat: 'lds',
        resolutionOptions: c.resolutionOptions,
      })
      const vp = await agent.createVerifiablePresentation({
        presentation: { holder: c.did, verifiableCredential: [vc] },
        challenge: 'golden-challenge',
        domain: 'golden.example',
        proofFormat: 'lds',
        resolutionOptions: c.resolutionOptions,
      })
      return { credential: vc, presentation: vp }
    })
    expect(reissued.credential).toStrictEqual(credential)
    expect(reissued.presentation).toStrictEqual(presentation)
  })
})
