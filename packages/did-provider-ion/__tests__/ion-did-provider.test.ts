import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { IDIDManager, IIdentifier, IKey, IKeyManager, IService } from '../../core-types/src/index.js'
import { createAgent } from '../../core/src/index.js'
import * as http from 'node:http'
import { DIDManager, MemoryDIDStore } from '../../did-manager/src/index.js'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../key-manager/src/index.js'
import { IonPublicKeyPurpose } from '@decentralized-identity/ion-sdk'
import { KeyManagementSystem } from '../../kms-local/src/index.js'
import { IonDIDProvider } from '../src/ion-did-provider.js'
import { ICreateIdentifierOpts } from '../src/types/ion-provider-types.js'

vi.setConfig({
  testTimeout: 60_000,
})

// The @sphereon/ion-pow dependency uses its own bundled cross-fetch, so its HTTP
// calls cannot be mocked through the global fetch. Start a local server instead and
// point the PoW endpoints at it. (PoW challenge is disabled in tests to avoid argon2
// WASM fetches.)
const getListeningAddress = (server: http.Server): string => {
  const address = server.address()
  if (address === null || typeof address === 'string') {
    throw new Error('Mock PoW server not listening on a TCP port')
  }
  return `http://127.0.0.1:${address.port}`
}

const powServer = http.createServer((req, res) => {
  let body = ''
  req.on('data', (chunk) => (body += chunk))
  req.on('end', () => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ operation: 'mocked-operation' }))
  })
})

await new Promise<void>((resolve) => powServer.listen(0, '127.0.0.1', () => resolve()))
const powEndpointUrl = getListeningAddress(powServer)

const ionDIDProvider = new IonDIDProvider({
  defaultKms: 'mem',
  challengeEnabled: false,
  challengeEndpoint: powEndpointUrl + '/proof-of-work-challenge',
  solutionEndpoint: powEndpointUrl + '/operations',
})
const agent = createAgent<IKeyManager, IDIDManager>({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        mem: new KeyManagementSystem(new MemoryPrivateKeyStore()),
      },
    }),
    new DIDManager({
      providers: {
        'did:ion': ionDIDProvider,
      },
      defaultProvider: 'did:ion',
      store: new MemoryDIDStore(),
    }),
  ],
})

const PRIVATE_RECOVERY_KEY_HEX = '7c90c0575643d09a370c35021c91e9d8af2c968c5f3a4bf73802693511a55b9f'
const PRIVATE_UPDATE_KEY_HEX = '7288a92f6219c873446abd1f8d26fcbbe1caa5274b47f6f086ef3e7e75dcad8b'
const PRIVATE_DID1_KEY_HEX = '06eb9e64569203679b36f834a4d9725c989d32a7fb52c341eae3517b3aff8ee6'
const PRIVATE_DID2_KEY_HEX = '42f5d6cbb8af0b484453e19193b6d89e814f1ce66d2c1428271c94ff5465d627'
const PRIVATE_DID3_KEY_HEX = 'abebf433281c5bb86ff8a271d2a464e528437041322a58fb8c14815763cfc189'
const PRIVATE_DID4_KEY_HEX = '7dd923e40f4615ac496119f7e793cc2899e99b64b88ca8603db986700089532b'

// Generate a new private key in hex format if needed, using the following method:
// console.log(generatePrivateKeyHex(KeyType.Secp256k1))

const MOCK_DISCOVERY_ENDPOINT = 'https://beta.discover.did.microsoft.com/1.0/identifiers/'
const MOCK_OPERATIONS_ENDPOINT = 'https://beta.ion.msidentity.com/api/v1.0/operations'

const MOCK_RESOLVER_RESULT = {
  didDocument: {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: 'did:ion:mock',
    verificationMethod: [],
  },
  didDocumentMetadata: { method: { updateCommitment: 'genesis', recoveryCommitment: 'genesis' } },
  didResolutionMetadata: {},
}

const fetchMock = vi.fn(async (input: string | URL | Request) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  if (url.startsWith(MOCK_OPERATIONS_ENDPOINT)) {
    return new Response(JSON.stringify({ operation: 'mocked-operation' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (url.startsWith(MOCK_DISCOVERY_ENDPOINT)) {
    return new Response(JSON.stringify(MOCK_RESOLVER_RESULT), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  throw new Error(`Unexpected fetch request in test: ${url}`)
})

describe('@veramo/did-provider-ion', () => {
  beforeAll(async () => {
    // Mock ION HTTP requests via the global fetch implementation
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockClear()
  })

  afterAll(() => {
    vi.unstubAllGlobals()
    powServer.close()
  })

  it('should create identifier', async () => {
    const options: ICreateIdentifierOpts = createIdentifierOpts
    const identifier: IIdentifier = await agent.didManagerCreate({ options })

    expect(identifier).toBeDefined()
    expect(identifier.keys.length).toBe(4)
    expect(identifier.services.length).toBe(1)

    expect(identifier.keys[0]).toMatchObject<Partial<IKey>>({
      kms: 'mem',
      kid: 'recovery-test',
      meta: { ion: { relation: 'recovery' } },
    })
  })

  // this fails with TypeError: Failed to parse URL from
  // .../veramo/node_modules/.pnpm/argon2-browser@1.18.0/node_modules/argon2-browser/dist/argon2.wasm
  it('should add key', async () => {
    // This DID is known in ION, hence no anchoring
    const identifier: IIdentifier = await agent.didManagerCreate(
      existingDidConfig(false, 'did1-test2', PRIVATE_DID1_KEY_HEX),
    )
    expect(identifier.alias).toEqual('did:ion:EiCprjAMfWpp7zYXDZV2TGNDV6U4AEBN2Jr6sVsuzL7qhA')
    expect(identifier.did).toEqual(
      'did:ion:EiCprjAMfWpp7zYXDZV2TGNDV6U4AEBN2Jr6sVsuzL7qhA:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkaWQxLXRlc3QyIiwicHVibGljS2V5SndrIjp7ImNydiI6InNlY3AyNTZrMSIsImt0eSI6IkVDIiwieCI6ImFNak5DV01kZVhKUmczUER6RTdURTlQMnhGcG9MOWZSa0owdG9WQk1COEUiLCJ5IjoiUXo3dmowelVqNlM0ZGFHSXVFTWJCX1VhNlE2d09UR0FvNDZ0WExpM1N4RSJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiIsImFzc2VydGlvbk1ldGhvZCJdLCJ0eXBlIjoiRWNkc2FTZWNwMjU2azFWZXJpZmljYXRpb25LZXkyMDE5In1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlCenA3WWhOOW1oVWNac0ZkeG5mLWx3a1JVLWhWYkJ0WldzVm9KSFY2amt3QSJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpRDl4NFJOekEtRGRpRHJUMGd1UU9vLXAwWDh2RTRNcUpvcEVTelZ2ZUtEQnciLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaURBUVhTaTdIY2pKVkJZQUtkTzJ6ck00SGZ5Ym1CQkNXc2w2UFFQSl9qa2xBIn19',
    )

    const newKey = await agent.keyManagerCreate({ kms: 'mem', type: 'Secp256k1' })
    const resultPromise = agent.didManagerAddKey({
      did: identifier.did,
      key: newKey,
      kid: 'test-add-key-' + Date.now(),
      options: {
        purposes: [IonPublicKeyPurpose.AssertionMethod, IonPublicKeyPurpose.Authentication],
        anchor: true,
      },
    })
    try {
      expect(await resultPromise).toMatchObject({})
    } catch (error) {
      if (error.message.includes('discovery_service.not_found')) {
        // MS node is not entirely stable. Sometimes the above error is thrown
        return
      }
      await expect(error.message).toMatch('An operation request already exists in queue for DID')
    }
  })

  it('should add service', async () => {
    // This DID is known in ION, hence no anchoring
    const identifier: IIdentifier = await agent.didManagerCreate(
      existingDidConfig(false, 'test2-kid2', PRIVATE_DID2_KEY_HEX),
    )
    expect(identifier.alias).toEqual('did:ion:EiAxehS9OQs5bL00wmnZj6AupzvO5rB5KIobbi3oRtCmiw')
    expect(identifier.did).toEqual(
      'did:ion:EiAxehS9OQs5bL00wmnZj6AupzvO5rB5KIobbi3oRtCmiw:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJ0ZXN0Mi1raWQyIiwicHVibGljS2V5SndrIjp7ImNydiI6InNlY3AyNTZrMSIsImt0eSI6IkVDIiwieCI6ImRXcU81cmFkUDVyRnVVemZ2NE9tOGtQZ3ptdTE4S1RCeHhKWkZ5STR4ZTQiLCJ5IjoiWGI5em9WOWhvRTNqbnNmV0dOYjhGSmlqcjU1WUNHamFKbGtxVGJ6SWdWSSJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiIsImFzc2VydGlvbk1ldGhvZCJdLCJ0eXBlIjoiRWNkc2FTZWNwMjU2azFWZXJpZmljYXRpb25LZXkyMDE5In1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlCenA3WWhOOW1oVWNac0ZkeG5mLWx3a1JVLWhWYkJ0WldzVm9KSFY2amt3QSJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQXota1h2SVdsSjFfRElCVGlUSkpWRWo0R0U2eHQyTTZHcnVvRFIxcTNHU2ciLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaURBUVhTaTdIY2pKVkJZQUtkTzJ6ck00SGZ5Ym1CQkNXc2w2UFFQSl9qa2xBIn19',
    )

    const service: IService = {
      type: 'LinkedDomains',
      id: 'test' + Date.now(),
      serviceEndpoint: 'https://test-example.com',
    }

    const resultPromise = agent.didManagerAddService({
      did: identifier.did,
      service,
      options: { anchor: false },
    })
    try {
      expect(await resultPromise).toMatchObject({})
    } catch (error) {
      if (error.message.includes('discovery_service.not_found')) {
        // MS node is not entirely stable. Sometimes the above error is thrown
        return
      }
      await expect(error.message).toMatch('An operation request already exists in queue for DID')
    }
  })

  it('should remove key', async () => {
    // This DID is known in ION, hence no anchoring
    const identifier: IIdentifier = await agent.didManagerCreate(
      existingDidConfig(false, 'did3-test3', PRIVATE_DID3_KEY_HEX),
    )
    expect(identifier.alias).toEqual('did:ion:EiCkiD0CYfwNWupjNPycPi7WbTbMpDgt8KzVHboaUoitdw')
    expect(identifier.did).toEqual(
      'did:ion:EiCkiD0CYfwNWupjNPycPi7WbTbMpDgt8KzVHboaUoitdw:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkaWQzLXRlc3QzIiwicHVibGljS2V5SndrIjp7ImNydiI6InNlY3AyNTZrMSIsImt0eSI6IkVDIiwieCI6IktYYXp6U21PUzBvQWo4VEd4a3VnaS1QTzFxYWwyREJJemNWcUV6MjRzYkEiLCJ5IjoiQnVTaDJDVFQ2SV9IRmtVaXhaTkkwemstNjNvZEVKR1E5NkZ4RWxvZG1XayJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiIsImFzc2VydGlvbk1ldGhvZCJdLCJ0eXBlIjoiRWNkc2FTZWNwMjU2azFWZXJpZmljYXRpb25LZXkyMDE5In1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlCenA3WWhOOW1oVWNac0ZkeG5mLWx3a1JVLWhWYkJ0WldzVm9KSFY2amt3QSJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQ1N6N0FxV2FyWk5ISmV3ZTR5ZUsxMkxVdHBfNmpaVXhzNzY5ZkZfcXZ1aWciLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaURBUVhTaTdIY2pKVkJZQUtkTzJ6ck00SGZ5Ym1CQkNXc2w2UFFQSl9qa2xBIn19',
    )

    const resultPromise = agent.didManagerRemoveKey({
      did: identifier.did,
      kid: 'did3-test3',
      options: { anchor: false },
    })
    try {
      expect(await resultPromise).toMatchObject({})
    } catch (error) {
      await expect(error.message).toMatch('An operation request already exists in queue for DID')
    }
  })

  it('should remove service', async () => {
    // This DID is known in ION, hence no anchoring
    const identifier: IIdentifier = await agent.didManagerCreate(
      existingDidConfig(false, 'did3-test3', PRIVATE_DID3_KEY_HEX),
    )
    expect(identifier.alias).toEqual('did:ion:EiCkiD0CYfwNWupjNPycPi7WbTbMpDgt8KzVHboaUoitdw')
    expect(identifier.did).toEqual(
      'did:ion:EiCkiD0CYfwNWupjNPycPi7WbTbMpDgt8KzVHboaUoitdw:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkaWQzLXRlc3QzIiwicHVibGljS2V5SndrIjp7ImNydiI6InNlY3AyNTZrMSIsImt0eSI6IkVDIiwieCI6IktYYXp6U21PUzBvQWo4VEd4a3VnaS1QTzFxYWwyREJJemNWcUV6MjRzYkEiLCJ5IjoiQnVTaDJDVFQ2SV9IRmtVaXhaTkkwemstNjNvZEVKR1E5NkZ4RWxvZG1XayJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiIsImFzc2VydGlvbk1ldGhvZCJdLCJ0eXBlIjoiRWNkc2FTZWNwMjU2azFWZXJpZmljYXRpb25LZXkyMDE5In1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlCenA3WWhOOW1oVWNac0ZkeG5mLWx3a1JVLWhWYkJ0WldzVm9KSFY2amt3QSJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQ1N6N0FxV2FyWk5ISmV3ZTR5ZUsxMkxVdHBfNmpaVXhzNzY5ZkZfcXZ1aWciLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaURBUVhTaTdIY2pKVkJZQUtkTzJ6ck00SGZ5Ym1CQkNXc2w2UFFQSl9qa2xBIn19',
    )

    const service: IService = {
      type: 'LinkedDomains',
      id: 'remove-test',
      serviceEndpoint: 'https://test-example.com',
    }

    const addPromise = agent.didManagerAddService({
      did: identifier.did,
      service,
      options: { anchor: false },
    })
    try {
      expect(await addPromise).toMatchObject({})
    } catch (error) {
      await expect(error.message).toMatch('An operation request already exists in queue for DID')
    }

    const removePromise = agent.didManagerRemoveService({
      did: identifier.did,
      id: 'remove-test',
      options: { anchor: false },
    })
    try {
      expect(await removePromise).toMatchObject({})
    } catch (error) {
      await expect(error.message).toMatch('An operation request already exists in queue for DID')
    }
  })

  // this fails with TypeError: Failed to parse URL from
  // .../veramo/node_modules/.pnpm/argon2-browser@1.18.0/node_modules/argon2-browser/dist/argon2.wasm
  it('should remove identifier', async () => {
    const identifier: IIdentifier = await agent.didManagerCreate(
      existingDidConfig(false, 'remove-test', PRIVATE_DID4_KEY_HEX),
    )

    expect(identifier).toBeDefined()

    const deletePromise = agent.didManagerDelete({ did: identifier.did, options: { anchor: false } })
    try {
      expect(await deletePromise).toBeTruthy()
    } catch (error) {
      await expect(error.message).toMatch('An operation request already exists in queue for DID')
    }
  })
})

function existingDidConfig(anchor: boolean = false, kid: string, privateDIDKeyHex: String) {
  return {
    options: {
      anchor,
      recoveryKey: {
        kid: 'recovery-test2',
        key: {
          privateKeyHex: PRIVATE_RECOVERY_KEY_HEX,
        },
      },
      updateKey: {
        kid: 'update-test2',
        key: {
          privateKeyHex: PRIVATE_UPDATE_KEY_HEX,
        },
      },
      verificationMethods: [
        {
          kid,
          purposes: [IonPublicKeyPurpose.Authentication, IonPublicKeyPurpose.AssertionMethod],
          key: {
            privateKeyHex: privateDIDKeyHex,
          },
        },
      ],
    },
  }
}

const createIdentifierOpts = {
  anchor: false,
  recoveryKey: {
    kid: 'recovery-test',
  },
  updateKey: {
    kid: 'update-test',
  },
  verificationMethods: [
    {
      kid: 'did1-test',
      purposes: [IonPublicKeyPurpose.Authentication, IonPublicKeyPurpose.AssertionMethod],
    },
    {
      kid: 'did2-test',
      purposes: [IonPublicKeyPurpose.KeyAgreement],
    },
  ],
  services: [
    {
      id: 'bar',
      type: 'LinkedDomains',
      serviceEndpoint: 'https://bar.example.com',
    },
  ],
}
