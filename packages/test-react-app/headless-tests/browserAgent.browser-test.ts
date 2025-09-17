import { getAgent, setup } from '../src/veramo/setup.js'

import keyManager from '../../../__tests__/shared/keyManager.js'
import didManager from '../../../__tests__/shared/didManager.js'
import verifiableDataJWT from '../../../__tests__/shared/verifiableDataJWT.js'
import verifiableDataLD from '../../../__tests__/shared/verifiableDataLD.js'
import handleSdrMessage from '../../../__tests__/shared/handleSdrMessage.js'
import resolveDid from '../../../__tests__/shared/resolveDid.js'
import webDidFlow from '../../../__tests__/shared/webDidFlow.js'
import saveClaims from '../../../__tests__/shared/saveClaims.js'
import documentationExamples from '../../../__tests__/shared/documentationExamples.js'
import didCommPacking from '../../../__tests__/shared/didCommPacking.js'
import messageHandler from '../../../__tests__/shared/messageHandler.js'
import utils from '../../../__tests__/shared/utils.js'

import { jest } from '@jest/globals'

const JEST_TIMEOUT = 3 * 60 * 1000
jest.setTimeout(JEST_TIMEOUT)

describe('Browser integration tests', () => {
  describe('shared tests', () => {
    const testContext = { getAgent, setup, tearDown: async () => true }
    verifiableDataJWT(testContext)
    verifiableDataLD(testContext)
    handleSdrMessage(testContext)
    resolveDid(testContext)
    webDidFlow(testContext)
    saveClaims(testContext)
    documentationExamples(testContext)
    keyManager(testContext)
    didManager(testContext)
    messageHandler(testContext)
    utils(testContext)
    didCommPacking(testContext)
  })

  describe('should initialize in the react app', () => {
    beforeAll(async () => {
      // Navigate to the React app using Playwright
      await page.goto('http://localhost:3000')
    })

    it('should get didDoc data and match the snapshot', async () => {
      /**
       * this is a test case snapshot, provided by documentation on
       * https://veramo.io/docs/react_tutorials/react_setup_resolver,
       * to check if the app is returning the same results as expected.
       */
      let resultSnapshot = {
        didDocumentMetadata: {},
        didResolutionMetadata: {
          contentType: 'application/did+ld+json',
        },
        didDocument: {
          '@context': expect.anything(),
          id: 'did:ethr:ganache:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
          verificationMethod: [
            {
              id: 'did:ethr:ganache:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller',
              type: 'EcdsaSecp256k1RecoveryMethod2020',
              controller: 'did:ethr:ganache:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
              blockchainAccountId: 'eip155:1337:0x6AcF3bB1eF0eE84559De2bC2Bd9D91532062a730',
            },
          ],
          authentication: ['did:ethr:ganache:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller'],
          assertionMethod: ['did:ethr:ganache:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller'],
        },
      }

      // Wait for the result element using Playwright API
      const resultElement = await page.waitForSelector('#result', { timeout: JEST_TIMEOUT })

      // Get the text content using Playwright's evaluate method
      const result = await resultElement.evaluate((el) => el.textContent)
      const parsedResult = JSON.parse(result!)

      expect(parsedResult).toMatchObject(resultSnapshot)
    })

    it('should get didDoc data based on invalid URL', async () => {
      let resultSnapshot = {
        didDocumentMetadata: {},
        didResolutionMetadata: {
          error: 'invalidDid',
          message: 'Not a valid did:ethr: ganache:0x16acf3bb1ef0ee8459de2bc2bd9d91532062a7',
        },
        didDocument: null,
      }

      // Wait for the invalid result element using Playwright API
      const invalidResultElement = await page.waitForSelector('#invalid-result', { timeout: JEST_TIMEOUT })

      // Get the text content using Playwright's evaluate method
      const result = await invalidResultElement.evaluate((el) => el.textContent)
      const parsedResult = JSON.parse(result!)

      expect(parsedResult).toMatchObject(resultSnapshot)
    })
  })
})
