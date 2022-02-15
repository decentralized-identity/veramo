import { TAgent, IResolver, IKeyManager, IDIDManager, createAgent, VerifiableCredential, IIdentifier } from '@veramo/core';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { Resolver } from 'did-resolver';
import { CredentialIssuerLD, LdDefaultContexts, VeramoEd25519Signature2018 } from '..';
import { ICredentialIssuer, CredentialIssuer } from '../../../credential-w3c/src';
import { KeyDIDProvider, getDidKeyResolver } from '../../../did-provider-key/src';
import { DIDResolverPlugin } from '../../../did-resolver/src';
import { KeyManagementSystem } from '../../../kms-local/src';

describe('Credential status check flow', () => {
  let agent: TAgent<IResolver & IKeyManager & IDIDManager & ICredentialIssuer>;
  let didKeyIdentifier: IIdentifier;

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
            'did:key': new KeyDIDProvider({ defaultKms: 'local' }),
          },
          store: new MemoryDIDStore(),
          defaultProvider: 'did:key',
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({ ...getDidKeyResolver() }),
        }),
        new CredentialIssuer(),
        new CredentialIssuerLD({
          contextMaps: [LdDefaultContexts],
          suites: [new VeramoEd25519Signature2018()],
        }),
      ],
    })

    didKeyIdentifier = await agent.didManagerCreate()
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call `checkStatus` for a credential WITH `credentialStatus`', async () => {
    const checkStatus = jest.fn(() => ({ verified: true }));

    const credentialWithStatus = await agent.createVerifiableCredential({
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        issuer: didKeyIdentifier.did,
        credentialSubject: {},
        credentialStatus: {
          id: 'https://example.com/credentials/status/1',
          type: 'RevocationList2021',
        },
      },
      proofFormat: 'lds',
    });

    await agent.verifyCredentialLD({
      credential: credentialWithStatus,
      fetchRemoteContexts: false,
      checkStatus,
    });

    expect(checkStatus).toBeCalledTimes(1);
  });

  it('should not call `checkStatus` for a credential WITHOUT `credentialStatus`', async () => {
    const checkStatus = jest.fn(() => ({ verified: true }))

    const credentialWithStatus = await agent.createVerifiableCredential({
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        issuer: didKeyIdentifier.did,
        credentialSubject: {},
      },
      proofFormat: 'lds',
    })

    await agent.verifyCredentialLD({
      credential: credentialWithStatus,
      fetchRemoteContexts: false,
      checkStatus,
    })

    expect(checkStatus).toBeCalledTimes(0);
  });
});