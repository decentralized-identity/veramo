// noinspection ES6PreferShortImport

import {
  IAgentOptions,
  IDIDManager,
  IResolver,
  MinimalImportableKey,
  TAgent,
} from '../../packages/core-types/src'
import { getChainId, mapIdentifierKeysToDoc, resolveDidOrThrow } from '../../packages/utils/src'

type ConfiguredAgent = TAgent<IResolver & IDIDManager>

export default (testContext: {
  getAgent: (options?: IAgentOptions) => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('utilities', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      return true
    })
    afterAll(testContext.tearDown)

    it('should get chainId for ethr did', async () => {
      const didUrl = 'did:ethr:ganache:0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
      const didDoc = await resolveDidOrThrow(didUrl, { agent })
      if (didDoc.verificationMethod) {
        const chainId = getChainId(didDoc.verificationMethod[0])
        expect(chainId).toEqual(1337)
      }
    })

    it('should map identifier keys to did doc', async () => {
      const account = `0xb09b66026ba5909a7cfe99b76875431d2b8d5190`
      const did = `did:ethr:ganache:${account}`
      const controllerKeyId = `metamask-${account}`
      await agent.didManagerImport({
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
              provider: 'metamask',
              algorithms: ['eth_signMessage', 'eth_signTypedData'],
            },
          } as MinimalImportableKey,
        ],
      })

      const identifier = await agent.didManagerGet({ did })
      const extendedKeys = await mapIdentifierKeysToDoc(identifier, 'verificationMethod', { agent })
      expect(extendedKeys[0].meta.verificationMethod?.blockchainAccountId?.toLocaleLowerCase()).toEqual(
        `eip155:1337:${account}`,
      )
    })

    it('should verify JWT credential signed by did:peer (multibase + multicodec) (github #1248)', async () => {
      // did:peer uses publicKeyMultibase
      const issuer = await agent.didManagerCreate({
        provider: 'did:peer',
        options: {
          num_algo: 0,
        },
      })
      const payload = {
        issuer: issuer.did,
        credentialSubject: {
          nothing: 'else matters',
        },
      }
      const credential = await agent.createVerifiableCredential({
        credential: payload,
        proofFormat: 'jwt',
      })

      const verifyResult = await agent.verifyCredential({ credential })
      expect(verifyResult.verified).toBeTruthy()
    })
  })
}
