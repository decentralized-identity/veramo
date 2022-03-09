import { agent } from '../src/veramo/setup'

import keyManager from '../../../__tests__/shared/keyManager'
// import didManager from '../../../__tests__/shared/didManager'
import verifiableDataJWT from '../../../__tests__/shared/verifiableDataJWT'
import verifiableDataLD from '../../../__tests__/shared/verifiableDataLD'
import handleSdrMessage from '../../../__tests__/shared/handleSdrMessage'
// import resolveDid from '../../../__tests__/shared/resolveDid'
import webDidFlow from '../../../__tests__/shared/webDidFlow'
import saveClaims from '../../../__tests__/shared/saveClaims'
import documentationExamples from '../../../__tests__/shared/documentationExamples'
// import didCommPacking from '../../../__tests__/shared/didCommPacking'
import messageHandler from '../../../__tests__/shared/messageHandler'

jest.setTimeout(3 * 60 * 1000)

describe('Browser integration tests', () => {
  describe('shared tests', () => {
    const testContext = { getAgent: () => agent, setup: () => {}, tearDown: () => {} }
    verifiableDataJWT(testContext)
    // verifiableDataLD(testContext)
    handleSdrMessage(testContext)
    // resolveDid(testContext)
    webDidFlow(testContext)
    saveClaims(testContext)
    documentationExamples(testContext)
    keyManager(testContext)
    // didManager(testContext)
    messageHandler(testContext)
    // didCommPacking(testContext)
  })

  describe('should intialize in the react app', () => {
    beforeAll(async () => {
      await page.goto('http://localhost:3000')
    })
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
})
