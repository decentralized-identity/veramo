// noinspection ES6PreferShortImport

import {
  IAgentOptions,
  IDIDManager,
  IIdentifier,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '../../packages/core/src'
import {IDIDComm} from '../../packages/did-comm/src'
// @ts-ignore
import express from 'express'
import {Server} from 'http'

type ConfiguredAgent = TAgent<IDIDManager & IKeyManager & IResolver & IDIDComm & IMessageHandler>

export async function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('did ethr controller signed interactions', () => {
    let agent: ConfiguredAgent

    let alice: IIdentifier
    let bob: IIdentifier

    let didCommEndpointServer: Server
    let listeningPort = Math.round(Math.random() * 32000 + 2048)

    beforeEach(async () => {
      await testContext.setup()
      agent = testContext.getAgent()

      alice = await agent.didManagerImport({
        controllerKeyId: 'alice-controller-key',
        did: 'did:ethr:ganache:0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
        provider: 'did:ethr:ganache',
        alias: 'alice-did-ethr',
        keys: [
          {
            privateKeyHex: '0000000000000000000000000000000000000000000000000000000000000001',
            kms: 'local',
            type: 'Secp256k1',
            kid: 'alice-controller-key',
          },
        ],
      })

      bob = await agent.didManagerImport({
        controllerKeyId: 'bob-controller-key',
        did: 'did:ethr:ganache:0x02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
        provider: 'did:ethr:ganache',
        alias: 'bob-did-ethr',
        keys: [
          {
            privateKeyHex: '0000000000000000000000000000000000000000000000000000000000000002',
            kms: 'local',
            type: 'Secp256k1',
            kid: 'bob-controller-key',
          },
        ],
      })
    })

    afterAll(async () => {
      await testContext.tearDown()
    })

    it('should add dummy service to alice did with bob sending the tx', async () => {
      const result = await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'localhost-useless-endpoint',
          type: 'DIDComm',
          serviceEndpoint: `http://localhost:${listeningPort}/foobar`,
          description: 'this endpoint will be removed',
        }, options: {
          metaIdentifierKeyId: bob.controllerKeyId
        }
      })

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution.didDocument).toEqual(expect.objectContaining({
        service: expect.arrayContaining([
          expect.objectContaining({
            serviceEndpoint: `http://localhost:${listeningPort}/foobar`
          })
        ])
      }))
    })

    it('should remove dummy service to alice did with bob sending the tx', async () => {
      await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'localhost-useless-endpoint',
          type: 'DIDComm',
          serviceEndpoint: `http://localhost:${listeningPort}/foobar`,
          description: 'this endpoint will be removed',
        }, options: {
          metaIdentifierKeyId: bob.controllerKeyId
        }
      })

      await agent.didManagerRemoveService({
        did: alice.did,
        id: "localhost-useless-endpoint",
        options: {
          metaIdentifierKeyId: bob.controllerKeyId
        }
      })

      const resolution = await agent.resolveDid({ didUrl: alice.did })
      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toBeFalsy()
    })

    it('should add verification key to alice did with bob sending the tx', async () => {
      const keyToAdd = await agent.keyManagerCreate({type: 'Secp256k1', kms: 'local'})

      await agent.didManagerAddKey({
        did: alice.did,
        key: keyToAdd,
        options: {
          metaIdentifierKeyId: bob.controllerKeyId
        }
      })

      // Give ganache some time to emit the event from the contract
      await sleep(1000)

      const didAfterchange = await agent.resolveDid({ didUrl: alice.did })
      expect(didAfterchange).toBeTruthy()
      expect(didAfterchange.didDocument).toEqual(expect.objectContaining({
        verificationMethod: expect.arrayContaining([
          expect.objectContaining({
            publicKeyHex: keyToAdd.publicKeyHex
          })
        ])
      }))
    })
  })
}
