import keyManager from '../../../__tests__/shared/keyManager'

jest.setTimeout(3 * 60 * 1000)

describe('Browser integration tests', () => {
  const getAgent = () => global.agent
  const testContext = { getAgent, setup: () => {}, tearDown: () => {} }
  // verifiableDataJWT(testContext)
  // verifiableDataLD(testContext)
  // handleSdrMessage(testContext)
  // resolveDid(testContext)
  // webDidFlow(testContext)
  // saveClaims(testContext)
  // documentationExamples(testContext)
  keyManager(testContext)
  // didManager(testContext)
  // messageHandler(testContext)
  // didCommPacking(testContext)

  it('should get didDoc data and match the snapshot', async () => {
    /**
     * this is a test case snapshot, provided by documentation on
     * https://veramo.io/docs/react_tutorials/react_setup_resolver,
     * to check if the app is returning same results as expected.
     */
    let resultSnapshot = {
      didDocumentMetadata: {},
      didResolutionMetadata: {
        contentType: 'application/did+ld+json',
      },
      didDocument: {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld',
        ],
        id: 'did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
        verificationMethod: [
          {
            id: 'did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller',
            type: 'EcdsaSecp256k1RecoveryMethod2020',
            controller: 'did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
            blockchainAccountId: '0x6AcF3bB1eF0eE84559De2bC2Bd9D91532062a730@eip155:4',
          },
        ],
        authentication: ['did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller'],
        assertionMethod: ['did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller'],
      },
    }

    await page.waitForSelector('#result').then(async (element) => {
      let result = await element.evaluate((el) => el.textContent)
      let parsedResult = JSON.parse(result)
      await expect(parsedResult).toMatchObject(resultSnapshot)
    })
  })

  it('should get didDoc data based on invalid URL', async () => {
    let resultSnapshot = {
      didDocumentMetadata: {},
      didResolutionMetadata: {
        error: 'invalidDid',
        message: 'Not a valid did:ethr: rinkeby:0x6acf3bb1ef0ee8459de2bc2bd9d91532062a730',
      },
      didDocument: null,
    }

    await page.waitForSelector('#invalid-result').then(async (element) => {
      let result = await element.evaluate((el) => el.textContent)
      let parsedResult = JSON.parse(result)
      await expect(parsedResult).toMatchObject(resultSnapshot)
    })
  })
})
