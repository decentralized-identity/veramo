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
import * as u8a from 'uint8arrays'
// @ts-ignore
import express from 'express'
import { Server } from 'http'
import { createFromJSON } from '@libp2p/peer-id-factory'

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
    const listenerPeerIdJson = {
      "id": "QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm",
      "privKey": "CAASqAkwggSkAgEAAoIBAQDLZZcGcbe4urMBVlcHgN0fpBymY+xcr14ewvamG70QZODJ1h9sljlExZ7byLiqRB3SjGbfpZ1FweznwNxWtWpjHkQjTVXeoM4EEgDSNO/Cg7KNlU0EJvgPJXeEPycAZX9qASbVJ6EECQ40VR/7+SuSqsdL1hrmG1phpIju+D64gLyWpw9WEALfzMpH5I/KvdYDW3N4g6zOD2mZNp5y1gHeXINHWzMF596O72/6cxwyiXV1eJ000k1NVnUyrPjXtqWdVLRk5IU1LFpoQoXZU5X1hKj1a2qt/lZfH5eOrF/ramHcwhrYYw1txf8JHXWO/bbNnyemTHAvutZpTNrsWATfAgMBAAECggEAQj0obPnVyjxLFZFnsFLgMHDCv9Fk5V5bOYtmxfvcm50us6ye+T8HEYWGUa9RrGmYiLweuJD34gLgwyzE1RwptHPj3tdNsr4NubefOtXwixlWqdNIjKSgPlaGULQ8YF2tm/kaC2rnfifwz0w1qVqhPReO5fypL+0ShyANVD3WN0Fo2ugzrniCXHUpR2sHXSg6K+2+qWdveyjNWog34b7CgpV73Ln96BWae6ElU8PR5AWdMnRaA9ucA+/HWWJIWB3Fb4+6uwlxhu2L50Ckq1gwYZCtGw63q5L4CglmXMfIKnQAuEzazq9T4YxEkp+XDnVZAOgnQGUBYpetlgMmkkh9qQKBgQDvsEs0ThzFLgnhtC2Jy//ZOrOvIAKAZZf/mS08AqWH3L0/Rjm8ZYbLsRcoWU78sl8UFFwAQhMRDBP9G+RPojWVahBL/B7emdKKnFR1NfwKjFdDVaoX5uNvZEKSl9UubbC4WZJ65u/cd5jEnj+w3ir9G8n+P1gp/0yBz02nZXFgSwKBgQDZPQr4HBxZL7Kx7D49ormIlB7CCn2i7mT11Cppn5ifUTrp7DbFJ2t9e8UNk6tgvbENgCKXvXWsmflSo9gmMxeEOD40AgAkO8Pn2R4OYhrwd89dECiKM34HrVNBzGoB5+YsAno6zGvOzLKbNwMG++2iuNXqXTk4uV9GcI8OnU5ZPQKBgCZUGrKSiyc85XeiSGXwqUkjifhHNh8yH8xPwlwGUFIZimnD4RevZI7OEtXw8iCWpX2gg9XGuyXOuKORAkF5vvfVriV4e7c9Ad4Igbj8mQFWz92EpV6NHXGCpuKqRPzXrZrNOA9PPqwSs+s9IxI1dMpk1zhBCOguWx2m+NP79NVhAoGBAI6WSoTfrpu7ewbdkVzTWgQTdLzYNe6jmxDf2ZbKclrf7lNr/+cYIK2Ud5qZunsdBwFdgVcnu/02czeS42TvVBgs8mcgiQc/Uy7yi4/VROlhOnJTEMjlU2umkGc3zLzDgYiRd7jwRDLQmMrYKNyEr02HFKFn3w8kXSzW5I8rISnhAoGBANhchHVtJd3VMYvxNcQb909FiwTnT9kl9pkjhwivx+f8/K8pDfYCjYSBYCfPTM5Pskv5dXzOdnNuCj6Y2H/9m2SsObukBwF0z5Qijgu1DsxvADVIKZ4rzrGb4uSEmM6200qjJ/9U98fVM7rvOraakrhcf9gRwuspguJQnSO9cLj6",
      "pubKey": "CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDLZZcGcbe4urMBVlcHgN0fpBymY+xcr14ewvamG70QZODJ1h9sljlExZ7byLiqRB3SjGbfpZ1FweznwNxWtWpjHkQjTVXeoM4EEgDSNO/Cg7KNlU0EJvgPJXeEPycAZX9qASbVJ6EECQ40VR/7+SuSqsdL1hrmG1phpIju+D64gLyWpw9WEALfzMpH5I/KvdYDW3N4g6zOD2mZNp5y1gHeXINHWzMF596O72/6cxwyiXV1eJ000k1NVnUyrPjXtqWdVLRk5IU1LFpoQoXZU5X1hKj1a2qt/lZfH5eOrF/ramHcwhrYYw1txf8JHXWO/bbNnyemTHAvutZpTNrsWATfAgMBAAE="
    }
    const listenerMultiAddrPrefix = ``

    let listenerNode: any
    // let listeningPort = Math.round(Math.random() * 32000 + 2048)

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

      const idListener = await createFromJSON(listenerPeerIdJson)
      await new Promise(async (resolve) => {
        listenerNode = await createLibp2pNode({})
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

    it('should add DIDComm service to receiver DID', async () => {
      const result = await agent.didManagerAddService({
        did: alice.did,
        service: {
          id: 'alice-didcomm-endpoint',
          type: 'DIDCommMessaging',
          serviceEndpoint: {
            transportType: "libp2p",
            multiAddr: `${listenerMultiAddrPrefix}\\${listenerPeerIdJson.id}`
          }
          description: 'handles DIDComm messages',
        },
      })
      expect(result.substr(0, 2)).toEqual('0x')

      const resolution = await agent.resolveDid({ didUrl: alice.did })

      expect(resolution?.didDocument?.service?.[0].serviceEndpoint).toEqual(
        `http://localhost:${listeningPort}/messaging`,
      )
    })

    it('should send an signed message from bob to alice', async () => {
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

      expect(result.substr(0, 2)).toEqual('0x')
      const resolution = await agent.resolveDid({ didUrl: alice.did })
      const expectedBase58Key = u8a.toString(u8a.fromString(newKey.publicKeyHex, 'base16'), 'base58btc')
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
      const packedMessage = await await expect(
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
      const expectedBase58Key = u8a.toString(u8a.fromString(newKey.publicKeyHex, 'base16'), 'base58btc')
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
