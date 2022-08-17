import { createAgent, DIDDocument, ICredentialStatusManager, VerifiableCredential } from '@veramo/core'
import { resolve } from 'path'
import { StatusListStorage, CredentialStatusList2021Plugin } from '../credential-status-list-2021'


describe('@veramo/credential-status-simple', () => {
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
    set: (id: string, value: string): Promise<void> => new Promise(function (resolve) { ids.set(id, value); resolve(); }),
    get: (id: string): Promise<string | undefined> => new Promise(function (resolve) { resolve(ids.get(id)); }),
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
      expect.assertions(1)

      const result = await agent.credentialStatusGenerate({
        type: 'SimpleStatus',
        vc: referenceCredential,
        endpoint: "https://example.com"
      })

      expect(result).toStrictEqual({
        type: "SimpleStatus",
        id: expect.stringContaining('https://')
      });

      referenceCredential.credentialStatus = result
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
          verified: false
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

      const wrongMethod = "NotTheSimpleStatus"
      referenceCredential.credentialStatus = {
        type: wrongMethod,
        id: "any-id"
      }

      expect(agent.credentialStatusUpdate({
        vc: referenceCredential,
        options: {
          revoke: true
        }
      })).rejects.toThrowError(`invalid_argument: unrecognized method '${wrongMethod}'. Expected 'SimpleStatus'.`)
    })

    it('Should fail updating VC without `credentialStatus` entry', async () => {
      expect.assertions(1)

      delete referenceCredential.credentialStatus

      expect(agent.credentialStatusUpdate({
        vc: referenceCredential,
        options: {
          revoke: true
        }
      })).rejects.toThrowError("invalid_argument: `credentialStatus.id` must be defined in the credential")
    })

    it('Should fail if `credentialStatus` references and invalid ID', async () => {
      expect.assertions(1)

      referenceCredential.credentialStatus = {
        type: "SimpleStatus",
        id: "https://example.com/any-id"
      }

      expect(agent.credentialStatusUpdate({
        vc: referenceCredential,
        options: {
          revoke: true
        }
      })).rejects.toThrowError(`invalid_argument: invalid 'credentialStatus.id' for method 'SimpleStatus'`)
    })
  })
})

