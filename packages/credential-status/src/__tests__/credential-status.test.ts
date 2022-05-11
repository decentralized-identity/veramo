import { createAgent } from '../../../core/src'
import { CredentialStatusPlugin } from '../credential-status'
import { DIDDocument } from 'did-resolver'

describe('@veramo/credential-status', () => {
  const referenceCredential = {
    credentialStatus: {
      type: 'ExoticStatusMethod2022',
      id: 'some-exotic-id',
    },
  }
  const referenceDoc = {} as DIDDocument

  it('should check the credential status', async () => {
    expect.assertions(3);
    const expectedResult = {}
    const checkStatus = jest.fn(async () => expectedResult)
    const agent = createAgent({
      plugins: [
        new CredentialStatusPlugin({
          ExoticStatusMethod2022: checkStatus,
        }),
      ],
    })

    const result = await agent.checkCredentialStatus({
      credential: referenceCredential,
      didDoc: referenceDoc,
    })

    expect(result).toStrictEqual(expectedResult)
    expect(checkStatus).toBeCalledTimes(1)
    expect(checkStatus).toBeCalledWith(referenceCredential, referenceDoc)
  })

  it('should not perform status check if no `credentialStatus` present', async () => {
    expect.assertions(2);
    const checkStatus = jest.fn()
    const agent = createAgent({
      plugins: [
        new CredentialStatusPlugin({
          ExoticStatusMethod2022: checkStatus,
        }),
      ],
    })

    const result = await agent.checkCredentialStatus({
      credential: {},
      didDoc: referenceDoc,
    })

    expect(result).toEqual({
      message: 'credentialStatus property was not set on the original credential',
      revoked: false,
    })
    expect(checkStatus).toBeCalledTimes(0)
  })

  it('should throw if unknown status check was provided', async () => {
    expect.assertions(1);
    const agent = createAgent({
      plugins: [new CredentialStatusPlugin()],
    })

    await expect(() =>
      agent.checkCredentialStatus({
        credential: referenceCredential,
        didDoc: referenceDoc,
      }),
    ).rejects.toThrow(
      new Error(
        `unknown_method: credentialStatus method ExoticStatusMethod2022 unknown. Validity can not be determined.`,
      ),
    )
  })
})
