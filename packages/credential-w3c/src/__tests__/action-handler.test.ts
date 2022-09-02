import { createAgent, CredentialPayload, IDataStore, IDIDManager, IIdentifier, IKey, IKeyManager, IResolver, PresentationPayload, VerifiableCredential } from '../../../core'
import { CredentialIssuer, IContext } from '../action-handler.js'
import { MockDataStore } from './mockDataStore.js'
import { MockDIDManager } from './mockDidManager.js'
import { MockKeyManager } from './mockKeyManager.js'
import { MockDIDResolverPlugin } from './mockResolver.js'

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

const w3c = new CredentialIssuer()

console.log("action 2")
const infuraProjectId = '3586660d179141e3801c3895de1c2eba'
let agent = createAgent<IResolver & IDataStore & IDIDManager & IKeyManager>({ 
  plugins: [
    new MockDIDResolverPlugin(),
    w3c, 
    new MockDataStore(), 
    new MockDIDManager(),
    new MockKeyManager(),
  ]})

//TODO(nickreynolds): Should be able to use top-level await
//   console.log("action 3")
// await agent.didManagerCreate({alias: "test"})
// const testDid = await agent.didManagerFind({alias: "test"})
let testDids: IIdentifier[]

console.log("ACTION agent: ", agent)

describe('@veramo/credential-w3c', () => {
  beforeAll(async () => {
    await agent.didManagerCreate({alias: "test"})
    testDids = await agent.didManagerFind({alias: "test"})
    console.log("testDids: ", testDids)
  })
  // it('handles createVerifiableCredential', async () => {
    test.each(mockIdentifiers)('handles createVerifiableCredential', async (mockIdentifier) => {
      expect.assertions(1)

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
      const vc = await agent.createVerifiableCredential(
        {
          credential,
          save: true,
          proofFormat: 'jwt',
        },
      )
      // TODO Update these after refactoring did-jwt-vc
      // expect(context.agent.didManagerGet).toBeCalledWith({ did: mockIdentifier.did })
      // expect(context.agent.dataStoreSaveVerifiableCredential).toBeCalledWith({
      //   verifiableCredential: 'mockCredential',
      expect(vc.credentialSubject.name).toEqual('Alice')
    // })  
  })

  test.each(mockIdentifiers)('handles createVerifiablePresentation', async (mockIdentifier) => {
    expect.assertions(1)

    const context: IContext = { agent: agent }

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
    const vc = await agent.createVerifiableCredential(
      {
        credential,
        save: true,
        proofFormat: 'jwt',
      },
    )

    const presentation: PresentationPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: mockIdentifier.did,
      issuanceDate: new Date().toISOString(),
      verifiableCredential: [vc],
    }

    const vp = await agent.createVerifiablePresentation(
      {
        presentation,
        save: true,
        proofFormat: 'jwt',
      },
    )
      console.log("vp: ", vp)
    // expect(context.agent.didManagerGet).toBeCalledWith({ did: mockIdentifier.did })
    // expect(context.agent.dataStoreSaveVerifiablePresentation).toBeCalledWith({
    //   verifiablePresentation: 'mockPresentation',
    // })
    expect(vp.holder).toEqual(mockIdentifier.did)
  })
})
