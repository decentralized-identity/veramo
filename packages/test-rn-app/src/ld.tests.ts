// JSON-LD tests for the RN harness. Harness-agnostic, like safe-set.tests.ts: no test
// framework, no globals beyond `console` and Promise, so it runs the same bundled on Hermes and on Node.
//
// It replays credential-ld's golden fixtures (packages/credential-ld/test-fixtures/golden,
// issued by the pre-de-fork stack with fixed keys, DIDs and clock) through @veramo/credential-ld's public
// entry point, one agent per suite:
//   1. verify the golden credential and presentation,
//   2. re-issue both with the same keys and a frozen clock and require byte-identical output.

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
import { assert, createTestRun, type Result } from './harness.ts'
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

type Golden = { credential: any; presentation: any }
type Case = {
  name: string
  suite: () => any
  did: string
  key: any
  resolutionOptions?: any
  golden: Golden
}

export const LD_CASES: Case[] = [
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

async function makeAgent(c: Case) {
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

/** JSON with sorted keys, so two documents compare by content, not by key order. */
function stable(value: any): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable(value[k])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

export async function runLd(): Promise<Result> {
  const { result, test } = createTestRun()
  for (const c of LD_CASES) {
    const agent = await makeAgent(c)
    const { credential, presentation } = c.golden

    await test(`${c.name}: verify the golden credential`, async () => {
      const r = await agent.verifyCredential({ credential, resolutionOptions: c.resolutionOptions })
      assert(r.verified === true, 'not verified: ' + String(r.error?.message ?? JSON.stringify(r.error)))
    })

    await test(`${c.name}: verify the golden presentation`, async () => {
      const r = await agent.verifyPresentation({
        presentation,
        challenge: 'golden-challenge',
        domain: 'golden.example',
        resolutionOptions: c.resolutionOptions,
      })
      assert(r.verified === true, 'not verified: ' + String(r.error?.message ?? JSON.stringify(r.error)))
    })

    await test(`${c.name}: re-issue the golden credential and presentation byte-for-byte`, async () => {
      const issued = await atFixedTime(async () => {
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
      assert(
        stable(issued.credential) === stable(credential),
        'credential differs: ' + stable(issued.credential),
      )
      assert(stable(issued.presentation) === stable(presentation), 'presentation differs')
    })
  }
  return result
}
