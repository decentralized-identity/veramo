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
} from '../../packages/core-types/src'
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
      identifier = await agent.didManagerCreate({ kms: 'local' })
    })
    afterAll(testContext.tearDown)

    it('should create identifier', async () => {
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

    it('should verify credential from the wild; vess interop', async () => {
      const credential = {
        id: 'kjzl6cwe1jw14bn99lu4spvfdvjyxtm4cg2ys5jmd0gqjaov5fqifwlf0af3hbt-did:pkh:eip155:1:0xde695cbb6ec0cf3f4c9564070baeb032552c5111',
        type: ['VerifiableCredential', 'EventAttendanceCredential'],
        proof: {
          type: 'EthereumEip712Signature2021',
          eip712: {
            types: {
              Issuer: [
                {
                  name: 'id',
                  type: 'string',
                },
                {
                  name: 'ethereumAddress',
                  type: 'string',
                },
              ],
              EIP712Domain: [
                {
                  name: 'name',
                  type: 'string',
                },
                {
                  name: 'version',
                  type: 'string',
                },
                {
                  name: 'chainId',
                  type: 'uint256',
                },
                {
                  name: 'verifyingContract',
                  type: 'address',
                },
              ],
              CredentialSchema: [
                {
                  name: 'id',
                  type: 'string',
                },
                {
                  name: 'type',
                  type: 'string',
                },
              ],
              CredentialSubject: [
                {
                  name: 'id',
                  type: 'string',
                },
                {
                  name: 'eventName',
                  type: 'string',
                },
                {
                  name: 'eventIcon',
                  type: 'string',
                },
                {
                  name: 'eventId',
                  type: 'string',
                },
              ],
              VerifiableCredential: [
                {
                  name: '@context',
                  type: 'string[]',
                },
                {
                  name: 'type',
                  type: 'string[]',
                },
                {
                  name: 'id',
                  type: 'string',
                },
                {
                  name: 'issuer',
                  type: 'Issuer',
                },
                {
                  name: 'credentialSubject',
                  type: 'CredentialSubject',
                },
                {
                  name: 'credentialSchema',
                  type: 'CredentialSchema',
                },
                {
                  name: 'issuanceDate',
                  type: 'string',
                },
                {
                  name: 'expirationDate',
                  type: 'string',
                },
              ],
            },
            domain: {
              name: 'Verifiable Event Attendance',
              chainId: 1,
              version: '1',
              verifyingContract: '0x00000000000000000000000000000000000000000000',
            },
            primaryType: 'VerifiableCredential',
          },
          created: '2023-02-17T02:55:22.601Z',
          proofValue:
            '0xc8cd38c1ba36b2209a334de8f412a8a7f8bbc20639d981c41806444e7cc2e1396d42264957771823c5f7b3f846d141333486e0c78f88ed2d657cad3f9325a64f1c',
          proofPurpose: 'assertionMethod',
          ethereumAddress: '0xf6dcc520f11ad600da7E01da44e0e70D094ea246',
          verificationMethod: 'did:pkh:eip155:1:0xf6dcc520f11ad600da7e01da44e0e70d094ea246#ethereumAddress',
        },
        issuer: {
          id: 'did:pkh:eip155:1:0xf6dcc520f11ad600da7e01da44e0e70d094ea246',
          ethereumAddress: '0xf6dcc520f11ad600da7E01da44e0e70D094ea246',
        },
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://raw.githubusercontent.com/w3c-ccg/ethereum-eip712-signature-2021-spec/main/contexts/v1/index.json',
        ],
        issuanceDate: '2023-02-17T02:55:22.549Z',
        expirationDate: '2123-02-17T02:55:22.549Z',
        credentialSchema: {
          id: 'https://app.vess.id/schemas/EventAttendance.json',
          type: 'Eip712SchemaValidator2021',
        },
        credentialSubject: {
          id: 'did:pkh:eip155:1:0xde695cbb6ec0cf3f4c9564070baeb032552c5111',
          eventId: 'kjzl6cwe1jw14bn99lu4spvfdvjyxtm4cg2ys5jmd0gqjaov5fqifwlf0af3hbt',
          eventIcon:
            'https://bafybeibgqa2kti2c53vq7tajbidclxbjytsgucqjdffmc2yniepejiqs7i.ipfs.w3s.link/nec_preevent.png',
          eventName: 'NEC Web3 Community Pre-Event',
        },
      }

      const result = await agent.verifyCredential({ credential })
      expect(result.verified).toBe(true)
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
