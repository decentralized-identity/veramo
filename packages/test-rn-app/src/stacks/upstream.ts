// A CANDIDATE JSON-LD stack: upstream digitalbazaar, no forks. jsonld@9 comes
// in through @digitalbazaar/vc and jsonld-signatures (scoped overrides in
// pnpm-workspace.yaml keep the global DCC `jsonld` override off it).
import * as vc from '@digitalbazaar/vc'
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020'
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020'
import { contexts as credentialsContexts } from '@digitalbazaar/credentials-context'
import securityContext from '@digitalbazaar/security-context'
import ed25519Context from 'ed25519-signature-2020-context'
import type { LdLib } from '../ld-lib.tests'

export const upstream: LdLib = {
  name: 'upstream',
  vc,
  Ed25519Signature2020,
  Ed25519VerificationKey2020,
  contexts: new Map([...securityContext.contexts, ...credentialsContexts, ...ed25519Context.contexts]),
}
