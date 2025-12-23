import { DIDResolutionResult, IAgentContext, IResolver } from '../../../core-types/src'
import { Message } from '../../../message-handler/src'
import { JwtMessageHandler, IContext } from '../message-handler.js'
import { jest } from '@jest/globals'

describe('@veramo/did-jwt', () => {
  const vcJwt =
    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vZXhhbXBsZS5jb20vMS8yLzMiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIkN1c3RvbSJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJ5b3UiOiJSb2NrIn19LCJzdWIiOiJkaWQ6d2ViOmV4YW1wbGUuY29tIiwibmJmIjoxNjA3MTEyNTA4LCJpc3MiOiJkaWQ6a2V5Ono2TWtpRkpBcU1HUE5tSnFLS0NkVW11REhSdUo3QWp3ZXFIQ200Q2NLd2tkelJINSJ9.KBRelZUm3bTURJ_biZaU51MqT22IN96FFS0cj1zuGijBg5cu1dXOMahnYK_E4Rz2iYpk9esVG9YEdLNjKGVfCA'

  const context: IContext = {
    // @ts-ignore
    agent: {
      getSchema: jest.fn(),
      execute: jest.fn(),
      availableMethods: jest.fn(),
      emit: jest.fn(),
      resolveDid: async (args?): Promise<DIDResolutionResult> => {
        if (!args?.didUrl) throw Error('DID required')

        return {
          didDocumentMetadata: {},
          didResolutionMetadata: {},
          didDocument: {
            '@context': ['https://www.w3.org/ns/did/v1'],
            id: 'did:key:z6MkiFJAqMGPNmJqKKCdUmuDHRuJ7AjweqHCm4CcKwkdzRH5',
            verificationMethod: [
              {
                id: 'did:key:z6MkiFJAqMGPNmJqKKCdUmuDHRuJ7AjweqHCm4CcKwkdzRH5#z6MkiFJAqMGPNmJqKKCdUmuDHRuJ7AjweqHCm4CcKwkdzRH5',
                type: 'Ed25519VerificationKey2018',
                controller: 'did:key:z6MkiFJAqMGPNmJqKKCdUmuDHRuJ7AjweqHCm4CcKwkdzRH5',
                publicKeyJwk: {
                  kty: 'OKP',
                  crv: 'Ed25519',
                  x: 'OF4uPFtnTUcrZESegfsnJ0K8v5mDnv7wRtoBFpwClYw',
                },
              },
            ],
            authentication: [
              'did:key:z6MkiFJAqMGPNmJqKKCdUmuDHRuJ7AjweqHCm4CcKwkdzRH5#z6MkiFJAqMGPNmJqKKCdUmuDHRuJ7AjweqHCm4CcKwkdzRH5',
            ],
            assertionMethod: [
              'did:key:z6MkiFJAqMGPNmJqKKCdUmuDHRuJ7AjweqHCm4CcKwkdzRH5#z6MkiFJAqMGPNmJqKKCdUmuDHRuJ7AjweqHCm4CcKwkdzRH5',
            ],
          },
        }
      },
      getDIDComponentById: jest.fn(),
    },
  } as IAgentContext<IResolver>

  it('should handle EdDsa jwt', async () => {
    const mockNextHandler = {
      setNext: jest.fn(),
      // @ts-ignore
      handle: jest.fn().mockResolvedValue(true),
    }
    const handler = new JwtMessageHandler()
    // @ts-ignore
    handler.setNext(mockNextHandler)

    const message = new Message({ raw: vcJwt, metaData: [{ type: 'test' }] })
    await handler.handle(message, context)
    expect(mockNextHandler.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        raw: vcJwt,
        data: {
          iss: 'did:key:z6MkiFJAqMGPNmJqKKCdUmuDHRuJ7AjweqHCm4CcKwkdzRH5',
          nbf: 1607112508,
          sub: 'did:web:example.com',
          vc: {
            '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
            credentialSubject: { you: 'Rock' },
            type: ['VerifiableCredential', 'Custom'],
          },
        },
        metaData: [{ type: 'test' }, { type: 'JWT', value: 'EdDSA' }],
      }),
      context,
    )
  })
})
