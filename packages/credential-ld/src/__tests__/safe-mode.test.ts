/**
 * jsonld-signatures (>= 11) canonicalizes in JSON-LD "safe mode": a term that no `@context` defines
 * makes signing and verification fail instead of being silently dropped from the signed data. The
 * pre-de-fork stack (@digitalcredentials/jsonld-signatures) dropped such terms, so a credential could
 * carry claims its proof did not cover. This pins the stricter behaviour.
 */
import { beforeAll, describe, expect, it } from 'vitest'
import { Resolver } from 'did-resolver'

import {
  ICredentialPlugin,
  IDIDManager,
  IKeyManager,
  IResolver,
  TAgent,
} from '../../../core-types/src/index.js'
import { createAgent } from '../../../core/src/index.js'
import { CredentialPlugin } from '../../../credential-w3c/src/index.js'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src/index.js'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src/index.js'
import { KeyManagementSystem } from '../../../kms-local/src/index.js'
import { DIDResolverPlugin } from '../../../did-resolver/src/index.js'
import { getDidKeyResolver, KeyDIDProvider } from '../../../did-provider-key/src/index.js'
import { CredentialProviderLD, LdDefaultContexts, VeramoEd25519Signature2020 } from '../index.js'

type Agent = TAgent<IResolver & IKeyManager & IDIDManager & ICredentialPlugin>

describe('JSON-LD safe mode', () => {
  let agent: Agent
  let did: string

  beforeAll(async () => {
    agent = createAgent<Agent>({
      plugins: [
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: { local: new KeyManagementSystem(new MemoryPrivateKeyStore()) },
        }),
        new DIDManager({
          providers: { 'did:key': new KeyDIDProvider({ defaultKms: 'local' }) },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:key',
        }),
        new DIDResolverPlugin({ resolver: new Resolver(getDidKeyResolver()) }),
        new CredentialPlugin([
          new CredentialProviderLD({
            contextMaps: [LdDefaultContexts],
            suites: [new VeramoEd25519Signature2020()],
          }),
        ]),
      ],
    })
    did = (await agent.didManagerCreate({ options: { keyType: 'Ed25519' } })).did
  })

  const issue = (credentialSubject: any, context: string[]) =>
    agent.createVerifiableCredential({
      credential: { issuer: did, '@context': context, credentialSubject },
      proofFormat: 'lds',
      resolutionOptions: { publicKeyFormat: 'Ed25519VerificationKey2020' },
    })

  it('signs a credential whose terms are all defined', async () => {
    const vc = await issue({ name: 'defined' }, [
      'https://www.w3.org/2018/credentials/v1',
      'https://veramo.io/contexts/profile/v1',
    ])
    const result = await agent.verifyCredential({
      credential: vc,
      resolutionOptions: { publicKeyFormat: 'Ed25519VerificationKey2020' },
    })
    expect(result.verified).toBe(true)
  })

  it('refuses to sign a credential with an undefined term', async () => {
    await expect(
      issue({ undefinedTerm: 'not covered' }, ['https://www.w3.org/2018/credentials/v1']),
    ).rejects.toThrow(/[Ss]afe mode/)
  })
})
