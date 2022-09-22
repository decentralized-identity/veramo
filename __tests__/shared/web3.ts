// noinspection ES6PreferShortImport

import {
  IAgentOptions,
  IDIDManager,
  IIdentifier,
  IKeyManager,
  IResolver,
  MinimalImportableKey,
  TAgent,
  VerifiableCredential,
} from '../../packages/core/src'

type ConfiguredAgent = TAgent<IResolver & IDIDManager & IKeyManager>

export default (testContext: {
  getAgent: (options?: IAgentOptions) => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('web3', () => {
    let agent: ConfiguredAgent
    let identifier: IIdentifier
    let verifiableCredential: VerifiableCredential

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      return true
    })
    afterAll(testContext.tearDown)

    it('should import ethers did', async () => {
      const account = `0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1`
      const did = `did:ethr:${account}`
      const controllerKeyId = `ethers-${account}`
      identifier = await agent.didManagerImport({
        did,
        provider: 'did:ethr',
        controllerKeyId,
        keys: [
          {
            kid: controllerKeyId,
            type: 'Secp256k1',
            kms: 'web3',
            privateKeyHex: '',
            publicKeyHex: '',
            meta: {
              account,
              provider: 'ethers',
              algorithms: ['eth_signMessage', 'eth_signTypedData'],
            },
          } as MinimalImportableKey,
        ],
      })
    })

    it('should sign a message', async () => {
      if (identifier.controllerKeyId) {
        const signature = await agent.keyManagerSign({
          data: 'Hello world',
          keyRef: identifier.controllerKeyId,
          algorithm: 'eth_signMessage',
        })
        expect(signature).toBeTruthy()
      }
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
  })
}
