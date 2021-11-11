import {
  TAgent,
  IDIDManager,
  IKeyManager,
  IIdentifier,
  IResolver,
  IKey,
  IEventListener,
  IAgentOptions,
  IMessageHandler,
} from '../../packages/core/src'
import { IDIDComm } from '../../packages/did-comm/src'
import { MessagingRouter, RequestWithAgentRouter } from '../../packages/remote-server/src'
import * as u8a from 'uint8arrays'
import express from 'express'
import { Server } from 'http'

type ConfiguredAgent = TAgent<IDIDManager & IKeyManager & IResolver & IDIDComm & IMessageHandler>

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
  onEvent: jest.fn(),
}

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('DIDComm using did:ethr:ganache flow', () => {
    let agent: ConfiguredAgent

    let alice: IIdentifier
    let bob: IIdentifier

    let didCommEndpointServer: Server
    let listeningPort = Math.round(Math.random() * 32000 + 2048)

    beforeAll(async () => {
      await testContext.setup({ plugins: [DIDCommEventSniffer] })
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

      const requestWithAgent = RequestWithAgentRouter({ agent })

      await new Promise((resolve) => {
        //setup a server to receive HTTP messages and forward them to this agent to be processed as DIDComm messages
        const app = express()
        // app.use(requestWithAgent)
        app.use(
          '/messaging',
          requestWithAgent,
          MessagingRouter({
            metaData: { type: 'DIDComm', value: 'integration test' },
          }),
        )
        didCommEndpointServer = app.listen(listeningPort, () => {
          resolve(true)
        })
      })
    })

    afterAll(async () => {
      await new Promise((resolve, reject) => didCommEndpointServer?.close(resolve))
      testContext.tearDown()
    })

    it('should add service to identifier', async () => {
      const result = await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'localhost-useless-endpoint',
          type: 'DIDComm',
          serviceEndpoint: `http://localhost:${listeningPort}/foobar`,
          description: 'this endpoint will be removed',
        },
      })
      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toEqual(`http://localhost:${listeningPort}/foobar`)
    })

    it('should remove service from identifier', async () => {
      const result = await agent.didManagerRemoveService({
        did: alice.did,
        id: 'localhost-useless-endpoint',
      })

      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument).not.toBeNull()
      expect([...(resolution?.didDocument?.service || [])]).toEqual([])
    })

    let dummyKey: IKey

    it('should add signing key to identifier', async () => {
      dummyKey = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Secp256k1',
      })

      const result = await agent.didManagerAddKey({
        did: alice.did,
        key: dummyKey,
      })

      expect(result.substr(0, 2)).toEqual('0x')
      const resolution = await agent.resolveDid({ didUrl: alice.did })
      expect(resolution?.didDocument?.verificationMethod?.[2].publicKeyHex).toEqual(dummyKey.publicKeyHex)
    })

    it('should remove signing key from identifier', async () => {
      const result = await agent.didManagerRemoveKey({
        did: alice.did,
        kid: dummyKey.kid,
      })

      expect(result.substr(0, 2)).toEqual('0x')
      const resolution = await agent.resolveDid({ didUrl: alice.did })
      expect(resolution?.didDocument?.verificationMethod?.length).toEqual(2)
    })

    it('should add DIDComm service to receiver DID', async () => {
      const result = await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'alice-didcomm-endpoint',
          type: 'DIDCommMessaging',
          serviceEndpoint: `http://localhost:${listeningPort}/messaging`,
          description: 'handles DIDComm messages',
        },
      })
      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toEqual(`http://localhost:${listeningPort}/messaging`)
    })

    it('should add encryption key to receiver DID', async () => {
      const newKey = await agent.keyManagerCreate({
        kms: 'local',
        type: 'X25519',
      })

      const result = await agent.didManagerAddKey({
        did: alice.did,
        key: newKey,
      })

      expect(result.substr(0, 2)).toEqual('0x')
      const resolution = await agent.resolveDid({ didUrl: alice.did })
      const expectedBase58Key = u8a.toString(u8a.fromString(newKey.publicKeyHex, 'base16'), 'base58btc')
      expect(resolution?.didDocument?.verificationMethod?.[2].publicKeyBase58).toEqual(expectedBase58Key)
      expect(resolution?.didDocument?.keyAgreement?.[0]).toEqual(resolution?.didDocument?.verificationMethod?.[2].id)
    })

    it.skip('should send an anoncrypt message from bob to alice', async () => {
      expect.assertions(3)

      const message = {
        type: 'test',
        to: alice.did,
        from: bob.did,
        id: 'test',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'anoncrypt',
        message,
      })
      const result = await agent.sendDIDCommMessage({
        messageId: '123',
        packedMessage,
        recipientDidUrl: alice.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: '123', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { hello: 'world' },
              from: 'did:ethr:ganache:0x02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
              id: 'test',
              to: 'did:ethr:ganache:0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
              type: 'test',
            },
            metaData: { packing: 'anoncrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })

    it.skip('should fail to send jws message from alice to bob', async () => {
      expect.assertions(3)

      const message = {
        type: 'test',
        to: bob.did,
        from: alice.did,
        id: 'fail',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'jws',
        message,
      })
      expect(agent.sendDIDCommMessage({
        messageId: '456',
        packedMessage,
        recipientDidUrl: bob.did,
      })).rejects.toThrowError(/^Error: Failed to send message/)

    })
  })
}
