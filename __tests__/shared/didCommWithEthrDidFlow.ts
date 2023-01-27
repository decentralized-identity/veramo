// noinspection ES6PreferShortImport

import {
  IAgentOptions,
  IDIDManager,
  IEventListener,
  IIdentifier,
  IKey,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '../../packages/core/src'
import { IDIDComm } from '../../packages/did-comm/src'
import { MessagingRouter, RequestWithAgentRouter } from '../../packages/remote-server/src'
// @ts-ignore
import express from 'express'
import { Server } from 'http'
import { jest } from '@jest/globals'
import { bytesToBase58, hexToBytes } from '../../packages/utils/src'

type ConfiguredAgent = TAgent<IDIDManager & IKeyManager & IResolver & IDIDComm & IMessageHandler>

const DIDCommEventSniffer: IEventListener = {
  eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
  onEvent: jest.fn(() => Promise.resolve()),
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
      try {
        await new Promise((resolve, reject) => didCommEndpointServer?.close(resolve))
      } catch (e) {
        //nop
      }
      await testContext.tearDown()
    })

    it('should add dummy service to identifier', async () => {
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

      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toEqual(
        `http://localhost:${listeningPort}/foobar`,
      )
    })

    it('should remove dummy service from identifier', async () => {
      const result = await agent.didManagerRemoveService({
        did: alice.did,
        id: 'localhost-useless-endpoint',
      })

      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument).not.toBeNull()
      expect([...(resolution?.didDocument?.service || [])]).toEqual([])
    })

    it('should add dummy service 2 to identifier', async () => {
      const result = await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'localhost-useless-endpoint-2',
          type: 'DIDComm',
          serviceEndpoint: { uri: `http://localhost:${listeningPort}/foobar` },
          description: 'this endpoint will be removed',
        },
      })
      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toEqual({
        uri: `http://localhost:${listeningPort}/foobar`,
      })
    })

    it('should remove dummy service 2 from identifier', async () => {
      const result = await agent.didManagerRemoveService({
        did: alice.did,
        id: 'localhost-useless-endpoint-2',
      })

      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument).not.toBeNull()
      expect([...(resolution?.didDocument?.service || [])]).toEqual([])
    })

    it('should add dummy service 3 to identifier', async () => {
      const result = await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'localhost-useless-endpoint-3',
          type: 'DIDComm',
          serviceEndpoint: [{ uri: `http://localhost:${listeningPort}/foobar` }],
          description: 'this endpoint will be removed',
        },
      })
      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toEqual([
        { uri: `http://localhost:${listeningPort}/foobar` },
      ])
    })

    it('should remove dummy service 3 from identifier', async () => {
      const result = await agent.didManagerRemoveService({
        did: alice.did,
        id: 'localhost-useless-endpoint-3',
      })

      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument).not.toBeNull()
      expect([...(resolution?.didDocument?.service || [])]).toEqual([])
    })

    it('should add dummy service 4 to identifier', async () => {
      const result = await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'localhost-useless-endpoint-4',
          type: 'DIDComm',
          serviceEndpoint: [`http://localhost:${listeningPort}/foobar`],
          description: 'this endpoint will be removed',
        },
      })
      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toEqual([
        `http://localhost:${listeningPort}/foobar`,
      ])
    })

    it('should remove dummy service 4 from identifier', async () => {
      const result = await agent.didManagerRemoveService({
        did: alice.did,
        id: 'localhost-useless-endpoint-4',
      })

      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument).not.toBeNull()
      expect([...(resolution?.didDocument?.service || [])]).toEqual([])
    })

    let dummyKey: IKey

    it('should add dummy key to identifier', async () => {
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

    it('should remove dummy key from identifier', async () => {
      const result = await agent.didManagerRemoveKey({
        did: alice.did,
        kid: dummyKey.kid,
      })

      expect(result.substr(0, 2)).toEqual('0x')
      const resolution = await agent.resolveDid({ didUrl: alice.did })
      expect(resolution?.didDocument?.verificationMethod?.length).toEqual(2)
    })

    it('should add DIDComm service to receiver DID with serviceEndpoint as string', async () => {
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

      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toEqual(
        `http://localhost:${listeningPort}/messaging`,
      )
    })

    it('should send an signed message from bob to alice with serviceEndpoint as string', async () => {
      expect.assertions(3)

      const message = {
        type: 'test',
        to: alice.did,
        from: bob.did,
        id: 'test-jws-success',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'jws',
        message,
      })
      const result = await agent.sendDIDCommMessage({
        messageId: 'test-jws-success',
        packedMessage,
        recipientDidUrl: alice.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: 'test-jws-success', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { hello: 'world' },
              from: bob.did,
              id: 'test-jws-success',
              to: alice.did,
              type: 'test',
            },
            metaData: { packing: 'jws' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })

    it('should remove DIDComm service from receiver', async () => {
      const result = await agent.didManagerRemoveService({
        did: alice.did,
        id: 'alice-didcomm-endpoint',
      })

      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument).not.toBeNull()
      expect([...(resolution?.didDocument?.service || [])]).toEqual([])
    })

    it('should add DIDComm service to receiver DID with serviceEndpoint as array of strings', async () => {
      const result = await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'alice-didcomm-endpoint',
          type: 'DIDCommMessaging',
          serviceEndpoint: [`http://localhost:${listeningPort}/messaging`],
          description: 'handles DIDComm messages',
        },
      })
      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toEqual([
        `http://localhost:${listeningPort}/messaging`,
      ])
    })

    it('should send an signed message from bob to alice with serviceEndpoint as array of strings', async () => {
      expect.assertions(3)

      const message = {
        type: 'test',
        to: alice.did,
        from: bob.did,
        id: 'test-jws-success',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'jws',
        message,
      })
      const result = await agent.sendDIDCommMessage({
        messageId: 'test-jws-success',
        packedMessage,
        recipientDidUrl: alice.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: 'test-jws-success', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { hello: 'world' },
              from: bob.did,
              id: 'test-jws-success',
              to: alice.did,
              type: 'test',
            },
            metaData: { packing: 'jws' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })

    it('should remove DIDComm service from receiver', async () => {
      const result = await agent.didManagerRemoveService({
        did: alice.did,
        id: 'alice-didcomm-endpoint',
      })

      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument).not.toBeNull()
      expect([...(resolution?.didDocument?.service || [])]).toEqual([])
    })

    it('should add DIDComm service to receiver DID with ServiceEndpoint as object', async () => {
      const result = await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'alice-didcomm-endpoint',
          type: 'DIDCommMessaging',
          serviceEndpoint: { uri: `http://localhost:${listeningPort}/messaging` },
          description: 'handles DIDComm messages',
        },
      })
      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toEqual({
        uri: `http://localhost:${listeningPort}/messaging`,
      })
    })

    it('should send an signed message from bob to alice with ServiceEndpoint as object', async () => {
      expect.assertions(3)

      const message = {
        type: 'test',
        to: alice.did,
        from: bob.did,
        id: 'test-jws-success',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'jws',
        message,
      })
      const result = await agent.sendDIDCommMessage({
        messageId: 'test-jws-success',
        packedMessage,
        recipientDidUrl: alice.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: 'test-jws-success', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { hello: 'world' },
              from: bob.did,
              id: 'test-jws-success',
              to: alice.did,
              type: 'test',
            },
            metaData: { packing: 'jws' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })

    it('should remove DIDComm service from receiver', async () => {
      const result = await agent.didManagerRemoveService({
        did: alice.did,
        id: 'alice-didcomm-endpoint',
      })

      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument).not.toBeNull()
      expect([...(resolution?.didDocument?.service || [])]).toEqual([])
    })

    it('should add DIDComm service to receiver DID with serviceEndpoint as array of ServiceEndpoint objects', async () => {
      const result = await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'alice-didcomm-endpoint',
          type: 'DIDCommMessaging',
          serviceEndpoint: [{ uri: `http://localhost:${listeningPort}/messaging` }],
          description: 'handles DIDComm messages',
        },
      })
      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toEqual([
        { uri: `http://localhost:${listeningPort}/messaging` },
      ])
    })

    it('should send an signed message from bob to alice with serviceEndpoint as array of ServiceEndpoint objects', async () => {
      expect.assertions(3)

      const message = {
        type: 'test',
        to: alice.did,
        from: bob.did,
        id: 'test-jws-success',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'jws',
        message,
      })
      const result = await agent.sendDIDCommMessage({
        messageId: 'test-jws-success',
        packedMessage,
        recipientDidUrl: alice.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: 'test-jws-success', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { hello: 'world' },
              from: bob.did,
              id: 'test-jws-success',
              to: alice.did,
              type: 'test',
            },
            metaData: { packing: 'jws' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })

    it('should fail to pack an anoncrypt message from bob to alice (no receiver key)', async () => {
      expect.assertions(1)

      const message = {
        type: 'test',
        to: alice.did,
        from: bob.did,
        id: 'test-anoncrypt-fail',
        body: { hello: 'world' },
      }
      await expect(
        agent.packDIDCommMessage({
          packing: 'anoncrypt',
          message,
        }),
      ).rejects.toThrowError(/^key_not_found: no key agreement keys found for recipient/)
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

      expect(result.substring(0, 2)).toEqual('0x')
      const resolution = await agent.resolveDid({ didUrl: alice.did })
      const expectedBase58Key = bytesToBase58(hexToBytes(newKey.publicKeyHex))
      expect(resolution?.didDocument?.verificationMethod?.[2].publicKeyBase58).toEqual(expectedBase58Key)
      expect(resolution?.didDocument?.keyAgreement?.[0]).toEqual(
        resolution?.didDocument?.verificationMethod?.[2].id,
      )
    })

    it('should send an anoncrypt message from bob to alice', async () => {
      expect.assertions(3)

      const message = {
        type: 'test',
        to: alice.did,
        from: bob.did,
        id: 'test-anoncrypt-success',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'anoncrypt',
        message,
      })
      const result = await agent.sendDIDCommMessage({
        messageId: 'test-anoncrypt-success',
        packedMessage,
        recipientDidUrl: alice.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: 'test-anoncrypt-success', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { hello: 'world' },
              from: 'did:ethr:ganache:0x02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
              id: 'test-anoncrypt-success',
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

    it('should fail to send jws message from alice to bob (no service endpoint)', async () => {
      expect.assertions(1)

      const message = {
        type: 'test',
        to: bob.did,
        from: alice.did,
        id: 'test-endpoint-fail',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'jws',
        message,
      })
      await expect(
        agent.sendDIDCommMessage({
          messageId: 'test-endpoint-fail',
          packedMessage,
          recipientDidUrl: bob.did,
        }),
      ).rejects.toThrowError(/^not_found: could not find DIDComm Messaging service in DID document for/)
    })

    it('should fail to pack an authcrypt message from bob to alice (no skid)', async () => {
      expect.assertions(1)

      const message = {
        type: 'test',
        to: alice.did,
        from: bob.did,
        id: 'test-authcrypt-fail',
        body: { hello: 'world' },
      }
      const packedMessage = await expect(
        agent.packDIDCommMessage({
          packing: 'authcrypt',
          message,
        }),
      ).rejects.toThrowError(/^key_not_found: could not map an agent key to an skid for/)
    })

    it('should add encryption key to sender DID', async () => {
      const newKey = await agent.keyManagerCreate({
        kms: 'local',
        type: 'X25519',
      })

      const result = await agent.didManagerAddKey({
        did: bob.did,
        key: newKey,
      })

      expect(result.substr(0, 2)).toEqual('0x')
      const resolution = await agent.resolveDid({ didUrl: bob.did })
      const expectedBase58Key = bytesToBase58(hexToBytes(newKey.publicKeyHex))
      expect(resolution?.didDocument?.verificationMethod?.[2].publicKeyBase58).toEqual(expectedBase58Key)
      expect(resolution?.didDocument?.keyAgreement?.[0]).toEqual(
        resolution?.didDocument?.verificationMethod?.[2].id,
      )
    })

    it('should send an authcrypt message from bob to alice', async () => {
      expect.assertions(3)

      const message = {
        type: 'test',
        to: alice.did,
        from: bob.did,
        id: 'test-authcrypt-success',
        body: { hello: 'world' },
      }
      const packedMessage = await agent.packDIDCommMessage({
        packing: 'authcrypt',
        message,
      })
      const result = await agent.sendDIDCommMessage({
        messageId: 'test-authcrypt-success',
        packedMessage,
        recipientDidUrl: alice.did,
      })

      expect(result).toBeTruthy()
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        { data: 'test-authcrypt-success', type: 'DIDCommV2Message-sent' },
        expect.anything(),
      )
      // in our case, it is the same agent that is receiving the messages
      expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith(
        {
          data: {
            message: {
              body: { hello: 'world' },
              from: bob.did,
              id: 'test-authcrypt-success',
              to: alice.did,
              type: 'test',
            },
            metaData: { packing: 'authcrypt' },
          },
          type: 'DIDCommV2Message-received',
        },
        expect.anything(),
      )
    })
  })
}
