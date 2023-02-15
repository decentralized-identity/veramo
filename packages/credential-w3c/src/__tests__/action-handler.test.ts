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
import { CredentialPlugin } from '../action-handler'

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
        kid: 'kid2',
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
]

const w3c = new CredentialPlugin()

let agent = {
  execute: jest.fn(),
  availableMethods: jest.fn(),
  resolveDid: jest.fn(),
  getDIDComponentById: jest.fn(),
  emit: jest.fn(),
  keyManagerSign: jest.fn(async (args): Promise<string> => 'mockJWT'),
  keyManagerGet: jest.fn(
    async (args): Promise<IKey> => ({
      kid: '',
      kms: '',
      type: 'Ed25519',
      publicKeyHex: '',
    }),
  ),
  dataStoreSaveVerifiableCredential: jest.fn(async (args): Promise<boolean> => true),
  dataStoreSaveVerifiablePresentation: jest.fn(async (args): Promise<boolean> => true),
  getSchema: jest.fn(),
  didManagerGet: jest.fn(),
  didManagerFind: jest.fn(),
  createVerifiableCredentialLD: jest.fn(),
  createVerifiablePresentationLD: jest.fn(),
  verifyCredentialLD: jest.fn(),
  verifyPresentationLD: jest.fn(),
} as any as TAgent<IResolver & IDIDManager & IKeyManager & ICredentialPlugin & IDataStore>

describe('@veramo/credential-w3c', () => {
  test.each(mockIdentifiers)('handles createVerifiableCredential', async (mockIdentifier) => {
    expect.assertions(3)

    agent.didManagerGet = jest.fn(async (args): Promise<IIdentifier> => mockIdentifier)
    const context = { agent }

    const credential: CredentialPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2020/demo/4342323'],
      type: ['VerifiableCredential', 'PublicProfile'],
      issuer: { id: mockIdentifier.did },
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

    const vc = await w3c.createVerifiableCredential(
      {
        credential,
        save: false,
        proofFormat: 'jwt',
      },
      context,
    )
    // TODO Update these after refactoring did-jwt-vc
    expect(context.agent.didManagerGet).toBeCalledWith({ did: mockIdentifier.did })
    expect(context.agent.dataStoreSaveVerifiableCredential).not.toBeCalled()
    expect(vc.id).toEqual('vc1')
  })

  test.each(mockIdentifiers)('handles createVerifiablePresentation', async (mockIdentifier) => {
    expect.assertions(3)

    agent.didManagerGet = jest.fn(async (args): Promise<IIdentifier> => mockIdentifier)
    const context = { agent }

    const credential = await w3c.createVerifiableCredential(
      {
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'PublicProfile'],
          issuer: { id: mockIdentifier.did },
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
      context,
    )

    const presentation: PresentationPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: mockIdentifier.did,
      issuanceDate: new Date().toISOString(),
      verifiableCredential: [credential],
    }

    const vp = await w3c.createVerifiablePresentation(
      {
        presentation,
        save: false,
        proofFormat: 'jwt',
      },
      context,
    )

    expect(context.agent.didManagerGet).toBeCalledWith({ did: mockIdentifier.did })
    expect(context.agent.dataStoreSaveVerifiablePresentation).not.toBeCalled()
    expect(vp.holder).toEqual(mockIdentifier.did)
  })
})
