import { DIDResolutionResult, IAgentContext, ICredentialPlugin, IResolver } from '../../../core-types/src'
import { Message } from '../../../message-handler/src'
import { IContext, MessageTypes, W3cMessageHandler } from '../message-handler.js'
import { jest } from '@jest/globals'
import { blake2b } from '@noble/hashes/blake2b'
import { bytesToHex } from '../../../utils/src'

describe('@veramo/credential-w3c', () => {
  const handler = new W3cMessageHandler()
  // don't need to replace rinkeby since test has mock resolver
  const didEthr = 'did:ethr:rinkeby:0x3c357ba458933a19c1df1c7f6b473b3302bbbe61'
  const didKey = 'did:key:z6Mkqjn1SMUbR88S7BZFAZnr7sfzPXmm3DfRdMy3Z5CdMqnd'

  const context: IContext = {
    agent: {
      getSchema: jest.fn(),
      execute: jest.fn(),
      availableMethods: jest.fn(),
      emit: jest.fn(),
      resolveDid: async (args?): Promise<DIDResolutionResult> => {
        if (!args?.didUrl) throw Error('DID required')

        if (args?.didUrl === didEthr) {
          return {
            didResolutionMetadata: {},
            didDocumentMetadata: {},
            didDocument: {
              '@context': 'https://www.w3.org/ns/did/v1',
              id: args?.didUrl,
              verificationMethod: [
                {
                  id: `${didEthr}#owner`,
                  type: 'EcdsaSecp256k1RecoveryMethod2020',
                  controller: args?.didUrl,
                  blockchainAccountId: `eip155:1:${didEthr.slice(-42)}`,
                },
              ],
              authentication: [`${didEthr}#owner`],
            },
          }
        } else {
          return {
            didResolutionMetadata: {},
            didDocumentMetadata: {},
            didDocument: {
              '@context': 'https://www.w3.org/ns/did/v1',
              id: didKey,
              verificationMethod: [
                {
                  id: '#z6Mkqjn1SMUbR88S7BZFAZnr7sfzPXmm3DfRdMy3Z5CdMqnd',
                  type: 'Ed25519VerificationKey2018',
                  controller: didKey,
                  publicKeyBase58: 'CHWxr7EA5adxzgiYUzq1Gn7zZxVudLR4wM47ioEcSd1F',
                },
                {
                  id: '#z6LSkpCZ3cLP76M3Q26rhZe6q98vMdcSPTt4iML4r9UT7LVt',
                  type: 'X25519KeyAgreementKey2019',
                  controller: didKey,
                  publicKeyBase58: 'A92PXJXX1ddJJdj6Av89WYvSWV5KgrhuqNcPMgpvPxj8',
                },
              ],
              authentication: ['#z6Mkqjn1SMUbR88S7BZFAZnr7sfzPXmm3DfRdMy3Z5CdMqnd'],
              assertionMethod: ['#z6Mkqjn1SMUbR88S7BZFAZnr7sfzPXmm3DfRdMy3Z5CdMqnd'],
            },
          }
        }
      },
      createVerifiableCredential: jest.fn(),
      createVerifiablePresentation: jest.fn(),
      verifyCredential: jest.fn(),
      verifyPresentation: jest.fn(),
      getDIDComponentById: jest.fn(),
    },
  } as IAgentContext<IResolver & ICredentialPlugin>

  it('should reject unknown message type', async () => {
    expect.assertions(1)
    const message = new Message({ raw: 'test', metaData: [{ type: 'test' }] })
    await expect(handler.handle(message, context)).rejects.toThrow('Unsupported message type')
  })

  const vcJwtSecp256k1 =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODI2MTk2NzYsInN1YiI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIiwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQWxpY2UifX0sImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIn0.IGF1LFOc4_PcGVeq7Yw7OGz4Gj7xXZK6p8bP9CSEIXz7mNFPM0v0nuevTZ47a0I8XgLfCFNkUrIIscjH8MFx_wE'

  const vcPayloadSecp256k1 = {
    iat: 1582619676,
    sub: didEthr,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        name: 'Alice',
      },
    },
    iss: didEthr,
  }

  const vpJwtSecp256k1 =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODI2MTk4NzUsImF1ZCI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIiwidGFnIjoieHl6LTEyMyIsInZwIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZVByZXNlbnRhdGlvbiJdLCJ2ZXJpZmlhYmxlQ3JlZGVudGlhbCI6WyJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpGVXpJMU5rc3RVaUo5LmV5SnBZWFFpT2pFMU9ESTJNVGsyTnpZc0luTjFZaUk2SW1ScFpEcGxkR2h5T25KcGJtdGxZbms2TUhnell6TTFOMkpoTkRVNE9UTXpZVEU1WXpGa1pqRmpOMlkyWWpRM00ySXpNekF5WW1KaVpUWXhJaXdpZG1NaU9uc2lRR052Ym5SbGVIUWlPbHNpYUhSMGNITTZMeTkzZDNjdWR6TXViM0puTHpJd01UZ3ZZM0psWkdWdWRHbGhiSE12ZGpFaVhTd2lkSGx3WlNJNld5SldaWEpwWm1saFlteGxRM0psWkdWdWRHbGhiQ0pkTENKamNtVmtaVzUwYVdGc1UzVmlhbVZqZENJNmV5SnVZVzFsSWpvaVFXeHBZMlVpZlgwc0ltbHpjeUk2SW1ScFpEcGxkR2h5T25KcGJtdGxZbms2TUhnell6TTFOMkpoTkRVNE9UTXpZVEU1WXpGa1pqRmpOMlkyWWpRM00ySXpNekF5WW1KaVpUWXhJbjAuSUdGMUxGT2M0X1BjR1ZlcTdZdzdPR3o0R2o3eFhaSzZwOGJQOUNTRUlYejdtTkZQTTB2MG51ZXZUWjQ3YTBJOFhnTGZDRk5rVXJJSXNjakg4TUZ4X3dFIl19LCJpc3MiOiJkaWQ6ZXRocjpyaW5rZWJ5OjB4M2MzNTdiYTQ1ODkzM2ExOWMxZGYxYzdmNmI0NzNiMzMwMmJiYmU2MSJ9.7gIGq437moBKMwF3PUrycjCP4Op6dL6IJV6GygSq1KGV7QU0II16YzETsr412AlHl_kaYgUJjRav7unJdyJL0wA'

  const vpPayloadSecp256k1 = {
    iat: 1582619875,
    aud: didEthr,
    tag: 'xyz-123',
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODI2MTk2NzYsInN1YiI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIiwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQWxpY2UifX0sImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHgzYzM1N2JhNDU4OTMzYTE5YzFkZjFjN2Y2YjQ3M2IzMzAyYmJiZTYxIn0.IGF1LFOc4_PcGVeq7Yw7OGz4Gj7xXZK6p8bP9CSEIXz7mNFPM0v0nuevTZ47a0I8XgLfCFNkUrIIscjH8MFx_wE',
      ],
    },
    iss: didEthr,
  }

  it('should return handled VC message (ES256K-R)', async () => {
    expect.assertions(6)
    const message = new Message({ raw: vcJwtSecp256k1, metaData: [{ type: 'test' }] })
    // This would be done by '@veramo/did-jwt':
    message.data = vcPayloadSecp256k1
    message.addMetaData({ type: 'JWT', value: 'ES256K-R' })
    const handled = await handler.handle(message, context)
    expect(handled.isValid()).toEqual(true)
    expect(handled.id).toEqual(bytesToHex(blake2b(vcJwtSecp256k1)))
    expect(handled.raw).toEqual(vcJwtSecp256k1)
    expect(handled.type).toEqual(MessageTypes.vc)
    expect(handled.from).toEqual(vcPayloadSecp256k1.iss)
    expect(handled.to).toEqual(vcPayloadSecp256k1.sub)
    // expect(handled.timestamp).toEqual(vcPayload.iat)
  })

  it('should return handled VP message (ES256K-R)', async () => {
    expect.assertions(7)
    const message = new Message({ raw: vpJwtSecp256k1, metaData: [{ type: 'test' }] })
    // This would be done by '@veramo/did-jwt':
    message.data = vpPayloadSecp256k1
    message.addMetaData({ type: 'JWT', value: 'ES256K-R' })

    const handled = await handler.handle(message, context)
    expect(handled.isValid()).toEqual(true)
    expect(handled.id).toEqual(bytesToHex(blake2b(vpJwtSecp256k1)))
    expect(handled.raw).toEqual(vpJwtSecp256k1)
    expect(handled.type).toEqual(MessageTypes.vp)
    expect(handled.from).toEqual(vpPayloadSecp256k1.iss)
    expect(handled.to).toEqual(vpPayloadSecp256k1.aud)
    expect(handled.threadId).toEqual(vpPayloadSecp256k1.tag)
    // expect(handled.timestamp).toEqual(vpPayload.iat)
  })

  const vcJwtEd25519 =
    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQWxpY2UifSwiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlByb2ZpbGUiXX0sInN1YiI6ImRpZDprZXk6ejZNa3FqbjFTTVViUjg4UzdCWkZBWm5yN3NmelBYbW0zRGZSZE15M1o1Q2RNcW5kIiwibmJmIjoxNjIxOTczOTU0LCJpc3MiOiJkaWQ6a2V5Ono2TWtxam4xU01VYlI4OFM3QlpGQVpucjdzZnpQWG1tM0RmUmRNeTNaNUNkTXFuZCJ9.xFUvm49vS4dNoSURJwrCMwdePgrAyBRzs7GqvcUyD6KjfNM8eSgFeF8CEUHC21WcwrmbTNrzpQtgFQTFP_9HAA'

  const vcPayloadEd25519 = {
    vc: {
      credentialSubject: {
        name: 'Alice',
      },
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'Profile'],
    },
    sub: didKey,
    nbf: 1621973954,
    iss: didKey,
  }

  const vpJwtEd25519 =
    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iLCJQcm9maWxlIl0sInZlcmlmaWFibGVDcmVkZW50aWFsIjpbImV5SmhiR2NpT2lKRlpFUlRRU0lzSW5SNWNDSTZJa3BYVkNKOS5leUoyWXlJNmV5SmpjbVZrWlc1MGFXRnNVM1ZpYW1WamRDSTZleUp1WVcxbElqb2lRV3hwWTJVaWZTd2lRR052Ym5SbGVIUWlPbHNpYUhSMGNITTZMeTkzZDNjdWR6TXViM0puTHpJd01UZ3ZZM0psWkdWdWRHbGhiSE12ZGpFaVhTd2lkSGx3WlNJNld5SldaWEpwWm1saFlteGxRM0psWkdWdWRHbGhiQ0lzSWxCeWIyWnBiR1VpWFgwc0luTjFZaUk2SW1ScFpEcHJaWGs2ZWpaTmEzRnFiakZUVFZWaVVqZzRVemRDV2taQldtNXlOM05tZWxCWWJXMHpSR1pTWkUxNU0xbzFRMlJOY1c1a0lpd2libUptSWpveE5qSXhPVGN6T1RVMExDSnBjM01pT2lKa2FXUTZhMlY1T25vMlRXdHhhbTR4VTAxVllsSTRPRk0zUWxwR1FWcHVjamR6Wm5wUVdHMXRNMFJtVW1STmVUTmFOVU5rVFhGdVpDSjkueEZVdm00OXZTNGROb1NVUkp3ckNNd2RlUGdyQXlCUnpzN0dxdmNVeUQ2S2pmTk04ZVNnRmVGOENFVUhDMjFXY3dybWJUTnJ6cFF0Z0ZRVEZQXzlIQUEiXX0sInRhZyI6Inh5ejEyMyIsIm5iZiI6MTYyMTk3NDM4MiwiaXNzIjoiZGlkOmtleTp6Nk1rcWpuMVNNVWJSODhTN0JaRkFabnI3c2Z6UFhtbTNEZlJkTXkzWjVDZE1xbmQiLCJhdWQiOlsiZGlkOmtleTp6Nk1rcWpuMVNNVWJSODhTN0JaRkFabnI3c2Z6UFhtbTNEZlJkTXkzWjVDZE1xbmQiXX0.Lju6nUthZXnCi3RyX-6IRowzWQMp5FpcHLHqL9J9AvVWlNa40eWTdhhXPkshLoxjY9sorIO39G_1fc09MWWlAQ'

  const vpPayloadEd25519 = {
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation', 'Profile'],
      verifiableCredential: [
        'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQWxpY2UifSwiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlByb2ZpbGUiXX0sInN1YiI6ImRpZDprZXk6ejZNa3FqbjFTTVViUjg4UzdCWkZBWm5yN3NmelBYbW0zRGZSZE15M1o1Q2RNcW5kIiwibmJmIjoxNjIxOTczOTU0LCJpc3MiOiJkaWQ6a2V5Ono2TWtxam4xU01VYlI4OFM3QlpGQVpucjdzZnpQWG1tM0RmUmRNeTNaNUNkTXFuZCJ9.xFUvm49vS4dNoSURJwrCMwdePgrAyBRzs7GqvcUyD6KjfNM8eSgFeF8CEUHC21WcwrmbTNrzpQtgFQTFP_9HAA',
      ],
    },
    tag: 'xyz123',
    nbf: 1621974382,
    iss: didKey,
    aud: didKey,
  }

  it('should return handled VC message (Ed25519)', async () => {
    expect.assertions(6)
    const message = new Message({ raw: vcJwtEd25519, metaData: [{ type: 'test' }] })
    // This would be done by '@veramo/did-jwt':
    message.data = vcPayloadEd25519
    message.addMetaData({ type: 'JWT', value: 'Ed25519' })
    const handled = await handler.handle(message, context)
    expect(handled.isValid()).toEqual(true)
    expect(handled.id).toEqual(bytesToHex(blake2b(vcJwtEd25519)))
    expect(handled.raw).toEqual(vcJwtEd25519)
    expect(handled.type).toEqual(MessageTypes.vc)
    expect(handled.from).toEqual(vcPayloadEd25519.iss)
    expect(handled.to).toEqual(vcPayloadEd25519.sub)
  })

  it('should return handled VP message (Ed25519)', async () => {
    expect.assertions(7)
    const message = new Message({ raw: vpJwtEd25519, metaData: [{ type: 'test' }] })
    // This would be done by '@veramo/did-jwt':
    message.data = vpPayloadEd25519
    message.addMetaData({ type: 'JWT', value: 'Ed25519' })

    const handled = await handler.handle(message, context)
    expect(handled.isValid()).toEqual(true)
    expect(handled.id).toEqual(bytesToHex(blake2b(vpJwtEd25519)))
    expect(handled.raw).toEqual(vpJwtEd25519)
    expect(handled.type).toEqual(MessageTypes.vp)
    expect(handled.from).toEqual(vpPayloadEd25519.iss)
    expect(handled.to).toEqual(vpPayloadEd25519.aud)
    expect(handled.threadId).toEqual(vpPayloadEd25519.tag)
  })

  const vpMultiAudJwt =
    'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKaGJHY2lPaUpGVXpJMU5rc2lMQ0owZVhBaU9pSktWMVFpZlEuZXlKMll5STZleUpBWTI5dWRHVjRkQ0k2V3lKb2RIUndjem92TDNkM2R5NTNNeTV2Y21jdk1qQXhPQzlqY21Wa1pXNTBhV0ZzY3k5Mk1TSXNJbWgwZEhCek9pOHZkbVZ5WVcxdkxtbHZMMk52Ym5SbGVIUnpMM0J5YjJacGJHVXZkakVpWFN3aWRIbHdaU0k2V3lKV1pYSnBabWxoWW14bFEzSmxaR1Z1ZEdsaGJDSmRMQ0pqY21Wa1pXNTBhV0ZzVTNWaWFtVmpkQ0k2ZXlKdVlXMWxJam9pUVd4cFkyVWlmWDBzSW5OMVlpSTZJbVJwWkRwbGRHaHlPbWR2WlhKc2FUb3dlREF5WkdJMllqZ3pZVE00WlRNeFpHVmtabU5rTURBeE4yRTBPRE5qT0dJd01EY3pZV1EwTURRNU5UZG1OV1l6TXpjNFpEVmtPR1l6WkRneU5USXhNRFE0T1NJc0ltNWlaaUk2TVRZMk5UUTFNalUwT0N3aWFYTnpJam9pWkdsa09tVjBhSEk2WjI5bGNteHBPakI0TURKa1lqWmlPRE5oTXpobE16RmtaV1JtWTJRd01ERTNZVFE0TTJNNFlqQXdOek5oWkRRd05EazFOMlkxWmpNek56aGtOV1E0WmpOa09ESTFNakV3TkRnNUluMC56ZXRBSXVTVWtxNGlmbmxhelg3c1RodTlpd3VzNjZDVHBfaDVObW0xc2RyZXZ4ck02WklSZGJEVExrZlZ6MmxGR3BxeU1aLW9tMVBtUHNOOFluY2ZSZyJdfSwidGFnIjoidGFnMTIzIiwibmJmIjoxNjY1NDUzMDYwLCJpc3MiOiJkaWQ6ZXRocjpnb2VybGk6MHgwMmRiNmI4M2EzOGUzMWRlZGZjZDAwMTdhNDgzYzhiMDA3M2FkNDA0OTU3ZjVmMzM3OGQ1ZDhmM2Q4MjUyMTA0ODkiLCJhdWQiOlsiZGlkOmV4YW1wbGU6MzQ1NiIsImRpZDp3ZWI6dXBvcnQubWUiXX0.NfQjQb3_mo956o5guLTV5iKF9mna-Yy70MBZQlNDu9OujpDhbsaQ5MHFw5GGG1M47_74ZAaMTOx9Wc7iY7eLZw'

  const vpMultiAudPayload = {
    iat: 1588676739,
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [vpMultiAudJwt],
    },
    tag: 'tag123',
    aud: ['did:example:3456', 'did:web:uport.me'],
    iss: 'did:ethr:goerli:0x02db6b83a38e31dedfcd0017a483c8b0073ad404957f5f3378d5d8f3d825210489',
  }

  it('should use the first audience did as a message.to field', async () => {
    expect.assertions(7)
    const message = new Message({ raw: vpMultiAudJwt, metaData: [{ type: 'test' }] })
    // This would be done by '@veramo/did-jwt':
    message.data = vpMultiAudPayload
    message.addMetaData({ type: 'JWT', value: 'ES256K-R' })

    const handled = await handler.handle(message, context)
    expect(handled.isValid()).toEqual(true)
    expect(handled.id).toEqual(bytesToHex(blake2b(vpMultiAudJwt)))
    expect(handled.raw).toEqual(vpMultiAudJwt)
    expect(handled.type).toEqual(MessageTypes.vp)
    expect(handled.from).toEqual(vpMultiAudPayload.iss)
    expect(handled.to).toEqual(vpMultiAudPayload.aud[0])
    expect(handled.threadId).toEqual(vpMultiAudPayload.tag)
  })

  it('should return handled VC message with credentialStatus', async () => {
    expect.assertions(6)
    const token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1ODgyNDkyNTgsInN1YiI6ImRpZDp3ZWI6dXBvcnQubWUiLCJub25jZSI6IjM4NzE4Njc0NTMiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQXdlc29tZW5lc3NDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7Iml0IjoicmVhbGx5IHdoaXBzIHRoZSBsbGFtbWEncyBhc3MhIn19LCJjcmVkZW50aWFsU3RhdHVzIjp7InR5cGUiOiJFdGhyU3RhdHVzUmVnaXN0cnkyMDE5IiwiaWQiOiJyaW5rZWJ5OjB4OTdmZDI3ODkyY2RjRDAzNWRBZTFmZTcxMjM1YzYzNjA0NEI1OTM0OCJ9LCJpc3MiOiJkaWQ6ZXRocjoweDU0ZDU5ZTNmZmQ3NjkxN2Y2MmRiNzAyYWMzNTRiMTdmMzg0Mjk1NWUifQ.mtMt6-sJdaKH_sPUFPan1FzvWPtlrdKLRCHrh1aOS_zSVyTGHynA0-5AHcEujB1Rz1SuzuM3rkhHRO8eX2IAYg'
    const message = new Message({
      raw: token,
      metaData: [{ type: 'test' }],
    })
    // This would be done by '@veramo/did-jwt':
    message.data = {
      iat: 1588249258,
      sub: 'did:web:uport.me',
      vc: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'AwesomenessCredential'],
        credentialSubject: {
          it: "really whips the llamma's ass!",
        },
      },
      credentialStatus: {
        type: 'EthrStatusRegistry2019',
        // TODO(nickreynolds): deploy
        id: 'goerli:0x97fd27892cdcD035dAe1fe71235c636044B59348',
      },
      iss: 'did:ethr:0x54d59e3ffd76917f62db702ac354b17f3842955e',
    }
    message.addMetaData({ type: 'JWT', value: 'ES256K' })

    const handled = await handler.handle(message, context)

    expect(handled.isValid()).toEqual(true)
    expect(handled.id).toEqual(bytesToHex(blake2b(token)))
    expect(handled.raw).toEqual(token)
    expect(handled.type).toEqual(MessageTypes.vc)
    expect(handled.from).toEqual('did:ethr:0x54d59e3ffd76917f62db702ac354b17f3842955e')
    expect(handled.to).toEqual('did:web:uport.me')
  })
})
