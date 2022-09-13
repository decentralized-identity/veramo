import { createAgent, DIDDocument, ICredentialStatusManager, VerifiableCredential } from '@veramo/core'
import { CredentialStatusList2021Plugin, StatusListStorage } from '../credential-status-list-2021'


describe('@veramo/credential-status-list-2021', () => {
  const referenceDoc: DIDDocument = { id: 'did:example:1234' }
  const referenceCredential: VerifiableCredential = {
    '@context': [],
    issuanceDate: new Date().toISOString(),
    proof: {},
    issuer: referenceDoc.id,
    credentialSubject: {}
  }

  const ids = new Map<string, string>()
  const memoryStorage: StatusListStorage = {
    set: async (id: string, value: string): Promise<void> => new Promise(function (resolve) { ids.set(id, value); resolve(); }),
    get: async (id: string): Promise<string | undefined> => new Promise(function (resolve) { resolve(ids.get(id)); }),
    keys: () => Array.from(ids.keys())
  }

  // We'll use a single agent for all the tests in this test case
  // to keep the state and dependency between each test.
  const agent = createAgent<ICredentialStatusManager>({
    plugins: [
      new CredentialStatusList2021Plugin(memoryStorage),
    ]
  })

  describe('Full succesfull credential revocation flow', () => {
    it('Should generate a `credentialStatus` field for a VC', async () => {
      expect.assertions(4)

      const statusUrl = "https://example.com"
      const args = {
        type: 'StatusList2021Entry',
        vc: referenceCredential,
        statusListCredentialUrl: statusUrl
      }

      const result = await agent.credentialStatusGenerate(args)
      expect(result).toStrictEqual({
        type: "StatusList2021Entry",
        id: expect.stringContaining(statusUrl),
        statusListCredential: statusUrl,
        statusPurpose: 'revocation',
        statusListIndex: 0
      });

      // For next test
      referenceCredential.credentialStatus = result

      // Should bring index incremented
      const result2 = await agent.credentialStatusGenerate(args)
      expect(result2.statusListIndex).toEqual(1);

      // Should bring index incremented
      const result3 = await agent.credentialStatusGenerate(args)
      expect(result3.statusListIndex).toEqual(2);

      // Should bring index passed as argument
      const result4 = await agent.credentialStatusGenerate({ ...args, statusListIndex: 7 })
      expect(result4.statusListIndex).toEqual(7);
    })

    it('Check if the VC is not revoked before any status update', async () => {
      expect.assertions(1)

      const result1 = await agent.credentialStatusRead({
        credentialStatus: referenceCredential.credentialStatus
      })

      expect(result1).toStrictEqual({
        verified: true
      })
    })

    it('Succesfully revoke the VC', async () => {
      expect.assertions(1)

      const result = await agent.credentialStatusUpdate({
        vc: referenceCredential,
        options: {
          value: false
        }
      })

      expect(result).toBeUndefined()
    })

    it('Confirm VC revocation by verifying its status', async () => {
      expect.assertions(1)

      const result1 = await agent.credentialStatusRead({
        credentialStatus: referenceCredential.credentialStatus
      })

      expect(result1).toStrictEqual({
        verified: false
      })
    })
  })

  describe('Exception flows', () => {
    it('Should fail updating VC status using another status method', async () => {
      expect.assertions(1)

      const wrongMethod = "NotTheStatusList2021Entry"
      referenceCredential.credentialStatus = {
        type: wrongMethod,
        id: "any-id"
      }

      expect(agent.credentialStatusUpdate({
        vc: referenceCredential,
        options: {
          value: true
        }
      })).rejects.toThrowError(`invalid_argument: unrecognized method '${wrongMethod}'. Expected 'StatusList2021Entry'.`)
    })

    it('Should fail updating VC without `credentialStatus` entry', async () => {
      expect.assertions(1)

      delete referenceCredential.credentialStatus

      expect(agent.credentialStatusUpdate({
        vc: referenceCredential,
        options: {
          value: true
        }
      })).rejects.toThrowError("invalid_argument: `credentialStatus.id` must be defined in the credential")
    })

    it('Should fail if `credentialStatus` references and invalid ID', async () => {
      expect.assertions(2)

      const statusListCredentialUrl = "https://example.com/credentials/status/3"
      referenceCredential.credentialStatus = {
        id: `${statusListCredentialUrl}#94567`,
        type: "StatusList2021Entry",
        statusPurpose: "revocation",
        statusListIndex: "94567",
        statusListCredential: statusListCredentialUrl
      }

      expect(await memoryStorage.get(statusListCredentialUrl)).toBeUndefined()

      expect(agent.credentialStatusUpdate({
        vc: referenceCredential,
        options: {
          value: true
        }
      })).rejects.toThrowError(`invalid_state: the status list "${statusListCredentialUrl}" was not found`)
    })
  })
})

