// JSON-LD tests for the RN harness. Harness-agnostic, like
// safe-set.tests.ts: no test framework, no globals beyond `console` and Promise.
// Same minimal agent as packages/credential-ld/src/__tests__/issue-verify-ed25519-2020.test.ts,
// with ONE signature suite per run (chosen by the entry file).
// Everything is imported from the packages' public entry points only.
import { createAgent } from '@veramo/core'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { CredentialProviderLD, LdDefaultContexts } from '@veramo/credential-ld'
import { Resolver } from 'did-resolver'
import { FakeDidProvider, FakeDidResolver } from '@veramo/test-utils'
import { assert, createTestRun, type Result } from './harness.ts'

const customContext = {
  'custom:example.context': { '@context': { nothing: 'custom:example.context#blank' } },
}

// did:fake:z6Mk... with a fixed Ed25519 key (the credential-ld test fixture)
export const ED25519_IMPORT = {
  did: 'did:fake:z6MkgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
  keys: [
    {
      type: 'Ed25519',
      kid: 'ed25519-key-1',
      publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
      privateKeyHex:
        'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
      kms: 'local',
    },
  ],
  provider: 'did:fake',
  alias: 'ld-issuer',
}

export type LdSuiteCase = {
  /** display name, e.g. 'Ed25519Signature2020' */
  name: string
  /** a single Veramo suite instance */
  suite: any
  /** identifier to import (its key type must match the suite) */
  identifier: any
}

export async function runLd(c: LdSuiteCase): Promise<Result> {
  const { result, test } = createTestRun()

  let agent: any
  let issuer: any
  await test(`create agent with ${c.name} and import the issuer`, async () => {
    agent = createAgent({
      plugins: [
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: { local: new KeyManagementSystem(new MemoryPrivateKeyStore()) },
        }),
        new DIDManager({
          store: new MemoryDIDStore(),
          defaultProvider: 'did:fake',
          providers: { 'did:fake': new FakeDidProvider() },
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({ ...new FakeDidResolver(() => agent, true).getDidFakeResolver() }),
        }),
        new CredentialPlugin([
          new CredentialProviderLD({
            contextMaps: [LdDefaultContexts, customContext],
            suites: [c.suite],
          }),
        ]),
      ],
    })
    issuer = await agent.didManagerImport(c.identifier)
  })
  if (!issuer) return result

  const credential = {
    issuer: issuer.did,
    '@context': ['custom:example.context'],
    credentialSubject: { nothing: 'else matters' },
  }

  let vc: any
  await test(`${c.name}: sign + verify a credential`, async () => {
    vc = await agent.createVerifiableCredential({ credential, proofFormat: 'lds' })
    assert(vc?.proof?.type === c.name, 'unexpected proof type: ' + vc?.proof?.type)
    const r = await agent.verifyCredential({ credential: vc })
    assert(r.verified === true, 'credential did not verify: ' + JSON.stringify(r.error ?? r))
  })

  await test(`${c.name}: sign + verify a presentation`, async () => {
    assert(vc, 'no credential from the previous step')
    const vp = await agent.createVerifiablePresentation({
      presentation: { verifiableCredential: [vc], holder: issuer.did },
      challenge: 'VERAMO',
      proofFormat: 'lds',
    })
    assert(vp?.proof?.type === c.name, 'unexpected proof type: ' + vp?.proof?.type)
    const r = await agent.verifyPresentation({ presentation: vp, challenge: 'VERAMO' })
    assert(r.verified === true, 'presentation did not verify: ' + JSON.stringify(r.error ?? r))
  })

  return result
}
