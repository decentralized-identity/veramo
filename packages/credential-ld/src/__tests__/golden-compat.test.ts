/**
 * Golden compatibility fixtures for the JSON-LD de-fork.
 *
 * `fixtures/golden/*.json` were issued ONCE by the pre-de-fork stack
 * (@digitalcredentials/* + @transmute/* + the EcdsaSecp256k1RecoverySignature2020
 * git fork), with fixed keys, fixed DIDs and a fixed clock. Whatever stack
 * credential-ld rides now must:
 *
 *   1. VERIFY every golden credential and presentation (backwards compatibility
 *      for credentials already in the wild), and
 *   2. RE-ISSUE them byte-for-byte. Every suite here signs deterministically
 *      (Ed25519, and RFC 6979 for secp256k1), so an identical proof means the
 *      same canonicalization, the same hashing and the same signature encoding.
 *
 * Regenerate (only when a shape change is intended and reviewed):
 *   REGENERATE_GOLDEN=1 pnpm vitest run packages/credential-ld/src/__tests__/golden-compat.test.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { Resolver } from 'did-resolver'
import { computeAddress } from 'ethers'

import {
  ICredentialPlugin,
  IDIDManager,
  IKeyManager,
  IResolver,
  TAgent,
  TKeyType,
} from '../../../core-types/src/index.js'
import { createAgent } from '../../../core/src/index.js'
import { CredentialPlugin } from '../../../credential-w3c/src/index.js'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src/index.js'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src/index.js'
import { KeyManagementSystem } from '../../../kms-local/src/index.js'
import { DIDResolverPlugin } from '../../../did-resolver/src/index.js'
import { getDidKeyResolver } from '../../../did-provider-key/src/index.js'
import { getDidPkhResolver } from '../../../did-provider-pkh/src/index.js'
import { bytesToMultibase, hexToBytes } from '../../../utils/src/index.js'
import {
  CredentialProviderLD,
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
  VeramoEd25519Signature2018,
  VeramoEd25519Signature2020,
  VeramoJsonWebSignature2020,
  VeramoLdSignature,
} from '../index.js'

const REGENERATE = process.env.REGENERATE_GOLDEN === '1'
const FIXTURES = new URL('./fixtures/golden/', import.meta.url)
const NOW = new Date('2026-01-02T03:04:05Z')

const ED25519 = {
  type: 'Ed25519' as TKeyType,
  kid: 'golden-ed25519',
  publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
  privateKeyHex:
    'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
}
const SECP256K1 = {
  type: 'Secp256k1' as TKeyType,
  kid: 'golden-secp256k1',
  privateKeyHex: '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f',
}
const DID_KEY = `did:key:${bytesToMultibase(hexToBytes(ED25519.publicKeyHex), 'base58btc', 'ed25519-pub')}`
const DID_PKH = `did:pkh:eip155:1:${computeAddress('0x' + SECP256K1.privateKeyHex)}`

type Case = {
  name: string
  proofType: string
  suite: () => VeramoLdSignature
  did: string
  key: typeof ED25519 | typeof SECP256K1
  resolutionOptions?: Record<string, any>
}

const CASES: Case[] = [
  {
    name: 'ed25519-2018',
    proofType: 'Ed25519Signature2018',
    suite: () => new VeramoEd25519Signature2018(),
    did: DID_KEY,
    key: ED25519,
    resolutionOptions: { publicKeyFormat: 'Ed25519VerificationKey2018' },
  },
  {
    name: 'ed25519-2020',
    proofType: 'Ed25519Signature2020',
    suite: () => new VeramoEd25519Signature2020(),
    did: DID_KEY,
    key: ED25519,
    resolutionOptions: { publicKeyFormat: 'Ed25519VerificationKey2020' },
  },
  {
    name: 'jws-2020',
    proofType: 'JsonWebSignature2020',
    suite: () => new VeramoJsonWebSignature2020(),
    did: DID_KEY,
    key: ED25519,
    resolutionOptions: { publicKeyFormat: 'JsonWebKey2020' },
  },
  {
    name: 'ecdsa-secp256k1-recovery-2020',
    proofType: 'EcdsaSecp256k1RecoverySignature2020',
    suite: () => new VeramoEcdsaSecp256k1RecoverySignature2020(),
    did: DID_PKH,
    key: SECP256K1,
  },
]

type Agent = TAgent<IResolver & IKeyManager & IDIDManager & ICredentialPlugin>

async function makeAgent(c: Case): Promise<Agent> {
  const agent = createAgent<Agent>({
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
  await agent.didManagerImport({ did: c.did, provider: 'none', keys: [{ ...c.key, kms: 'local' } as any] })
  return agent
}

const credentialFor = (c: Case) => ({
  '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
  type: ['VerifiableCredential', 'Profile'],
  issuer: { id: c.did },
  issuanceDate: '2026-01-01T00:00:00Z',
  credentialSubject: { id: 'did:example:subject', name: 'golden ' + c.name },
})

async function issue(agent: Agent, c: Case) {
  const credential = await agent.createVerifiableCredential({
    credential: credentialFor(c),
    proofFormat: 'lds',
    resolutionOptions: c.resolutionOptions,
  })
  const presentation = await agent.createVerifiablePresentation({
    presentation: { holder: c.did, verifiableCredential: [credential] },
    challenge: 'golden-challenge',
    domain: 'golden.example',
    proofFormat: 'lds',
    resolutionOptions: c.resolutionOptions,
  })
  return { credential, presentation }
}

const fixturePath = (c: Case) => new URL(`${c.name}.json`, FIXTURES)

describe('golden JSON-LD fixtures (pre-de-fork compatibility)', () => {
  beforeAll(() => {
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] })
  })
  afterAll(() => {
    vi.useRealTimers()
  })

  describe.each(CASES)('$proofType ($name)', (c) => {
    let agent: Agent
    let golden: { credential: any; presentation: any }

    beforeAll(async () => {
      agent = await makeAgent(c)
      if (REGENERATE) {
        writeFileSync(fixturePath(c), JSON.stringify(await issue(agent, c), null, 2) + '\n')
      }
      golden = JSON.parse(readFileSync(fixturePath(c), 'utf8'))
    })

    it('golden credential and presentation carry the expected proof type', () => {
      expect(golden.credential.proof.type).toBe(c.proofType)
      expect(golden.presentation.proof.type).toBe(c.proofType)
    })

    it('verifies the golden credential', async () => {
      const result = await agent.verifyCredential({
        credential: golden.credential,
        resolutionOptions: c.resolutionOptions,
      })
      expect(result.error).toBeUndefined()
      expect(result.verified).toBe(true)
    })

    it('verifies the golden presentation', async () => {
      const result = await agent.verifyPresentation({
        presentation: golden.presentation,
        challenge: 'golden-challenge',
        domain: 'golden.example',
        resolutionOptions: c.resolutionOptions,
      })
      expect(result.error).toBeUndefined()
      expect(result.verified).toBe(true)
    })

    it('rejects a tampered golden credential', async () => {
      const tampered = structuredClone(golden.credential)
      tampered.credentialSubject.name = 'tampered'
      const result = await agent.verifyCredential({
        credential: tampered,
        resolutionOptions: c.resolutionOptions,
      })
      expect(result.verified).toBe(false)
    })

    it('re-issues the golden credential and presentation byte-for-byte', async () => {
      expect(await issue(agent, c)).toEqual(golden)
    })
  })
})
