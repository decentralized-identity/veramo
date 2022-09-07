// noinspection ES6PreferShortImport

import {
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IIdentifier,
  TAgent,
  VerifiableCredential,
  VerifiablePresentation,
} from '../../packages/core/src'
import { ICredentialIssuerEIP712 } from '../../packages/credential-eip712/src'

type ConfiguredAgent = TAgent<
  IDIDManager & ICredentialPlugin & ICredentialIssuerEIP712 & IDataStore & IDataStoreORM
>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('creating Verifiable Credentials in EIP712', () => {
    let agent: ConfiguredAgent
    let identifier: IIdentifier
    let verifiableCredential: VerifiableCredential
    let verifiablePresentation: VerifiablePresentation

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
      verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: identifier.did },
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
          type: ['VerifiableCredential', 'Custom'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: 'did:web:example.com',
            you: 'Rock',
          },
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

    it('should verify credential with EthereumEip712Signature2021 proof type', async () => {
      const result = await agent.verifyCredentialEIP712({
        credential: verifiableCredential,
      })

      expect(result).toEqual(true)
    })

    it('should create verifiable presentation with EthereumEip712Signature2021 proof type', async () => {
      const jwt_vc =
        'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRGlzY29yZFJvbGUiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiZGlzY29yZFVzZXJJZCI6IjQxMjgxNDQ4NjMzMjg5OTMzOCIsImRpc2NvcmRVc2VyTmFtZSI6IkFnbmVzIHwgQ29sbGFiLkxhbmQjMjYyMyIsImRpc2NvcmRVc2VyQXZhdGFyIjoiaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vYXZhdGFycy80MTI4MTQ0ODYzMzI4OTkzMzgvMTRmMDIwZWY3NTZhMzcyODQyODFlYmJiYThlYTg0YTkud2VicCIsImRpc2NvcmRHdWlsZElkIjoiOTQzMjU2MzA4MTcyMzQ1NDA1IiwiZGlzY29yZEd1aWxkTmFtZSI6IkNvbGxhYkxhbmQgVkMgR2F0ZWQgU2VydmVyIiwiZGlzY29yZEd1aWxkQXZhdGFyIjoiaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vaWNvbnMvOTQzMjU2MzA4MTcyMzQ1NDA1L2ZlMmVhMzBkZWIyZTMzMjQyNjVhZGY0Y2U3N2NjZWU2LndlYnAiLCJkaXNjb3JkUm9sZUlkIjoiOTQzMjU4OTY3MDUwNzAyODY5IiwiZGlzY29yZFJvbGVOYW1lIjoiQ29sbGFiTGFuZCBQYXRyb24iLCJkZXNjcmlwdGlvbiI6IkFnbmVzIHwgQ29sbGFiLkxhbmQjMjYyMyBoYXMgcm9sZSBDb2xsYWJMYW5kIFBhdHJvbiBpbiBEaXNjb3JkIGNvbW11bml0eSBDb2xsYWJMYW5kIFZDIEdhdGVkIFNlcnZlciJ9fSwic3ViIjoiNDEyODE0NDg2MzMyODk5MzM4IiwianRpIjoiMDIwMDQ0ZWQtMzkyYi00YjIwLThmY2MtYzgxYWNkNjQzYjc4IiwibmJmIjoxNjQ3MDE5MDgzLCJpc3MiOiJkaWQ6ZXRocjpyaW5rZWJ5OjB4MDJlM2RhMGFjN2VkZmJkNzViYjU1M2Y0YzYxODAxODVjNjQ2ODVkYzhjOWI1ZDBiOTBiZTlmMzdhNzE2MzkzZjNhIn0.N0j805D0Wiwv3hnd8S5sHdRpketHHCmth7G5bVuU4QFX03iwH1dclFD01bbmI3TXnfcLANpQhCINSJDAd9My5g'

      verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: identifier.did,
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
          type: ['VerifiablePresentation', 'Custom'],
          issuanceDate: new Date().toISOString(),
          verifiableCredential: [jwt_vc],
        },
        proofFormat: 'EthereumEip712Signature2021',
      })

      expect(verifiablePresentation).toHaveProperty('proof.proofValue')
      expect(verifiablePresentation['@context']).toEqual([
        'https://www.w3.org/2018/credentials/v1',
        'https://example.com/1/2/3',
      ])
      expect(verifiablePresentation['type']).toEqual(['VerifiablePresentation', 'Custom'])

      const hash = await agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation })
      expect(typeof hash).toEqual('string')

      const vp2 = await agent.dataStoreGetVerifiablePresentation({ hash })
      expect(verifiablePresentation).toEqual(vp2)
    })

    it.todo('should throw error when trying to sign presentation with unsuported attributes')

    it('should verify presentation with EthereumEip712Signature2021 proof type', async () => {
      const result = await agent.verifyPresentationEIP712({
        presentation: verifiablePresentation,
      })

      expect(result).toEqual(true)
    })
  })
}
