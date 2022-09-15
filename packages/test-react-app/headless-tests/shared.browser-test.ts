import { getAgent } from '../src/veramo/setup.js'
// import {
//   createAgent,
//   IAgentOptions,
//   IDataStore,
//   IDataStoreORM,
//   IDIDManager,
//   IKeyManager,
//   IMessageHandler,
//   IResolver,
//   TAgent
// } from '@veramo/core'
// import { DIDResolverPlugin } from '@veramo/did-resolver'
// import { Resolver } from 'did-resolver'
// import { getResolver as ethrDidResolver } from "ethr-did-resolver"
// import { getResolver as webDidResolver } from 'web-did-resolver'
// import { MessageHandler } from '@veramo/message-handler'
// import { KeyManager } from '@veramo/key-manager'
// import { DIDManager } from '@veramo/did-manager'
// import { JwtMessageHandler } from '@veramo/did-jwt'
// import { CredentialIssuer, ICredentialIssuer, W3cMessageHandler } from '@veramo/credential-w3c'
// import {
//   CredentialIssuerLD,
//   ICredentialIssuerLD,
//   LdDefaultContexts,
//   VeramoEcdsaSecp256k1RecoverySignature2020,
//   VeramoEd25519Signature2018
// } from '@veramo/credential-ld'
// import { getDidKeyResolver, KeyDIDProvider } from '@veramo/did-provider-key'
// import { DIDComm, DIDCommMessageHandler, IDIDComm } from '@veramo/did-comm'
// import { ISelectiveDisclosure, SdrMessageHandler, SelectiveDisclosure } from '@veramo/selective-disclosure'
// import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
// import { Web3KeyManagementSystem } from '@veramo/kms-web3'
// import { EthrDIDProvider } from '@veramo/did-provider-ethr'
// import { WebDIDProvider } from '@veramo/did-provider-web'
// import { DataStoreJson, DIDStoreJson, KeyStoreJson, PrivateKeyStoreJson } from "@veramo/data-store-json";
// import { FakeDidProvider, FakeDidResolver } from "@veramo/test-utils";
import keyManager from '../../../__tests__/shared/keyManager.js'
// import didManager from '../../../__tests__/shared/didManager.js'
// import verifiableDataJWT from '../../../__tests__/shared/verifiableDataJWT.js'
// import verifiableDataLD from '../../../__tests__/shared/verifiableDataLD.js'
// import handleSdrMessage from '../../../__tests__/shared/handleSdrMessage.js'
// import resolveDid from '../../../__tests__/shared/resolveDid.js'
// import webDidFlow from '../../../__tests__/shared/webDidFlow.js'
// import saveClaims from '../../../__tests__/shared/saveClaims.js'
// import documentationExamples from '../../../__tests__/shared/documentationExamples.js'
// import didCommPacking from '../../../__tests__/shared/didCommPacking.js'
// import messageHandler from '../../../__tests__/shared/messageHandler.js'
// import utils from '../../../__tests__/shared/utils.js'
import { v1 as uuidv1 } from "uuid"
console.log("v1: ", uuidv1);
import { jest } from '@jest/globals'

jest.setTimeout(30000)

const INFURA_PROJECT_ID = '33aab9e0334c44b0a2e0c57c15302608'
const DB_SECRET_KEY = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa83'
const memoryJsonStore = {
  notifyUpdate: () => Promise.resolve()
}

// type InstalledPlugins = 
//   IResolver
//   & IKeyManager

describe('Browser integration tests', () => {
  let agent


  describe('shared tests', () => {
  describe('shared tests', () => {
    const testContext = { getAgent, setup: async () => true, tearDown: async () => true }
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
    // utils(testContext)
    // didCommPacking(testContext)
  })
    // const testContext = { getAgent, setup: async () => true, tearDown: async () => true }
  //   verifiableDataJWT(testContext)
  //   verifiableDataLD(testContext)
  //   handleSdrMessage(testContext)
  //   resolveDid(testContext)
  //   webDidFlow(testContext)
  //   saveClaims(testContext)
  //   documentationExamples(testContext)
  //   keyManager(testContext)
  //   didManager(testContext)
  //   messageHandler(testContext)
  //   utils(testContext)
  //   didCommPacking(testContext)
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
            'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
          ],
          id: 'did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
          verificationMethod: [
            {
              id: 'did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller',
              type: 'EcdsaSecp256k1RecoveryMethod2020',
              controller: 'did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
              blockchainAccountId: 'eip155:4:0x6AcF3bB1eF0eE84559De2bC2Bd9D91532062a730',
            },
          ],
          authentication: ['did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller'],
          assertionMethod: ['did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730#controller'],
        },
      }

      await page.waitForSelector('#result').then(async (element) => {
        let result = await (element ? element.evaluate((el) => el.textContent) : undefined)
        let parsedResult = JSON.parse(result || "")
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
        let result = await (element ? element.evaluate((el) => el.textContent) : undefined)
        let parsedResult = JSON.parse(result || "")
        await expect(parsedResult).toMatchObject(resultSnapshot)
      })
    })
  })
})
