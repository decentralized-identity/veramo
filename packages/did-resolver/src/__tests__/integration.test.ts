import { DIDResolverPlugin } from '../resolver.js'
import { Resolver } from 'did-resolver'
import { getResolver as getEthrResolver } from 'ethr-did-resolver'
import { getResolver as getWebDidResolver } from 'web-did-resolver'
import { getUniversalResolverFor } from '../universal-resolver.js'
import { jest } from '@jest/globals'

jest.setTimeout(60000)

const providerConfig = {
  networks: [
    { name: 'mainnet', rpcUrl: 'https://mainnet.infura.io/v3/3586660d179141e3801c3895de1c2eba' },
    { name: 'development', rpcUrl: 'http://localhost:7545' },
    // FIXME: add this example
    // { name: 'test', provider: TBD_add_example_of_custom_provider_usage },
  ],
}

let resolverMap = {
  // resolve did:ethr using the embedded ethr-did-resolver
  ...getEthrResolver(providerConfig),
  // resolve did:web using the embedded web-did-resolver
  ...getWebDidResolver(),
  // resolve some other DID methods using the centralized `uniresolver.io` service
  ...getUniversalResolverFor(['key', 'elem']),
}

/** This creates a resolver that supports the [ethr, web, key, elem] DID methods */
let resolver = new Resolver(resolverMap)
let resolverPlugin: DIDResolverPlugin = new DIDResolverPlugin({ resolver })
let resolverPluginDirect: DIDResolverPlugin = new DIDResolverPlugin(resolverMap)

describe('@veramo/did-resolver', () => {
  beforeAll(() => {})

  it('should resolve web DID', async () => {
    expect.assertions(1)
    await expect(resolverPlugin.resolveDid({ didUrl: 'did:web:did.actor:alice' })).resolves.toEqual({
      didDocument: {
        '@context': ['https://w3.org/ns/did/v1', 'https://w3id.org/security/suites/ed25519-2018/v1'],
        id: 'did:web:did.actor:alice',
        publicKey: [
          {
            id: 'did:web:did.actor:alice#z6MkrmNwty5ajKtFqc1U48oL2MMLjWjartwc5sf2AihZwXDN',
            controller: 'did:web:did.actor:alice',
            type: 'Ed25519VerificationKey2018',
            publicKeyBase58: 'DK7uJiq9PnPnj7AmNZqVBFoLuwTjT1hFPrk6LSjZ2JRz',
          },
        ],
        authentication: ['did:web:did.actor:alice#z6MkrmNwty5ajKtFqc1U48oL2MMLjWjartwc5sf2AihZwXDN'],
        assertionMethod: ['did:web:did.actor:alice#z6MkrmNwty5ajKtFqc1U48oL2MMLjWjartwc5sf2AihZwXDN'],
        capabilityDelegation: ['did:web:did.actor:alice#z6MkrmNwty5ajKtFqc1U48oL2MMLjWjartwc5sf2AihZwXDN'],
        capabilityInvocation: ['did:web:did.actor:alice#z6MkrmNwty5ajKtFqc1U48oL2MMLjWjartwc5sf2AihZwXDN'],
        keyAgreement: [
          {
            id: 'did:web:did.actor:alice#zC8GybikEfyNaausDA4mkT4egP7SNLx2T1d1kujLQbcP6h',
            type: 'X25519KeyAgreementKey2019',
            controller: 'did:web:did.actor:alice',
            publicKeyBase58: 'CaSHXEvLKS6SfN9aBfkVGBpp15jSnaHazqHgLHp8KZ3Y',
          },
        ],
      },
      didDocumentMetadata: {},
      didResolutionMetadata: { contentType: 'application/did+ld+json' },
    })
  })

  it('should resolve ethr-did with RPC URL', async () => {
    expect.assertions(1)
    await expect(
      resolverPlugin.resolveDid({ didUrl: 'did:ethr:mainnet:0xaafe788d8ca214a080b0f6ac7f48480b2aefa9bb' }),
    ).resolves.toEqual({
      didDocument: {
        '@context': expect.anything(),
        id: 'did:ethr:mainnet:0xaafe788d8ca214a080b0f6ac7f48480b2aefa9bb',
        verificationMethod: [
          {
            id: 'did:ethr:mainnet:0xaafe788d8ca214a080b0f6ac7f48480b2aefa9bb#controller',
            type: 'EcdsaSecp256k1RecoveryMethod2020',
            controller: 'did:ethr:mainnet:0xaafe788d8ca214a080b0f6ac7f48480b2aefa9bb',
            blockchainAccountId: 'eip155:1:0xaafE788D8cA214A080B0F6aC7f48480B2aEFa9bb',
          },
        ],
        authentication: ['did:ethr:mainnet:0xaafe788d8ca214a080b0f6ac7f48480b2aefa9bb#controller'],
        assertionMethod: ['did:ethr:mainnet:0xaafe788d8ca214a080b0f6ac7f48480b2aefa9bb#controller'],
      },
      didDocumentMetadata: {},
      didResolutionMetadata: { contentType: 'application/did+ld+json' },
    })
  })

  it('should resolve web DID using direct constructor', async () => {
    expect.assertions(1)
    const result = await resolverPluginDirect.resolveDid({ didUrl: 'did:web:did.actor:alice' })
    expect(result?.didDocument?.id).toEqual('did:web:did.actor:alice')
  })

  it('should resolve ethr-did with RPC URL using direct constructor', async () => {
    expect.assertions(1)
    const result = await resolverPluginDirect.resolveDid({
      didUrl: 'did:ethr:0xaafe788d8ca214a080b0f6ac7f48480b2aefa9bb',
    })
    expect(result?.didDocument?.id).toEqual('did:ethr:0xaafe788d8ca214a080b0f6ac7f48480b2aefa9bb')
  })

  it('should fail predictably when unsupported method is resolved', async () => {
    expect.assertions(1)
    await expect(resolverPlugin.resolveDid({ didUrl: 'did:unsupported:lorem.ipsum' })).resolves.toEqual({
      didDocument: null,
      didDocumentMetadata: {},
      didResolutionMetadata: { error: 'unsupportedDidMethod' },
    })
  })
})
