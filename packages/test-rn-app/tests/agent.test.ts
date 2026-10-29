// A Veramo agent without JSON-LD: core, key-manager, kms-local, did-manager, did-resolver and test-utils' did:fake.
import { beforeAll, describe, expect, it } from 'vitest'
import { createAgent } from '@veramo/core'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { FakeDidProvider, FakeDidResolver } from '@veramo/test-utils'

function makeAgent() {
  const agent: any = createAgent({
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
        resolver: new Resolver({ ...new FakeDidResolver(() => agent).getDidFakeResolver() }),
      }),
    ],
  })
  return agent
}

describe('agent', () => {
  let agent: any
  beforeAll(() => {
    agent = makeAgent()
  })

  it('creates an Ed25519 key', async () => {
    const key = await agent.keyManagerCreate({ kms: 'local', type: 'Ed25519' })
    expect(key.type).toBe('Ed25519')
    expect(key.publicKeyHex).toMatch(/^[0-9a-f]+$/)
  })

  it('creates a Secp256k1 key', async () => {
    const key = await agent.keyManagerCreate({ kms: 'local', type: 'Secp256k1' })
    expect(key.type).toBe('Secp256k1')
    expect(key.publicKeyHex).toMatch(/^[0-9a-f]+$/)
  })

  it('signs with an Ed25519 key', async () => {
    const key = await agent.keyManagerCreate({ kms: 'local', type: 'Ed25519' })
    const signature = await agent.keyManagerSign({ keyRef: key.kid, data: 'hello veramo rn' })
    expect(signature).toMatch(/.+/)
  })

  it('signs with a Secp256k1 key', async () => {
    const key = await agent.keyManagerCreate({ kms: 'local', type: 'Secp256k1' })
    const signature = await agent.keyManagerSign({ keyRef: key.kid, data: 'hello veramo rn' })
    expect(signature).toMatch(/.+/)
  })

  it('gets and deletes a key', async () => {
    const key = await agent.keyManagerCreate({ kms: 'local', type: 'Ed25519' })
    expect((await agent.keyManagerGet({ kid: key.kid })).kid).toBe(key.kid)
    expect(await agent.keyManagerDelete({ kid: key.kid })).toBe(true)
    await expect(agent.keyManagerGet({ kid: key.kid })).rejects.toThrow()
  })

  it('creates a did:fake DID and resolves it to a document with its key', async () => {
    const identifier = await agent.didManagerCreate({ provider: 'did:fake', alias: 'rn-harness' })
    expect(identifier.did).toBe('did:fake:rn-harness')
    expect(identifier.keys).toHaveLength(1)

    const { didDocument } = await agent.resolveDid({ didUrl: identifier.did })
    expect(didDocument.id).toBe(identifier.did)
    const vm = didDocument.verificationMethod.find(
      (v: any) => v.id === `${identifier.did}#${identifier.controllerKeyId}`,
    )
    expect(vm.publicKeyHex).toBe(identifier.keys[0].publicKeyHex)
  })
})
