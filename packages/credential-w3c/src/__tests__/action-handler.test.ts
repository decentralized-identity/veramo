import {
  CredentialPayload,
  ICanIssueCredentialTypeArgs,
  ICanVerifyDocumentTypeArgs,
  ICredentialPlugin,
  IDIDManager,
  IIdentifier,
  IKey,
  IKeyManager,
  IResolver,
  PresentationPayload,
  TAgent,
} from '../../../core-types/src'
import { CredentialPlugin } from '../action-handler.js'
import { CredentialProviderJWT } from '../../../credential-jwt/src'
import { createAgent } from '../../../core/src/agent.js'
import { KeyManager } from '../../../key-manager/src/key-manager.js'
import { MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { getDidKeyResolver, KeyDIDProvider } from '../../../did-provider-key/src'
import { DIDResolverPlugin } from '../../../did-resolver/src'
import { Resolver } from 'did-resolver'
import { ICredentialProvider } from '../abstract-credential-provider'
import {
  ICreateVerifiableCredentialArgs,
  ICreateVerifiablePresentationArgs,
  IssuerAgentContext,
  IVerifyCredentialArgs,
  IVerifyPresentationArgs,
  IVerifyResult,
  VerifiableCredential,
  VerifiablePresentation,
  VerifierAgentContext,
} from '@veramo/core-types'

let didKeyIdentifier: IIdentifier
let agent: TAgent<IResolver & IKeyManager & IDIDManager & ICredentialPlugin>

describe('@veramo/credential-w3c', () => {
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
          resolver: new Resolver({
            ...getDidKeyResolver(),
          }),
        }),
        new CredentialPlugin([new CredentialProviderJWT()]),
      ],
    })
    didKeyIdentifier = await agent.didManagerCreate()
  })

  class DummyProofProvider implements ICredentialProvider {
    createVerifiableCredential(
      args: ICreateVerifiableCredentialArgs,
      context: IssuerAgentContext,
    ): Promise<VerifiableCredential> {
      throw new Error('Method not implemented.')
    }
    createVerifiablePresentation(
      args: ICreateVerifiablePresentationArgs,
      context: IssuerAgentContext,
    ): Promise<VerifiablePresentation> {
      throw new Error('Method not implemented.')
    }
    verifyCredential(args: IVerifyCredentialArgs, context: VerifierAgentContext): Promise<IVerifyResult> {
      throw new Error('Method not implemented.')
    }
    verifyPresentation(args: IVerifyPresentationArgs, context: VerifierAgentContext): Promise<IVerifyResult> {
      throw new Error('Method not implemented.')
    }
    canVerifyDocumentType(args: ICanVerifyDocumentTypeArgs): boolean {
      return false
    }

    getProofFormatsSupportedForKey(key: IKey): string[] {
      return ['dummy', 'proofs']
    }

    async canIssueCredentialType(args: ICanIssueCredentialTypeArgs): Promise<boolean> {
      return false
    }
  }

  it('lists usable proof formats', async () => {
    expect.assertions(2)

    const proofFormats = await agent.listUsableProofFormats(didKeyIdentifier)
    expect(proofFormats).toEqual(['jwt'])

    const newAgent = createAgent<ICredentialPlugin>({
      plugins: [new CredentialPlugin([new DummyProofProvider()])],
    })
    const proofFormats2 = await newAgent.listUsableProofFormats(didKeyIdentifier)
    expect(proofFormats2).toEqual(['dummy', 'proofs'])
  })

  it('handles createVerifiableCredential', async () => {
    expect.assertions(1)

    const issuerId = didKeyIdentifier.did

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

    const vc = await agent.createVerifiableCredential({
      credential,
      save: false,
      proofFormat: 'jwt',
    })
    expect(vc.id).toEqual('vc1')
  })

  it('handles createVerifiablePresentation', async () => {
    expect.assertions(1)

    const issuerId = didKeyIdentifier.did

    const credential = await agent.createVerifiableCredential({
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
    })

    const presentation: PresentationPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: didKeyIdentifier.did,
      issuanceDate: new Date().toISOString(),
      verifiableCredential: [credential],
    }

    const vp = await agent.createVerifiablePresentation({
      presentation,
      save: false,
      proofFormat: 'jwt',
    })

    expect(vp.holder).toEqual(issuerId)
  })

  it('fails to create credential with unknown proof format', async () => {
    expect.assertions(1)
    await expect(() =>
      agent.createVerifiableCredential({
        credential: { dummy: 'data', issuer: { id: didKeyIdentifier.did } },
        proofFormat: 'unknown',
      }),
    ).rejects.toThrow(/invalid_setup: No issuer found for the requested proof format/)
  })

  it('fails to create presentation with unknown proof format', async () => {
    expect.assertions(1)
    await expect(() =>
      agent.createVerifiablePresentation({
        presentation: { dummy: 'data', holder: didKeyIdentifier.did },
        proofFormat: 'unknown',
      }),
    ).rejects.toThrow(/invalid_setup: No issuer found for the requested proof format/)
  })
})
