import {
  CredentialPayload,
  ICredentialPlugin,
  IDIDManager,
  IIdentifier,
  IKeyManager,
  IResolver,
  TAgent,
} from '../../../core-types/src/index.js'
import { createAgent } from '../../../core/src/index.js'
import { CredentialPlugin } from '../../../credential-w3c/src/index.js'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src/index.js'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src/index.js'
import { KeyManagementSystem } from '../../../kms-local/src/index.js'
import { getDidKeyResolver, KeyDIDProvider } from '../../../did-provider-key/src/index.js'
import { DIDResolverPlugin } from '../../../did-resolver/src/index.js'
import { CredentialProviderEIP712 } from '../agent/CredentialProviderEIP712.js'

describe('Issue and Verify Flow EIP712', () => {
  let didKeyIdentifier: IIdentifier
  let agent: TAgent<IResolver & IKeyManager & IDIDManager & ICredentialPlugin>

  beforeAll(async () => {
    agent = createAgent<IResolver & IKeyManager & IDIDManager & ICredentialPlugin>({
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
          ...getDidKeyResolver(),
        }),
        new CredentialPlugin([new CredentialProviderEIP712()]),
      ],
    })
    didKeyIdentifier = await agent.didManagerCreate({ options: { key: { type: 'Secp256k1' } } })
  })

  it('issues and verifies EIP712 credential', async () => {
    const credential: CredentialPayload = {
      issuer: { id: didKeyIdentifier.did },
      type: ['VerifiableCredential'],
      credentialSubject: {
        id: 'hello',
      },
    }
    const verifiableCredential = await agent.createVerifiableCredential({
      credential,
      proofFormat: 'EthereumEip712Signature2021',
    })

    expect(verifiableCredential).toBeDefined()

    const result = await agent.verifyCredential({
      credential: verifiableCredential,
    })

    expect(result.verified).toBe(true)
  })

  it('fails to verify a tampered EIP712 credential', async () => {
    const credential: CredentialPayload = {
      issuer: { id: didKeyIdentifier.did },
      type: ['VerifiableCredential'],
      credentialSubject: {
        id: 'hello',
      },
    }
    const verifiableCredential = await agent.createVerifiableCredential({
      credential,
      proofFormat: 'EthereumEip712Signature2021',
    })

    expect(verifiableCredential).toBeDefined()

    // Tamper with the credential
    if (typeof verifiableCredential === 'object' && 'credentialSubject' in verifiableCredential) {
      verifiableCredential.credentialSubject['id'] = 'tampered'
    }

    const result = await agent.verifyCredential({
      credential: verifiableCredential,
    })

    console.log(result)

    expect(result.verified).toBe(false)
    expect(result.error).toEqual({
      errorCode: 'invalid_signature',
      message: 'invalid_signature: The signature does not match any of the issuer signing keys',
    })
  })

  it('issues and verifies EIP712 presentation', async () => {
    const credential: CredentialPayload = {
      issuer: { id: didKeyIdentifier.did },
      type: ['VerifiableCredential'],
      credentialSubject: {
        id: 'hello',
      },
    }
    const verifiableCredential1 = await agent.createVerifiableCredential({
      credential,
      proofFormat: 'EthereumEip712Signature2021',
    })
    const verifiablePresentation = await agent.createVerifiablePresentation({
      presentation: {
        verifiableCredential: [verifiableCredential1],
        holder: didKeyIdentifier.did,
      },
      challenge: 'VERAMO',
      proofFormat: 'EthereumEip712Signature2021',
    })
    expect(verifiablePresentation).toBeDefined()

    const result = await agent.verifyPresentation({
      presentation: verifiablePresentation,
      challenge: 'VERAMO',
    })
    expect(result.verified).toBe(true)
  })
})
