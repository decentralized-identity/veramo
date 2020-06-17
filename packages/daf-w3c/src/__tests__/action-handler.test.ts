import {
  ICredential,
  IVerifiableCredential,
  IIdentity,
  IPresentation,
  IVerifiablePresentation,
} from 'daf-core'

const mockCreateVerifiableCredential = jest.fn()
const mockCreatePresentation = jest.fn()

jest.mock('did-jwt-vc', () => ({
  createVerifiableCredential: mockCreateVerifiableCredential,
  createPresentation: mockCreatePresentation,
  verifyCredential: jest.fn().mockReturnValue({ payload: {} }),
}))

jest.mock('did-jwt', () => ({
  decodeJWT: jest.fn().mockReturnValue({ payload: {} }),
}))

jest.mock('../message-handler', () => ({
  createCredential: jest.fn().mockImplementation(() => 'mock'),
  createPresentation: jest.fn().mockImplementation(() => 'mock'),
}))

import { W3c, IContext } from '../action-handler'

const mockIdentity1: IIdentity = {
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
}

const mockIdentity2: IIdentity = {
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
}

const context: IContext = {
  agent: {
    execute: jest.fn(),
    availableMethods: jest.fn(),
    identityManagerGetIdentity: jest
      .fn()
      .mockImplementation(async (args): Promise<IIdentity> => mockIdentity1),
    keyManagerSignJWT: jest.fn().mockImplementation(async (args): Promise<string> => 'mockJWT'),
    dataStoreSaveVerifiableCredential: jest.fn().mockImplementation(async (args): Promise<boolean> => true),
    dataStoreSaveVerifiablePresentation: jest.fn().mockImplementation(async (args): Promise<boolean> => true),
  },
}

const w3c = new W3c()

describe('daf-w3c', () => {
  it('handles createVerifiableCredential', async () => {
    const credential: ICredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1323', 'https://www.w3.org/2020/demo/4342323'],
      type: ['VerifiableCredential', 'PublicProfile'],
      issuer: mockIdentity1.did,
      issuanceDate: new Date().toISOString(),
      id: 'vc1',
      credentialSubject: {
        id: mockIdentity2.did,
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
        save: true,
        proofFormat: 'jwt',
      },
      context,
    )
    // TODO Update these after refactoring did-jwt-vc
    expect(context.agent.identityManagerGetIdentity).toBeCalledWith({ did: mockIdentity1.did })
    expect(context.agent.dataStoreSaveVerifiableCredential).toBeCalledWith('mock')
    expect(vc).toEqual('mock')
  })

  it('handles createVerifiablePresentation', async () => {
    const credential: IVerifiableCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1323'],
      type: ['VerifiableCredential', 'PublicProfile'],
      issuer: mockIdentity1.did,
      issuanceDate: new Date().toISOString(),
      id: 'vc1',
      credentialSubject: {
        id: mockIdentity2.did,
        name: 'Alice',
        profilePicture: 'https://example.com/a.png',
        address: {
          street: 'Some str.',
          house: 1,
        },
      },
      proof: {
        jwt: 'mockJWT',
      },
    }

    const presentation: IPresentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1323'],
      type: ['VerifiablePresentation'],
      issuer: mockIdentity1.did,
      audience: [mockIdentity2.did],
      issuanceDate: new Date().toISOString(),
      verifiableCredential: [credential],
    }

    const vp = await w3c.createVerifiablePresentation(
      {
        presentation,
        save: true,
        proofFormat: 'jwt',
      },
      context,
    )

    // TODO Update these after refactoring did-jwt-vc
    expect(context.agent.identityManagerGetIdentity).toBeCalledWith({ did: mockIdentity1.did })
    expect(context.agent.dataStoreSaveVerifiablePresentation).toBeCalledWith('mock')
    expect(vp).toEqual('mock')
  })
})
