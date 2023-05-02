import {
    createAgent,
    CredentialPayload,
    ICredentialPlugin,
    IDIDManager,
    IIdentifier,
    IKeyManager,
    IResolver,
    TAgent,
  } from '../../../core/src'
  import { CredentialPlugin } from '../../../credential-w3c/src'
  import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
  import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
  import { KeyManagementSystem } from '../../../kms-local/src'
  import { DIDResolverPlugin } from '../../../did-resolver/src'
  import { ContextDoc } from '../types'
  import { CredentialIssuerLD } from '../action-handler'
  import { LdDefaultContexts } from '../ld-default-contexts'
  import { VeramoEd25519Signature2020 } from '../suites/Ed25519Signature2020'
  import { Resolver } from 'did-resolver'
  import { FakeDidProvider, FakeDidResolver } from '../../../test-utils/src/fake-did'
  import { jest } from '@jest/globals'

  jest.setTimeout(300000)

  const customContext: Record<string, ContextDoc> = {
    'custom:example.context': {
      '@context': {
        nothing: 'custom:example.context#blank',
      },
    },
  }

  describe('credential-LD full flow', () => {
    let didFakeIdentifier: IIdentifier
    let agent: TAgent<IResolver & IKeyManager & IDIDManager & ICredentialPlugin>

    beforeAll(async () => {
      agent = createAgent({
        plugins: [
          new KeyManager({
            store: new MemoryKeyStore(),
            kms: {
              local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
            },
          }),
          new DIDManager({
            providers: {
              'did:fake': new FakeDidProvider(),
            },
            store: new MemoryDIDStore(),
            defaultProvider: 'did:fake',
          }),
          new DIDResolverPlugin({
            resolver: new Resolver({
              ...new FakeDidResolver(() => agent, true).getDidFakeResolver(),
            }),
          }),
          new CredentialPlugin(),
          new CredentialIssuerLD({
            contextMaps: [LdDefaultContexts, customContext],
            suites: [new VeramoEd25519Signature2020()],
          }),
        ],
      })
      didFakeIdentifier = await agent.didManagerImport({
        did: 'did:fake:z6MkgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
        keys: [
          {
            type: 'Ed25519',
            kid: 'didcomm-senderKey-1',
            publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
            privateKeyHex:
              'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
            kms: 'local',
          },
        ],
        services: [
          {
            id: 'msg1',
            type: 'DIDCommMessaging',
            serviceEndpoint: 'http://localhost:3002/messaging',
          },
        ],
        provider: 'did:fake',
        alias: 'sender',
      })
    })

    it('works with Ed25519Signature2020 credential', async () => {
      const credential: CredentialPayload = {
        issuer: didFakeIdentifier.did,
        '@context': ['custom:example.context'],
        credentialSubject: {
          nothing: 'else matters',
        },
      }
      const verifiableCredential = await agent.createVerifiableCredential({
        credential,
        proofFormat: 'lds',
      })

      expect(verifiableCredential).toBeDefined()

      const result = await agent.verifyCredential({
        credential: verifiableCredential,
      })

      expect(result.verified).toBe(true)
    })

    it('works with Ed25519Signature2020 credential and presentation', async () => {
      const credential: CredentialPayload = {
        issuer: didFakeIdentifier.did,
        '@context': ['custom:example.context'],
        credentialSubject: {
          nothing: 'else matters',
        },
      }
      const verifiableCredential1 = await agent.createVerifiableCredential({
        credential,
        proofFormat: 'lds',
      })

      const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          verifiableCredential: [verifiableCredential1],
          holder: didFakeIdentifier.did,
        },
        challenge: 'VERAMO',
        proofFormat: 'lds',
      })

      expect(verifiablePresentation).toBeDefined()

      const result = await agent.verifyPresentation({
        presentation: verifiablePresentation,
        challenge: 'VERAMO',
      })

      expect(result.verified).toBe(true)
    })
  })
