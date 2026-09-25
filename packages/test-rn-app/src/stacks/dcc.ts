// The CURRENT JSON-LD stack of @veramo/credential-ld: the digitalcredentials
// (DCC) forks. `jsonld` itself resolves to @digitalcredentials/jsonld@6 through
// the workspace override in pnpm-workspace.yaml.
import * as vc from '@digitalcredentials/vc'
import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020'
import { Ed25519VerificationKey2020 } from '@digitalcredentials/ed25519-verification-key-2020'
import securityContext from '@digitalbazaar/security-context'
import credentialsContext from 'credentials-context'
import ed25519Context from 'ed25519-signature-2020-context'
import type { LdLib } from '../ld-lib.tests'

export const dcc: LdLib = {
  name: 'dcc',
  vc,
  Ed25519Signature2020,
  Ed25519VerificationKey2020,
  contexts: new Map([
    ...securityContext.contexts,
    ...credentialsContext.contexts,
    ...ed25519Context.contexts,
  ]),
}
