import {
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  TAgent,
  TKeyType,
} from '../../packages/core/src'
import { ICredentialIssuerEIP712 } from '../../packages/credential-eip712/src'
import { decodeJWT } from 'did-jwt'

type ConfiguredAgent = TAgent<IDIDManager & ICredentialIssuerEIP712 & IDataStore & IDataStoreORM>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('creating Verifiable Credentials in EIP712', () => {
    let agent: ConfiguredAgent
    let identifier: IIdentifier

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
    })
    afterAll(testContext.tearDown)

    it('should create identifier', async () => {
      identifier = await agent.didManagerCreate({ kms: 'local' })
      expect(identifier).toHaveProperty('did')
      expect(identifier?.keys[0]?.meta?.algorithms).toContain('eth_signTypedData')
    })

    it('should create verifiable credential with EthereumEip712Signature2021 proof type', async () => {
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
          type: ['VerifiableCredential', 'Custom'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          }
        },
        proofFormat: 'EthereumEip712Signature2021',
      })

      expect(verifiableCredential).toHaveProperty('proof.proofValue')
      expect(verifiableCredential['@context']).toEqual([
        'https://www.w3.org/2018/credentials/v1',
        'https://example.com/1/2/3',
      ])
      expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Custom'])

      const hash = await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
      expect(typeof hash).toEqual('string')

      const verifiableCredential2 = await agent.dataStoreGetVerifiableCredential({ hash })
      expect(verifiableCredential).toEqual(verifiableCredential2)
    })

  })
}
