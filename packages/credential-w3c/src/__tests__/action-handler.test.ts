import { jest } from '@jest/globals'

// // Mock must come before imports with transitive dependency.
// jest.unstable_mockModule('did-jwt-vc', () => ({
//   createVerifiableCredentialJwt: jest.fn(() => Promise.resolve('mockVcJwt')),
//   createVerifiablePresentationJwt: jest.fn(() => Promise.resolve('mockVcJwt')),
//   verifyCredential: jest.fn(() => Promise.resolve({ payload: {} })),
//   normalizeCredential: jest.fn(() => Promise.resolve('mockCredential')),
//   normalizePresentation: jest.fn(() => Promise.resolve('mockPresentation')),
// }))

import {
  CredentialPayload,
  ICredentialPlugin,
  IDataStore,
  IDIDManager,
  IIdentifier,
  IKey,
  IKeyManager,
  IResolver,
  PresentationPayload,
  TAgent,
  VerifiableCredential,
} from '../../../core-types/src'
import { CredentialPlugin } from '../action-handler.js'
import { CredentialIssuerJWT, ICredentialIssuerJWT } from '../../../credential-jwt/src'
import { createAgent } from '../../../core/src/agent.js'
import { KeyManager } from '../../../key-manager/src/key-manager.js'
import { MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { getDidKeyResolver, KeyDIDProvider } from '../../../did-provider-key/src'
import { EthrDIDProvider } from '../../../did-provider-ethr/src'
import { DIDResolverPlugin } from '../../../did-resolver/src'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'

const infuraProjectId = '3586660d179141e3801c3895de1c2eba'
const mockIdentifiers: IIdentifier[] = [
  {
    did: 'did:example:111',
    provider: 'mock',
    controllerKeyId: 'kid1',
    keys: [
      {
        kid: 'kid1',
        publicKeyHex: 'pub',
        type: 'Secp256k1',
        kms: 'mock',
      },
    ],
    services: [],
  },
  {
    did: 'did:example:222',
    provider: 'mock',
    controllerKeyId: 'kid2',
    keys: [
      {
        kid: 'kid2a',
        publicKeyHex: 'pub',
        type: 'Ed25519',
        kms: 'mock',
      },
      {
        kid: 'kid2b',
        publicKeyHex: 'pub',
        type: 'Secp256k1',
        kms: 'mock',
      },
    ],
    services: [],
  },
  {
    did: 'did:example:333',
    provider: 'mock',
    controllerKeyId: 'kid3',
    keys: [
      {
        kid: 'kid3',
        publicKeyHex: 'pub',
        type: 'Ed25519',
        kms: 'mock',
      },
    ],
    services: [],
  },
  {
    did: 'did:example:444?versionTime=2023-01-01T00:00:00Z',
    provider: 'mock',
    controllerKeyId: 'kid4',
    keys: [
      {
        kid: 'kid4',
        publicKeyHex: 'pub',
        type: 'Ed25519',
        kms: 'mock',
      },
    ],
    services: [],
  },
]

const w3c = new CredentialPlugin()
const jwt = new CredentialIssuerJWT()

let didKeyIdentifier: IIdentifier
let didEthrIdentifier: IIdentifier
let agent: TAgent<IResolver & IKeyManager & IDIDManager & ICredentialPlugin & ICredentialIssuerJWT>

describe('@veramo/credential-w3c', () => {

  beforeAll(async () => {
    agent = createAgent<IResolver & IKeyManager & IDIDManager & ICredentialPlugin & ICredentialIssuerJWT>({
      plugins: [
        new KeyManager({
          store: new MemoryKeyStore(),
          kms: {
            local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
          },
        }),
        new DIDManager({
          providers: {
            'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
            'did:ethr': new EthrDIDProvider({
              defaultKms: 'local',
              network: 'mainnet',
            }),
          },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:key',
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...getDidKeyResolver(),
            ...ethrDidResolver({ infuraProjectId }),
          }),
        }),
        new CredentialPlugin(),
        new CredentialIssuerJWT()
      ],
    })
    didKeyIdentifier = await agent.didManagerCreate()
    didEthrIdentifier = await agent.didManagerCreate({ provider: 'did:ethr' })
  })
  // const keyManagerSign = agent.keyManagerSign as
  //   | jest.Mock<(args: { algorithm: string; keyRef: string }) => Promise<string>>

  // beforeEach(() => {
  //   keyManagerSign.mockClear()
  // });

  test.each(mockIdentifiers)('handles createVerifiableCredential', async (mockIdentifier) => {
    expect.assertions(1)

    const issuerId = didEthrIdentifier.did
    const context = { agent }

    const credential: CredentialPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2020/demo/4342323'],
      type: ['VerifiableCredential', 'PublicProfile'],
      issuer: { id: issuerId },
      issuanceDate: new Date().toISOString(),
      id: 'vc1',
      credentialSubject: {
        id: 'https://example.com/user/alice',
        name: 'Alice',
        profilePicture: 'https://example.com/a.png',
        address: {
          street: 'Some str.',
          house: 1,
        },
      },
    }

    const vc = await agent.createVerifiableCredential(
      {
        credential,
        save: false,
        proofFormat: 'jwt',
        // keyRef,
      },
      // context,
    )
    console.log("vc: ", vc)
    // TODO Update these after refactoring did-jwt-vc
    // expect(context.agent.didManagerGet).toBeCalledWith({ did: mockIdentifier.did })
    // expect(context.agent.dataStoreSaveVerifiableCredential).not.toBeCalled()
    expect(vc.id).toEqual('vc1')

    // expect(keyManagerSign).toBeCalled()
    // expect(keyManagerSign.mock.calls[0][0].keyRef).toEqual(expectedKey.kid)
    // expect(keyManagerSign.mock.calls[0][0].algorithm).toEqual(expectedKey.type === 'Ed25519' ? 'EdDSA' : 'ES256K')
  })

  test.each(mockIdentifiers)('handles createVerifiablePresentation', async (mockIdentifier) => {
    expect.assertions(1)

    const issuerId = didEthrIdentifier.did;
    // mockIdentifier.did = mockIdentifier.did.replace(/\?.*$/, '')

    // agent.didManagerGet = jest.fn(async (args): Promise<IIdentifier> => mockIdentifier)
    const context = { agent }

    const credential = await agent.createVerifiableCredential(
      {
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'PublicProfile'],
          issuer: { id: issuerId },
          issuanceDate: new Date().toISOString(),
          id: 'vc1',
          credentialSubject: {
            id: 'https://example.com/user/alice',
            name: 'Alice',
            profilePicture: 'https://example.com/a.png',
            address: {
              street: 'Some str.',
              house: 1,
            },
          },
        },
        save: false,
        proofFormat: 'jwt',
      },
      // context,
    )

    const presentation: PresentationPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: didEthrIdentifier.did + '?versionTime=2023-01-01T00:00:00Z',
      issuanceDate: new Date().toISOString(),
      verifiableCredential: [credential],
    }

    const vp = await agent.createVerifiablePresentation(
      {
        presentation,
        save: false,
        proofFormat: 'jwt',
      },
      // context,
    )

    // expect(context.agent.didManagerGet).toBeCalledWith({ did: didEthrIdentifier.did })
    // expect(context.agent.didManagerGet).not.toBeCalledWith({ did: presentation.holder })
    // expect(context.agent.dataStoreSaveVerifiablePresentation).not.toBeCalled()
    expect(vp.holder).toEqual(issuerId)
  })
})
