// Safe-set tests for the RN harness. Harness-agnostic: no test
// framework, no globals beyond `console` and Promise.
import { createAgent } from '@veramo/core'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { FakeDidProvider, FakeDidResolver } from '@veramo/test-utils'
import { SAFE_SET_TEST_COUNT } from './verdict.js'
import { assert, createTestRun, type Result } from './harness.ts'

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

export async function runSafeSet(): Promise<Result> {
  const { result, test } = createTestRun()

  let agent: any
  await test('create agent', async () => {
    agent = makeAgent()
  })
  if (!agent) return result

  for (const type of ['Ed25519', 'Secp256k1']) {
    await test(`create ${type} key`, async () => {
      const key = await agent.keyManagerCreate({ kms: 'local', type })
      assert(key.type === type, `expected ${type}, got ${key.type}`)
      assert(/^[0-9a-f]+$/.test(key.publicKeyHex), 'expected hex publicKeyHex')
    })
  }

  await test('get / delete a key', async () => {
    const key = await agent.keyManagerCreate({ kms: 'local', type: 'Ed25519' })
    const got = await agent.keyManagerGet({ kid: key.kid })
    assert(got.kid === key.kid, 'keyManagerGet returned the wrong key')
    assert(await agent.keyManagerDelete({ kid: key.kid }), 'keyManagerDelete returned false')
    const threw = await agent.keyManagerGet({ kid: key.kid }).then(
      () => false,
      () => true,
    )
    assert(threw, 'keyManagerGet should throw after delete')
  })

  for (const type of ['Ed25519', 'Secp256k1']) {
    await test(`keyManagerSign with ${type}`, async () => {
      const key = await agent.keyManagerCreate({ kms: 'local', type })
      const signature = await agent.keyManagerSign({ keyRef: key.kid, data: 'hello veramo rn' })
      assert(typeof signature === 'string' && signature.length > 0, 'empty signature')
    })
  }

  let did = ''
  await test('didManagerCreate did:fake', async () => {
    const id = await agent.didManagerCreate({ provider: 'did:fake', alias: 'rn-harness' })
    assert(id.did === 'did:fake:rn-harness', 'unexpected did: ' + id.did)
    assert(id.keys.length === 1, 'expected one controller key')
    did = id.did
  })

  await test('resolveDid returns the did:fake document with the created key', async () => {
    const id = await agent.didManagerGet({ did })
    const { didDocument, didResolutionMetadata } = await agent.resolveDid({ didUrl: did })
    assert(didDocument, 'no didDocument: ' + JSON.stringify(didResolutionMetadata))
    assert(didDocument.id === did, 'didDocument id mismatch: ' + didDocument.id)
    const vm = didDocument.verificationMethod?.find((v: any) => v.id === `${did}#${id.controllerKeyId}`)
    assert(vm, 'created key missing from verificationMethod')
    assert(vm.publicKeyHex === id.keys[0].publicKeyHex, 'publicKeyHex mismatch')
  })

  return result
}

/** Runs the safe set and prints one machine-readable line; the runner parses it. */
export async function main(): Promise<Result> {
  const result = await runSafeSet()
  console.log('RN_HARNESS_RESULT ' + JSON.stringify({ ...result, expected: SAFE_SET_TEST_COUNT }))
  return result
}
