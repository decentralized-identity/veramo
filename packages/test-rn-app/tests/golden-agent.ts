import {
  createAgent,
  ICredentialPlugin,
  IDIDManager,
  IKeyManager,
  IResolver,
  MinimalImportableKey,
  TAgent,
} from '@veramo/core'
import { CredentialPlugin, ICredentialProvider } from '@veramo/credential-w3c'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { getDidKeyResolver } from '@veramo/did-provider-key'
import { getDidPkhResolver } from '@veramo/did-provider-pkh'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { Resolver } from 'did-resolver'

export type GoldenAgent = TAgent<IResolver & IKeyManager & IDIDManager & ICredentialPlugin>

// The caller supplies the LD provider so Node tests use its source and RN tests use its published entry point.
export async function makeGoldenAgent(
  c: { did: string; key: Omit<MinimalImportableKey, 'kms'> },
  credentialProvider: ICredentialProvider,
): Promise<GoldenAgent> {
  const agent = createAgent<GoldenAgent>({
    plugins: [
      new KeyManager({
        store: new MemoryKeyStore(),
        kms: { local: new KeyManagementSystem(new MemoryPrivateKeyStore()) },
      }),
      new DIDManager({ providers: {}, store: new MemoryDIDStore(), defaultProvider: 'none' }),
      new DIDResolverPlugin({ resolver: new Resolver({ ...getDidKeyResolver(), ...getDidPkhResolver() }) }),
      new CredentialPlugin([credentialProvider]),
    ],
  })
  await agent.didManagerImport({ did: c.did, provider: 'none', keys: [{ ...c.key, kms: 'local' }] })
  return agent
}
