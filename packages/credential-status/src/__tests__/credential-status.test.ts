import { createAgent, VerifiableCredential } from '@veramo/core'
import { ICredentialStatusVerifier } from '@veramo/core/src/types/ICredentialStatusVerifier.js'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { CredentialStatusPlugin } from '../credential-status'
import { DIDDocument, DIDResolutionOptions, DIDResolutionResult, Resolvable } from 'did-resolver'
import { jest } from '@jest/globals'
import { CredentialStatusReference } from '@veramo/core/src/types/vc-data-model.js'

describe('@veramo/credential-status', () => {
  const referenceDoc: DIDDocument = { id: 'did:example:1234' }
  const referenceCredential: VerifiableCredential & { credentialStatus: CredentialStatusReference } = {
    '@context': [],
    issuanceDate: new Date().toISOString(),
    proof: {},
    issuer: referenceDoc.id,
    credentialSubject: {},
    credentialStatus: {
      type: 'ExoticStatusMethod2022',
      id: 'some-exotic-id',
    },
  }

  it('should check the credential status', async () => {
    expect.assertions(3)
    const expectedResult = { verified: true }
    const checkStatus = jest.fn(async () => expectedResult)
    const agent = createAgent<ICredentialStatusVerifier>({
      plugins: [
        new CredentialStatusPlugin({
          ExoticStatusMethod2022: checkStatus,
        }),
      ],
    })

    const result = await agent.checkCredentialStatus({
      credential: referenceCredential,
      didDocumentOverride: referenceDoc,
    })

    expect(result).toStrictEqual(expectedResult)
    expect(checkStatus).toBeCalledTimes(1)
    expect(checkStatus).toBeCalledWith(referenceCredential, referenceDoc)
  })

  it('should check the credential status using DID resolver to get the issuer doc', async () => {
    expect.assertions(4)
    const expectedResult = { verified: true }
    const checkStatus = jest.fn(async () => expectedResult)
    const fakeResolver: Resolvable = {
      resolve: jest.fn(
        async (didUrl: string, options?: DIDResolutionOptions): Promise<DIDResolutionResult> => {
          return {
            didDocument: { id: didUrl },
            didResolutionMetadata: {},
            didDocumentMetadata: {},
          }
        },
      ),
    }
    const agent = createAgent({
      plugins: [
        new CredentialStatusPlugin({
          ExoticStatusMethod2022: checkStatus,
        }),
        new DIDResolverPlugin({ resolver: fakeResolver }),
      ],
    })

    const result = await agent.checkCredentialStatus({
      credential: referenceCredential,
    })

    expect(result).toStrictEqual(expectedResult)
    expect(checkStatus).toBeCalledTimes(1)
    expect(checkStatus).toBeCalledWith(referenceCredential, referenceDoc)
    expect(fakeResolver.resolve).toBeCalledTimes(1)
  })

  it('should not perform status check if no `credentialStatus` present', async () => {
    expect.assertions(2)
    const checkStatus = jest.fn()
    const agent = createAgent({
      plugins: [
        new CredentialStatusPlugin({
          // @ts-ignore
          ExoticStatusMethod2022: checkStatus,
        }),
      ],
    })

    const result = await agent.checkCredentialStatus({
      credential: {},
      didDocumentOverride: referenceDoc,
    })

    expect(result).toEqual({ verified: true })
    expect(checkStatus).toBeCalledTimes(0)
  })

  it('should throw if unknown status check was provided', async () => {
    expect.assertions(1)
    const agent = createAgent({
      plugins: [
        new CredentialStatusPlugin({
          NotCalled: jest.fn(),
        }),
      ],
    })

    await expect(
      agent.checkCredentialStatus({
        credential: referenceCredential,
        didDocumentOverride: referenceDoc,
      }),
    ).rejects.toThrow(
      `unknown_method: credentialStatus method ExoticStatusMethod2022 unknown. Validity can not be determined.`,
    )
  })
})
