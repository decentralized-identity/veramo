// Library-level JSON-LD tests for the RN harness: the JSON-LD
// stack an RN app would use directly, with NO Veramo code in between. It exists
// because @veramo/credential-ld's single entry point drags every suite (and so
// every fork) into the bundle; this measures the processor + the RN-native
// suite on their own. Harness-agnostic (no framework; console + Promise only).
//
// The `lib` argument keeps the test itself stack-agnostic, so the same test
// runs against the current DCC fork stack and against a candidate upstream one.
import { assert, createTestRun, type Result } from './harness.ts'

export type LdLib = {
  name: string
  vc: any
  Ed25519Signature2020: any
  Ed25519VerificationKey2020: any
  contexts: Map<string, any>
}

const CUSTOM = 'custom:example.context'
const ED25519_2020_CONTEXT = 'https://w3id.org/security/suites/ed25519-2020/v1'
const SECURITY_V2_CONTEXT = 'https://w3id.org/security/v2'
const CONTROLLER = 'did:example:rn-harness'
// fixed 32-byte seed: key generation must not depend on randomness
const SEED = new Uint8Array(32).map((_, i) => i + 1)

export async function runLdLib(lib: LdLib): Promise<Result> {
  const { result, test } = createTestRun()

  let key: any
  let documentLoader: any
  await test(`${lib.name}: generate an Ed25519VerificationKey2020 from a seed`, async () => {
    key = await lib.Ed25519VerificationKey2020.generate({ seed: SEED, controller: CONTROLLER })
    key.id = `${CONTROLLER}#${key.fingerprint()}`
    const docs = new Map<string, any>(lib.contexts)
    docs.set(CUSTOM, { '@context': { nothing: `${CUSTOM}#blank` } })
    docs.set(CONTROLLER, {
      '@context': SECURITY_V2_CONTEXT,
      id: CONTROLLER,
      assertionMethod: [key.id],
      authentication: [key.id],
    })
    docs.set(key.id, { '@context': ED25519_2020_CONTEXT, ...key.export({ publicKey: true }) })
    documentLoader = async (url: string) => {
      const document = docs.get(url)
      if (!document) throw new Error('documentLoader: not in the static map: ' + url)
      return { contextUrl: null, documentUrl: url, document }
    }
  })
  if (!key) return result

  let vc: any
  await test(`${lib.name}: issue + verify a credential (Ed25519Signature2020)`, async () => {
    vc = await lib.vc.issue({
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1', CUSTOM],
        type: ['VerifiableCredential'],
        issuer: CONTROLLER,
        issuanceDate: '2026-01-01T00:00:00Z',
        credentialSubject: { id: 'did:example:subject', nothing: 'else matters' },
      },
      suite: new lib.Ed25519Signature2020({ key }),
      documentLoader,
    })
    assert(vc?.proof?.type === 'Ed25519Signature2020', 'unexpected proof type: ' + vc?.proof?.type)
    const r = await lib.vc.verifyCredential({
      credential: vc,
      suite: new lib.Ed25519Signature2020(),
      documentLoader,
    })
    assert(r.verified === true, 'credential did not verify: ' + String(r.error?.errors?.[0] ?? r.error))
  })

  await test(`${lib.name}: sign + verify a presentation (Ed25519Signature2020)`, async () => {
    assert(vc, 'no credential from the previous step')
    const presentation = lib.vc.createPresentation({ verifiableCredential: [vc], holder: CONTROLLER })
    const vp = await lib.vc.signPresentation({
      presentation,
      suite: new lib.Ed25519Signature2020({ key }),
      challenge: 'VERAMO',
      documentLoader,
    })
    assert(vp?.proof?.type === 'Ed25519Signature2020', 'unexpected proof type: ' + vp?.proof?.type)
    const r = await lib.vc.verify({
      presentation: vp,
      challenge: 'VERAMO',
      suite: new lib.Ed25519Signature2020(),
      documentLoader,
    })
    assert(r.verified === true, 'presentation did not verify: ' + String(r.error?.errors?.[0] ?? r.error))
  })

  return result
}
