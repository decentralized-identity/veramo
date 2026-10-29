import { describe, expect, it } from 'vitest'
import { checkCredential, checkPresentation, verifyPresentation } from '../vc.js'

const v1 = (extra: any = {}) => ({
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  type: ['VerifiableCredential'],
  issuer: 'did:example:issuer',
  issuanceDate: '2026-01-02T03:04:05Z',
  credentialSubject: { id: 'did:example:subject', name: 'x' },
  ...extra,
})
const v2 = (extra: any = {}) => ({
  '@context': ['https://www.w3.org/ns/credentials/v2'],
  type: ['VerifiableCredential'],
  issuer: { id: 'did:example:issuer' },
  credentialSubject: { name: 'x' },
  ...extra,
})
const now = new Date('2026-06-01T00:00:00Z')

describe('checkCredential', () => {
  it('accepts valid v1 and v2 credentials', () => {
    expect(() => checkCredential(v1(), { now })).not.toThrow()
    expect(() => checkCredential(v2({ validFrom: '2026-01-01T00:00:00Z' }), { now })).not.toThrow()
  })

  it('requires a credentials context first, and the VerifiableCredential type', () => {
    expect(() => checkCredential(v1({ '@context': ['https://schema.org'] }))).toThrow(/needs to be first/)
    expect(() => checkCredential(v1({ type: ['Other'] }))).toThrow(/VerifiableCredential/)
  })

  it('requires a subject that makes a claim, and URI ids', () => {
    expect(() => checkCredential(v1({ credentialSubject: {} }))).toThrow(/must make a claim/)
    expect(() => checkCredential(v1({ issuer: 'not a uri' }))).toThrow(/"issuer" must be a URI/)
    expect(() => checkCredential(v1({ credentialSubject: { id: 'x' } }))).toThrow(/credentialSubject.id/)
    expect(() =>
      checkCredential(v1({ credentialStatus: { id: 'status-1', type: 'StatusList2021Entry' } })),
    ).toThrow(/credentialStatus.id/)
    expect(() => checkCredential(v1({ issuer: [{ id: 'did:a:1' }, { id: 'did:a:2' }] }))).toThrow(/one value/)
  })

  it('requires typed objects for proof, credentialStatus, termsOfUse and evidence', () => {
    expect(() => checkCredential(v1({ evidence: [{ id: 'urn:e:1' }] }))).toThrow(/must have property type/)
    expect(() => checkCredential(v1({ proof: null }))).toThrow(/must be an object/)
  })

  it('checks validity windows when verifying, within the clock skew, but not when issuing', () => {
    const expired = v1({ expirationDate: '2026-03-01T00:00:00Z' })
    expect(() => checkCredential(expired, { now })).toThrow(/expired/)
    expect(() => checkCredential(expired, { now, mode: 'issue' })).not.toThrow()
    const future = v1({ issuanceDate: '2026-06-01T00:04:00Z' })
    expect(() => checkCredential(future, { now })).not.toThrow() // within 300s
    expect(() => checkCredential(future, { now, maxClockSkew: 60 })).toThrow(/before the "issuanceDate"/)
    expect(() => checkCredential(v2({ validUntil: '2026-03-01T00:00:00Z' }), { now })).toThrow(
      /after "validUntil"/,
    )
    expect(() => checkCredential(v1({ issuanceDate: 'yesterday' }), { mode: 'issue' })).toThrow(/valid date/)
  })
})

describe('checkPresentation / verifyPresentation', () => {
  const vp = { '@context': ['https://www.w3.org/2018/credentials/v1'], type: ['VerifiablePresentation'] }

  it('requires a credentials context and the VerifiablePresentation type', () => {
    expect(() => checkPresentation(vp)).not.toThrow()
    expect(() => checkPresentation({ ...vp, type: ['Other'] })).toThrow(/VerifiablePresentation/)
  })

  it('returns a failed result, not a rejection, when a check fails or the challenge is missing', async () => {
    const options = { suite: [], documentLoader: async () => ({}) }
    const noChallenge = await verifyPresentation(vp, options)
    expect(noChallenge.verified).toBe(false)
    expect(noChallenge.error.message).toMatch(/challenge/)
    const badType = await verifyPresentation({ ...vp, type: [] }, { ...options, challenge: 'c' })
    expect(badType.verified).toBe(false)
  })
})
