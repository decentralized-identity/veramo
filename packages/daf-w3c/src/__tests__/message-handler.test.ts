import { Message, Agent } from 'daf-core'
import { W3cMessageHandler, MessageTypes } from '../index'
import { blake2bHex } from 'blakejs'

describe('daf-w3c', () => {
  const vcJwt =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODI2MTk2NzYsInN1YiI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIiwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQWxpY2UifX0sImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIn0.IGF1LFOc4_PcGVeq7Yw7OGz4Gj7xXZK6p8bP9CSEIXz7mNFPM0v0nuevTZ47a0I8XgLfCFNkUrIIscjH8MFx_wE'

  const vcPayload = {
    iat: 1582619676,
    sub: 'did:ethr:rinkeby:0x3c357ba458933a19c1df1c7f6b473b3302bbbe61',
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        name: 'Alice',
      },
    },
    iss: 'did:ethr:rinkeby:0x3c357ba458933a19c1df1c7f6b473b3302bbbe61',
  }

  const vpJwt =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODI2MTk4NzUsImF1ZCI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIiwidGFnIjoieHl6LTEyMyIsInZwIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZVByZXNlbnRhdGlvbiJdLCJ2ZXJpZmlhYmxlQ3JlZGVudGlhbCI6WyJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpGVXpJMU5rc3RVaUo5LmV5SnBZWFFpT2pFMU9ESTJNVGsyTnpZc0luTjFZaUk2SW1ScFpEcGxkR2h5T25KcGJtdGxZbms2TUhnell6TTFOMkpoTkRVNE9UTXpZVEU1WXpGa1pqRmpOMlkyWWpRM00ySXpNekF5WW1KaVpUWXhJaXdpZG1NaU9uc2lRR052Ym5SbGVIUWlPbHNpYUhSMGNITTZMeTkzZDNjdWR6TXViM0puTHpJd01UZ3ZZM0psWkdWdWRHbGhiSE12ZGpFaVhTd2lkSGx3WlNJNld5SldaWEpwWm1saFlteGxRM0psWkdWdWRHbGhiQ0pkTENKamNtVmtaVzUwYVdGc1UzVmlhbVZqZENJNmV5SnVZVzFsSWpvaVFXeHBZMlVpZlgwc0ltbHpjeUk2SW1ScFpEcGxkR2h5T25KcGJtdGxZbms2TUhnell6TTFOMkpoTkRVNE9UTXpZVEU1WXpGa1pqRmpOMlkyWWpRM00ySXpNekF5WW1KaVpUWXhJbjAuSUdGMUxGT2M0X1BjR1ZlcTdZdzdPR3o0R2o3eFhaSzZwOGJQOUNTRUlYejdtTkZQTTB2MG51ZXZUWjQ3YTBJOFhnTGZDRk5rVXJJSXNjakg4TUZ4X3dFIl19LCJpc3MiOiJkaWQ6ZXRocjpyaW5rZWJ5OjB4M2MzNTdiYTQ1ODkzM2ExOWMxZGYxYzdmNmI0NzNiMzMwMmJiYmU2MSJ9.7gIGq437moBKMwF3PUrycjCP4Op6dL6IJV6GygSq1KGV7QU0II16YzETsr412AlHl_kaYgUJjRav7unJdyJL0wA'

  const vpPayload = {
    iat: 1582619875,
    aud: 'did:ethr:rinkeby:0x3c357ba458933a19c1df1c7f6b473b3302bbbe61',
    tag: 'xyz-123',
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODI2MTk2NzYsInN1YiI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIiwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQWxpY2UifX0sImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIn0.IGF1LFOc4_PcGVeq7Yw7OGz4Gj7xXZK6p8bP9CSEIXz7mNFPM0v0nuevTZ47a0I8XgLfCFNkUrIIscjH8MFx_wE',
      ],
    },
    iss: 'did:ethr:rinkeby:0x3c357ba458933a19c1df1c7f6b473b3302bbbe61',
  }

  const handler = new W3cMessageHandler()

  const agent = new Agent({
    identityProviders: [],
    serviceControllers: [],
    messageHandler: handler,
    didResolver: {
      //"did:ethr:rinkeby:0x3c357ba458933a19c1df1c7f6b473b3302bbbe61"
      resolve: async (did: string) => ({
        '@context': 'https://w3id.org/did/v1',
        id: did,
        publicKey: [
          {
            id: `${did}#owner`,
            type: 'Secp256k1VerificationKey2018',
            owner: did,
            ethereumAddress: '0x3c357ba458933a19c1df1c7f6b473b3302bbbe61',
          },
        ],
        authentication: [
          {
            type: 'Secp256k1SignatureAuthentication2018',
            publicKey: `${did}#owner`,
          },
        ],
      }),
    },
  })

  it('should reject unknown message type', async () => {
    const message = new Message({ raw: 'test', metaData: [{ type: 'test' }] })
    expect(handler.handle(message, agent)).rejects.toEqual('Unsupported message type')
  })

  it('should return handled VC message', async () => {
    const message = new Message({ raw: vcJwt, metaData: [{ type: 'test' }] })
    // This would be done by 'daf-did-jwt':
    message.data = vcPayload
    message.addMetaData({ type: 'JWT', value: 'ES256K-R' })
    const handled = await handler.handle(message, agent)
    expect(handled.isValid()).toEqual(true)
    expect(handled.id).toEqual(blake2bHex(vcJwt))
    expect(handled.raw).toEqual(vcJwt)
    expect(handled.type).toEqual(MessageTypes.vc)
    expect(handled.from.did).toEqual(vcPayload.iss)
    expect(handled.to.did).toEqual(vcPayload.sub)
    // expect(handled.timestamp).toEqual(vcPayload.iat)
  })

  it('should return handled VP message', async () => {
    const message = new Message({ raw: vpJwt, metaData: [{ type: 'test' }] })
    // This would be done by 'daf-did-jwt':
    message.data = vpPayload
    message.addMetaData({ type: 'JWT', value: 'ES256K-R' })

    const handled = await handler.handle(message, agent)
    expect(handled.isValid()).toEqual(true)
    expect(handled.id).toEqual(blake2bHex(vpJwt))
    expect(handled.raw).toEqual(vpJwt)
    expect(handled.type).toEqual(MessageTypes.vp)
    expect(handled.from.did).toEqual(vpPayload.iss)
    expect(handled.to.did).toEqual(vpPayload.aud)
    expect(handled.threadId).toEqual(vpPayload.tag)
    // expect(handled.timestamp).toEqual(vpPayload.iat)
  })
})
