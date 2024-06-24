import {
    CredentialPayload,
    ICredentialPlugin,
    IDIDManager,
    IIdentifier,
    IKeyManager,
    IResolver,
    TAgent,
} from '../../../core-types/src'
import { createAgent } from '../../../core/src'
import { CredentialPlugin } from '../../../credential-w3c/src'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'
import { getDidKeyResolver, KeyDIDProvider } from '../../../did-provider-key/src'
import { DIDResolverPlugin } from '../../../did-resolver/src'
import { EthrDIDProvider } from '../../../did-provider-ethr/src'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { jest } from '@jest/globals'

import 'cross-fetch/polyfill'
import { CredentialIssuerJWT } from '../agent/CredentialJWT.js'
import { ICredentialIssuerJWT } from '../types/ICredentialJWT.js'

jest.setTimeout(300000)

const infuraProjectId = '3586660d179141e3801c3895de1c2eba'

describe('credential-LD full flow', () => {
    let didKeyIdentifier: IIdentifier
    let didEthrIdentifier: IIdentifier
    let agent: TAgent<IResolver & IKeyManager & IDIDManager & ICredentialPlugin & ICredentialIssuerJWT>
    const jwt = new CredentialIssuerJWT()

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
                new CredentialPlugin([jwt]),
                jwt
            ],
        })
        didKeyIdentifier = await agent.didManagerCreate()
        didEthrIdentifier = await agent.didManagerCreate({ provider: 'did:ethr' })
    })

    it('create credential with inline context', async () => {
        const credential: CredentialPayload = {
            issuer: didKeyIdentifier.did,
            '@context': [
                {
                    '@context': {
                        nothing: 'custom:example.context#blank',
                    },
                },
            ],
            credentialSubject: {
                nothing: 'else matters',
            },
        }
        const verifiableCredential = await agent.createVerifiableCredential({
            credential,
            proofFormat: 'jwt',
        })

        expect(verifiableCredential).toBeDefined()

        const result = await agent.verifyCredential({
            credential: verifiableCredential,
        })

        expect(result.verified).toBe(true)
    })

    it('works with Ed25519Signature2018 credential', async () => {
        const credential: CredentialPayload = {
            issuer: didKeyIdentifier.did,
            '@context': ['custom:example.context'],
            credentialSubject: {
                nothing: 'else matters',
            },
        }
        const verifiableCredential = await agent.createVerifiableCredential({
            credential,
            proofFormat: 'jwt',
        })

        expect(verifiableCredential).toBeDefined()

        const result = await agent.verifyCredential({
            credential: verifiableCredential,
        })

        expect(result.verified).toBe(true)
    })

    it('works with EcdsaSecp256k1RecoveryMethod2020 credentials', async () => {
        const credential: CredentialPayload = {
            issuer: didEthrIdentifier.did,
            '@context': ['custom:example.context'],
            credentialSubject: {
                nothing: 'else matters',
            },
        }
        const verifiableCredential = await agent.createVerifiableCredential({
            credential,
            proofFormat: 'jwt',
        })

        expect(verifiableCredential).toBeDefined()

        const result = await agent.verifyCredential({
            credential: verifiableCredential,
        })

        expect(result.verified).toBe(true)
    })

    it('works with Ed25519Signature2018 credential and presentation', async () => {
        const credential: CredentialPayload = {
            issuer: didKeyIdentifier.did,
            '@context': ['custom:example.context'],
            credentialSubject: {
                nothing: 'else matters',
            },
        }
        const verifiableCredential1 = await agent.createVerifiableCredential({
            credential,
            proofFormat: 'jwt',
        })

        const verifiablePresentation = await agent.createVerifiablePresentation({
            presentation: {
                verifiableCredential: [verifiableCredential1],
                holder: didKeyIdentifier.did,
            },
            challenge: 'VERAMO',
            proofFormat: 'jwt',
        })

        expect(verifiablePresentation).toBeDefined()

        const result = await agent.verifyPresentation({
            presentation: verifiablePresentation,
            challenge: 'VERAMO',
        })

        expect(result.verified).toBe(true)
    })

    it('works with EcdsaSecp256k1RecoveryMethod2020 credential and presentation', async () => {
        const credential: CredentialPayload = {
            issuer: { id: didEthrIdentifier.did },
            '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
            type: ['VerifiableCredential', 'Profile'],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: didKeyIdentifier.did,
                name: 'Martin, the great',
            },
        }
        const verifiableCredential1 = await agent.createVerifiableCredential({
            credential,
            proofFormat: 'jwt',
        })

        const verifiablePresentation = await agent.createVerifiablePresentation({
            presentation: {
                verifiableCredential: [verifiableCredential1],
                holder: didEthrIdentifier.did,
            },
            challenge: 'VERAMO',
            proofFormat: 'jwt',
        })

        expect(verifiablePresentation).toBeDefined()

        const result = await agent.verifyPresentation({
            presentation: verifiablePresentation,
            challenge: 'VERAMO',
        })

        expect(result.verified).toBe(true)
    })
})
