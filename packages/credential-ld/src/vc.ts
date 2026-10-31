/*!
 * Derived from @digitalbazaar/vc@7.3.0 (BSD-3-Clause), see THIRD_PARTY_NOTICES.md.
 *
 * Copyright (c) 2017-2021, Digital Bazaar, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/**
 * The parts of `@digitalbazaar/vc@7` that `@veramo/credential-ld` uses, on top of `jsonld-signatures`.
 *
 * `@digitalbazaar/vc` loads `@digitalbazaar/credentials-context`, whose ESM build uses `import.meta`, which
 * Hermes (React Native) cannot parse. The checks and the verification flow below match `vc@7.3.0`
 * (`lib/index.js`, `lib/helpers.js`, `lib/CredentialIssuancePurpose.js`, BSD-3-Clause, Digital Bazaar, Inc.).
 *
 * This copy is needed until https://github.com/digitalbazaar/credentials-context/pull/9 (which removes the
 * `import.meta` uses) is released and `@digitalbazaar/vc` depends on that release; then `@digitalbazaar/vc` can
 * replace this file again.
 *
 * @internal
 */
import jsonldSignatures from 'jsonld-signatures'
import { parse as parseUri } from 'fast-uri'
import { asArray } from '@veramo/utils'

const { AssertionProofPurpose, AuthenticationProofPurpose } = jsonldSignatures.purposes

const CREDENTIALS_V1 = 'https://www.w3.org/2018/credentials/v1'
const CREDENTIALS_V2 = 'https://www.w3.org/ns/credentials/v2'

const DEFAULT_MAX_CLOCK_SKEW = 300 // seconds

const dateRegex = new RegExp(
  '-?([1-9][0-9]{3,}|0[0-9]{3})' +
    '-(0[1-9]|1[0-2])' +
    '-(0[1-9]|[12][0-9]|3[01])' +
    'T(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?|(24:00:00(\\.0+)?))' +
    '(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?',
)

// Require an absolute identifier as well as well-formed URI components.
const uriRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:[^\s\u0000-\u001F\u007F<>"{}|\\^`]+$/

/** Signing and verification options `vc` accepted, besides the document, suite and document loader. */
export type VcOptions = {
  suite: any
  documentLoader: (url: string) => Promise<any>
  now?: Date | string
  maxClockSkew?: number
  [key: string]: any
}

const isObject = (value: unknown): value is Record<string, any> => typeof value === 'object' && value !== null
const getId = (value: any): string | undefined => (typeof value === 'string' ? value : value?.id)
const contextVersion = (document: any) =>
  ({ [CREDENTIALS_V1]: 1, [CREDENTIALS_V2]: 2 })[asArray(document?.['@context'])[0] as string]

function assert(condition: unknown, message: string, ErrorType = Error): asserts condition {
  if (!condition) throw new ErrorType(message)
}

function assertUri(id: unknown, propertyName: string) {
  // Keep IDNs without invoking the WHATWG URL-based conversion that React Native does not implement.
  assert(
    typeof id === 'string' && uriRegex.test(id) && !parseUri(id, { unicodeSupport: true }).error,
    `"${propertyName}" must be a URI: "${id}".`,
    TypeError,
  )
}

function assertDate(document: any, prop: string) {
  assert(dateRegex.test(document[prop]), `"${prop}" must be a valid date: ${document[prop]}`)
}

function assertCredentialContext(document: any) {
  assert(
    contextVersion(document),
    `"${CREDENTIALS_V1}" or "${CREDENTIALS_V2}" needs to be first in the list of contexts.`,
  )
}

/** -1, 0 or 1 as `t1` is before, within `maxClockSkew` seconds of, or after `t2`. */
const compareTime = (t1: Date, t2: Date, maxClockSkew: number) =>
  Math.abs(t1.getTime() - t2.getTime()) < maxClockSkew * 1000 ? 0 : t1 < t2 ? -1 : 1

function assertTypedObject(value: any, name: string) {
  assert(isObject(value), `property "${name}" must be an object.`)
  assert(Object.keys(value).length > 0, `property "${name}" can not be an empty object.`)
  assert('type' in value, `property "${name}" must have property type.`)
}

function assertCredentialSubject(subject: any) {
  assert(isObject(subject), '"credentialSubject" must be a non-null object.')
  assert(Object.keys(subject).length > 0, '"credentialSubject" must make a claim.')
  if (subject.id) assertUri(subject.id, 'credentialSubject.id')
}

/** Checks the validity window of a credential, given the names of its start and end date properties. */
function assertValidityWindow(credential: any, from: string, until: string, now: Date, maxClockSkew: number) {
  if (credential[until]) {
    assertDate(credential, until)
    assert(
      compareTime(now, new Date(credential[until]), maxClockSkew) <= 0,
      until === 'expirationDate'
        ? 'Credential has expired.'
        : `The current date time (${now.toISOString()}) is after "${until}" (${credential[until]}).`,
    )
  }
  if (credential[from]) {
    assertDate(credential, from)
    assert(
      compareTime(new Date(credential[from]), now, maxClockSkew) <= 0,
      `The current date time (${now.toISOString()}) is before ${from === 'issuanceDate' ? 'the ' : ''}"${from}" (${credential[from]}).`,
    )
  }
}

/** The data model checks `vc` runs before issuing (`mode: 'issue'`) or verifying a credential. */
export function checkCredential(
  credential: any,
  {
    now = new Date(),
    mode = 'verify',
    maxClockSkew = DEFAULT_MAX_CLOCK_SKEW,
  }: Partial<VcOptions> & {
    mode?: 'issue' | 'verify'
  } = {},
) {
  const date = new Date(now)
  assertCredentialContext(credential)
  assert(credential.type, '"type" property is required.')
  assert(
    asArray(credential.type).includes('VerifiableCredential'),
    '"type" must include `VerifiableCredential`.',
  )
  assert(credential.credentialSubject, '"credentialSubject" property is required.')
  asArray(credential.credentialSubject).forEach(assertCredentialSubject)
  assert(credential.issuer, '"issuer" property is required.')

  const version = contextVersion(credential)
  if (version === 1) {
    assert(credential.issuanceDate, '"issuanceDate" property is required.')
    assertDate(credential, 'issuanceDate')
    assert(asArray(credential.issuanceDate).length === 1, '"issuanceDate" property can only have one value.')
    if ('expirationDate' in credential) assertDate(credential, 'expirationDate')
  }
  if (mode === 'verify') {
    const [from, until] = version === 1 ? ['issuanceDate', 'expirationDate'] : ['validFrom', 'validUntil']
    assertValidityWindow(credential, from, until, date, maxClockSkew)
  } else if (version === 2) {
    ;['validFrom', 'validUntil']
      .filter((prop) => credential[prop])
      .forEach((prop) => assertDate(credential, prop))
  }

  assert(asArray(credential.issuer).length === 1, '"issuer" property can only have one value.')
  const issuer = getId(credential.issuer)
  assert(issuer, '"issuer" id is required.')
  assertUri(issuer, 'issuer')

  asArray(credential.credentialStatus).forEach((status: any) => {
    if (isObject(status) && 'id' in status) assertUri(status.id, 'credentialStatus.id')
    assert(status?.type, '"credentialStatus" must include a type.')
  })
  asArray(credential.evidence)
    .map(getId)
    .filter(Boolean)
    .forEach((id) => assertUri(id, 'evidence'))
  ;['proof', 'credentialStatus', 'termsOfUse', 'evidence']
    .filter((prop) => prop in credential)
    .forEach((prop) => [credential[prop]].flat().forEach((value) => assertTypedObject(value, prop)))
}

/** The data model checks `vc` runs before verifying a presentation. */
export function checkPresentation(presentation: any) {
  assertCredentialContext(presentation)
  assert(
    asArray(presentation.type).includes('VerifiablePresentation'),
    '"type" must include "VerifiablePresentation".',
  )
}

/** An assertion proof purpose that also requires the credential's issuer to control the verification method. */
export class CredentialIssuancePurpose extends AssertionProofPurpose {
  constructor(options: { controller?: any } = {}) {
    super(options)
  }

  async validate(proof: any, options: any) {
    try {
      const result = await super.validate(proof, options)
      if (!result.valid) throw result.error
      const issuer = getId(asArray(options.document.issuer)[0])
      assert(issuer, 'Credential issuer is required.')
      assert(
        result.controller.id === issuer,
        'Credential issuer must match the verification method controller.',
      )
      return { valid: true }
    } catch (error) {
      return { valid: false, error }
    }
  }
}

/** Signs a credential (in place, like `vc.issue`), adding a v1 `issuanceDate` if it has none. */
export async function issue(credential: any, { suite, documentLoader, ...options }: VcOptions) {
  if (contextVersion(credential) === 1 && !credential.issuanceDate) {
    credential.issuanceDate = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  }
  checkCredential(credential, { ...options, mode: 'issue' })
  return jsonldSignatures.sign(credential, {
    purpose: options.purpose ?? new CredentialIssuancePurpose(),
    documentLoader,
    suite,
  })
}

/** Signs a presentation for the given `challenge` and `domain`. Like `vc.signPresentation`, it is not checked first. */
export function signPresentation(
  presentation: any,
  { challenge, domain, ...options }: VcOptions & { challenge?: string; domain?: string },
) {
  const purpose = new AuthenticationProofPurpose({ challenge, domain })
  return jsonldSignatures.sign(presentation, { ...options, purpose })
}

const failure = (key: 'credential' | 'presentation', document: any, error: any) => ({
  verified: false,
  results: [{ [key]: document, verified: false, error }],
  error,
})

/**
 * Verifies a credential: data model checks, then its proofs with the given `purpose`, or a
 * {@link CredentialIssuancePurpose} for the given `controller`.
 */
export async function verifyCredential(credential: any, options: VcOptions) {
  try {
    checkCredential(credential, options)
    const purpose = options.purpose ?? new CredentialIssuancePurpose({ controller: options.controller })
    return await jsonldSignatures.verify(credential, { ...options, purpose })
  } catch (error) {
    return failure('credential', credential, error)
  }
}

/**
 * Verifies a presentation: data model checks, every embedded credential, then the presentation's proof with the
 * given `presentationPurpose`, or an `AuthenticationProofPurpose` for the given `challenge`, `domain` and `controller`.
 * `unsignedPresentation` skips only the presentation proof, not the embedded credentials or data model checks.
 */
export async function verifyPresentation(
  presentation: any,
  {
    challenge,
    domain,
    presentationPurpose,
    ...options
  }: VcOptions & { challenge?: string; domain?: string; presentationPurpose?: any },
) {
  try {
    checkPresentation(presentation)
    const credentials = asArray(presentation.verifiableCredential)
    const credentialResults = credentials.length
      ? await Promise.all(
          credentials.map(async (credential: any) => ({
            ...(await verifyCredential(credential, options)),
            credentialId: credential.id,
          })),
        )
      : undefined
    if (options.unsignedPresentation) {
      return {
        verified: (credentialResults ?? []).every((r) => r.verified),
        results: [presentation],
        credentialResults,
        error: credentialResults?.find((r) => !r.verified)?.error,
      }
    }
    assert(
      presentationPurpose || challenge,
      'A "challenge" param is required for AuthenticationProofPurpose.',
    )
    const purpose =
      presentationPurpose ??
      new AuthenticationProofPurpose({ controller: options.controller, domain, challenge })
    const presentationResult = await jsonldSignatures.verify(presentation, { ...options, purpose })
    return {
      presentationResult,
      verified: (credentialResults ?? []).every((r) => r.verified) && presentationResult.verified,
      credentialResults,
      error: presentationResult.error ?? credentialResults?.find((r) => !r.verified)?.error,
    }
  } catch (error) {
    return failure('presentation', presentation, error)
  }
}
