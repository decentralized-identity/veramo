import {
  CredentialPayload, IAgentOptions,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  TAgent
} from '@veramo/core/src'
import { CredentialStatusPlugin } from '../../packages/credential-status/src/credential-status'
import { ICredentialIssuer } from '../../packages/credential-w3c/src'

type ConfiguredAgent = TAgent<IDIDManager & ICredentialIssuer & IDataStore & IDataStoreORM>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('checking Verifiable Credentials status (revocation)', () => {
    let agent: ConfiguredAgent
    let identifier: IIdentifier
    let statusChecked: boolean
    let rawCredential: CredentialPayload

    beforeAll(async () => {
      const expectedResult = {}
      statusChecked = false
      const checkStatus = jest.fn(async (credential) => {
        statusChecked = true
        if (credential.credentialStatus.id === "revoked") throw 'Revoked credential'
        return expectedResult
      })
      await testContext.setup({
        plugins: [
          new CredentialStatusPlugin({
            ExoticStatusMethod2022: checkStatus,
          }),
        ],
      })
      agent = testContext.getAgent()
      identifier = await agent.didManagerCreate({ kms: 'local' })
      rawCredential = {
        issuer: { id: identifier.did },
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
        type: ['VerifiableCredential', 'Profile'],
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          name: 'Martin, the great',
        },
        credentialStatus: {
          type: 'ExoticStatusMethod2022',
          id: 'some-exotic-id',
        }
      }
      return true
    })
    afterAll(testContext.tearDown)

    it('should check credentialStatus for JWT credential', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: rawCredential,
        proofFormat: 'jwt',
      })
      expect(verifiableCredential).toHaveProperty('proof.jwt')

      const verified = await agent.verifyCredential({ credential: verifiableCredential })
      expect(statusChecked).toBeTruthy()
      expect(verified).toBeTruthy()
    })

    it('should fail for a revoked credentialStatus for JWT credential', async () => {
      const rawRevoked = {
        issuer: { id: identifier.did },
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
        type: ['VerifiableCredential', 'Profile'],
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          name: 'Martin, the great',
        },
        credentialStatus: {
          type: 'ExoticStatusMethod2022',
          id: 'revoked',
        }
      }

      const verifiableCredential = await agent.createVerifiableCredential({
        credential: rawRevoked,
        proofFormat: 'jwt',
      })
      expect(verifiableCredential).toHaveProperty('proof.jwt')

      const verified = await agent.verifyCredential({ credential: verifiableCredential })
      expect(statusChecked).toBeTruthy()
      expect(verified).toBeFalsy()
    })

    it('should check credentialStatus for JSON-LD credential', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: rawCredential,
        proofFormat: 'lds',
      })
      expect(verifiableCredential).toHaveProperty('proof.jws')

      const verified = await agent.verifyCredential({ credential: verifiableCredential })
      expect(statusChecked).toBeTruthy()
      expect(verified).toBeTruthy()
    })

    it('should check credentialStatus for EIP712 credential', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: rawCredential,
        proofFormat: 'EthereumEip712Signature2021',
      })
      expect(verifiableCredential).toHaveProperty('proof.proofValue')

      const verified = await agent.verifyCredential({ credential: verifiableCredential })
      expect(statusChecked).toBeTruthy()
      expect(verified).toBeTruthy()
    })
  })
}
