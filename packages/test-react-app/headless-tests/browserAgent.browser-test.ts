import { getAgent, setup } from '../src/veramo/setup'

import keyManager from '../../../__tests__/shared/keyManager'
import didManager from '../../../__tests__/shared/didManager'
import verifiableDataJWT from '../../../__tests__/shared/verifiableDataJWT'
import verifiableDataLD from '../../../__tests__/shared/verifiableDataLD'
import handleSdrMessage from '../../../__tests__/shared/handleSdrMessage'
import resolveDid from '../../../__tests__/shared/resolveDid'
import webDidFlow from '../../../__tests__/shared/webDidFlow'
import saveClaims from '../../../__tests__/shared/saveClaims'
import documentationExamples from '../../../__tests__/shared/documentationExamples'
import didCommPacking from '../../../__tests__/shared/didCommPacking'
import messageHandler from '../../../__tests__/shared/messageHandler'
import utils from '../../../__tests__/shared/utils'

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

  // // https://github.com/smooth-code/jest-puppeteer/issues/503 prevents us from using puppeteer currently
  describe('should initialize in the react app', () => {
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
          '@context': expect.anything(),
          id: 'did:ethr:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
          verificationMethod: [
            {
              id: 'did:ethr:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller',
              type: 'EcdsaSecp256k1RecoveryMethod2020',
              controller: 'did:ethr:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
              blockchainAccountId: 'eip155:1:0x6AcF3bB1eF0eE84559De2bC2Bd9D91532062a730',
            },
          ],
          authentication: ['did:ethr:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller'],
          assertionMethod: ['did:ethr:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller'],
        },
      }

      await page.waitForSelector('#result', { timeout: JEST_TIMEOUT }).then(async (element) => {
        let result = await element!.evaluate((el) => el.textContent)
        let parsedResult = JSON.parse(result!)
        await expect(parsedResult).toMatchObject(resultSnapshot)
      })
    })

    it('should get didDoc data based on invalid URL', async () => {
      let resultSnapshot = {
        didDocumentMetadata: {},
        didResolutionMetadata: {
          error: 'invalidDid',
          message: 'Not a valid did:ethr: goerli:0x16acf3bb1ef0ee8459de2bc2bd9d91532062a7',
        },
        didDocument: null,
      }

      await page.waitForSelector('#invalid-result', { timeout: JEST_TIMEOUT }).then(async (element) => {
        let result = await element!.evaluate((el) => el.textContent)
        let parsedResult = JSON.parse(result!)
        await expect(parsedResult).toMatchObject(resultSnapshot)
      })
    })
  })
})
