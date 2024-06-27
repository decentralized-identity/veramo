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
import { EthrDIDProvider } from '../../../did-provider-ethr/src/index.js'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { jest } from '@jest/globals'

import 'cross-fetch/polyfill'
import { CredentialIssuerJWT } from '../agent/CredentialJWT.js'

jest.setTimeout(300000)

const infuraProjectId = '3586660d179141e3801c3895de1c2eba'

describe('credential-jwt full flow', () => {
    let didKeyIdentifier: IIdentifier
    let didEthrIdentifier: IIdentifier
    let agent: TAgent<IResolver & IKeyManager & IDIDManager & ICredentialPlugin>
    const jwt = new CredentialIssuerJWT()

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
                new CredentialPlugin({ issuers: [jwt] }),
            ],
        })
        didKeyIdentifier = await agent.didManagerCreate()
        didEthrIdentifier = await agent.didManagerCreate({ provider: 'did:ethr' })
    })

    it('issues and verifies JWT credential', async () => {
        const credential: CredentialPayload = {
            issuer: { id: didEthrIdentifier.did },
            '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
            type: ['VerifiableCredential', 'Custom'],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: 'did:web:example.com',
                you: 'Rock',
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

    it('issues credential and verifies presentation', async () => {
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
