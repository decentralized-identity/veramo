import { IAgentOptions, IDIDManager, IKeyManager, TAgent, TKeyType } from '../../packages/core/src'
import { computeAddress, serialize } from '@ethersproject/transactions'
import { mapIdentifierKeysToDoc } from '../../packages/utils/src'
import { IResolver } from '../../packages/core/src'
import { recoverTypedSignature, normalize, SignTypedDataVersion } from '@metamask/eth-sig-util'

type ConfiguredAgent = TAgent<IDIDManager & IKeyManager & IResolver>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: (options?: IAgentOptions) => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('key manager', () => {
    let agent: ConfiguredAgent

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      return true
    })
    afterAll(testContext.tearDown)

    it('should get a list of available key management systems', async () => {
      const keyManagementSystems = await agent.keyManagerGetKeyManagementSystems()
      expect(keyManagementSystems).toEqual(['local', 'web3'])
    })

    it('should create Secp256k1 key', async () => {
      const key = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Secp256k1',
      })

      expect(key).toHaveProperty('kid')
      expect(key).toHaveProperty('publicKeyHex')
      expect(key).not.toHaveProperty('privateKeyHex')
      expect(key.kms).toEqual('local')
      expect(key.type).toEqual('Secp256k1')
    })

    it('should create Ed25519 key', async () => {
      const key = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Ed25519',
      })

      expect(key).toHaveProperty('kid')
      expect(key).toHaveProperty('publicKeyHex')
      expect(key).not.toHaveProperty('privateKeyHex')
      expect(key.kms).toEqual('local')
      expect(key.type).toEqual('Ed25519')
    })

    it('should create X25519 key', async () => {
      const key = await agent.keyManagerCreate({
        kms: 'local',
        type: 'X25519',
      })

      expect(key).toHaveProperty('kid')
      expect(key).toHaveProperty('publicKeyHex')
      expect(key).not.toHaveProperty('privateKeyHex')
      expect(key.kms).toEqual('local')
      expect(key.type).toEqual('X25519')
    })

    it('should throw an error for unsupported kms', async () => {
      expect.assertions(1)
      await expect(
        agent.keyManagerCreate({
          kms: 'foobar',
          type: 'Secp256k1',
        }),
      ).rejects.toThrow(
        `invalid_argument: This agent has no registered KeyManagementSystem with name='foobar'`,
      )
    })

    it('should throw an error for unsupported key type', async () => {
      expect.assertions(1)
      await expect(
        agent.keyManagerCreate({
          kms: 'local',
          //@ts-ignore
          type: 'foobar',
        }),
      ).rejects.toThrow('Key type not supported: foobar')
    })

    it('should create key with meta data', async () => {
      const key = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Secp256k1',
        meta: {
          foo: 'bar',
          bar: 'baz',
        },
      })

      expect(key).toHaveProperty('kid')
      expect(key).toHaveProperty('publicKeyHex')
      expect(key).not.toHaveProperty('privateKeyHex')
      expect(key.kms).toEqual('local')
      expect(key.type).toEqual('Secp256k1')
      expect(key.meta).toEqual({
        foo: 'bar',
        bar: 'baz',
        algorithms: ['ES256K', 'ES256K-R', 'eth_signTransaction', 'eth_signTypedData', 'eth_signMessage'],
      })
    })

    it('should get key by key id', async () => {
      const key = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Secp256k1',
      })

      const key2 = await agent.keyManagerGet({
        kid: key.kid,
      })

      expect(key2).toHaveProperty('kid')
      expect(key2).toHaveProperty('kms')
      expect(key2).toHaveProperty('publicKeyHex')
      expect(key2).toHaveProperty('type')
      expect(key2).not.toHaveProperty('privateKeyHex')
      expect(key2).toEqual(key)
    })

    it('should delete key', async () => {
      const key = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Secp256k1',
      })

      const result = await agent.keyManagerDelete({
        kid: key.kid,
      })

      expect(result).toEqual(true)

      await expect(
        agent.keyManagerGet({
          kid: key.kid,
        }),
      ).rejects.toThrow('Key not found')

      await expect(
        agent.keyManagerDelete({
          kid: key.kid,
        }),
      ).rejects.toThrow('Key not found')
    })

    it('should import key', async () => {
      const keyData = {
        kid: 'myImportedKey',
        kms: 'local',
        type: <TKeyType>'Secp256k1',
        privateKeyHex: 'e63886b5ba367dc2aff9acea6d955ee7c39115f12eaf2aa6b1a2eaa852036668',
        meta: { foo: 'bar' },
      }

      const expectedImport = {
        kid: 'myImportedKey',
        kms: 'local',
        type: 'Secp256k1',
        publicKeyHex:
          '04dd467afb12bdb797303e7f3f0c8cd0ba80d518dc4e339e0e2eb8f2d99a9415cac537854a30d31a854b7af0b4fcb54c3954047390fa9500d3cc2e15a3e09017bb',
        meta: {
          algorithms: ['ES256K', 'ES256K-R', 'eth_signTransaction', 'eth_signTypedData', 'eth_signMessage'],
          foo: 'bar',
        },
      }

      const result = await agent.keyManagerImport(keyData)
      expect(result).toEqual(expectedImport)

      const key2 = await agent.keyManagerGet({
        kid: keyData.kid,
      })

      expect(key2).toEqual(expectedImport)
    })

    it('should sign JWT', async () => {
      const key = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Secp256k1',
      })

      const signature = await agent.keyManagerSignJWT({
        kid: key.kid,
        data: 'test',
      })

      expect(signature).toBeDefined()
    })

    it('should sign EthTX', async () => {
      const key = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Secp256k1',
      })

      const rawTx = await agent.keyManagerSignEthTX({
        kid: key.kid,
        transaction: {
          to: '0xce31a19193d4b23f4e9d6163d7247243bAF801c3',
          value: 300000,
          gasLimit: 43092000,
          gasPrice: 20000000000,
          nonce: 1,
        },
      })

      expect(typeof rawTx).toEqual('string')
    })

    it('should allow signing EthTX with matching from', async () => {
      const key = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Secp256k1',
      })
      const keyAddress = computeAddress('0x' + key.publicKeyHex)

      const rawTx = await agent.keyManagerSignEthTX({
        kid: key.kid,
        transaction: {
          to: '0xce31a19193d4b23f4e9d6163d7247243bAF801c3',
          from: keyAddress,
          value: 300000,
          gasLimit: 43092000,
          gasPrice: 20000000000,
          nonce: 1,
        },
      })

      expect(typeof rawTx).toEqual('string')
    })

    it('should NOT sign EthTX with mismatching from field', async () => {
      expect.assertions(1)
      const key = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Secp256k1',
      })

      await expect(
        agent.keyManagerSignEthTX({
          kid: key.kid,
          transaction: {
            to: '0xce31a19193d4b23f4e9d6163d7247243bAF801c3',
            from: '0xce31a19193d4b23f4e9d6163d7247243bAF801c3',
            value: 300000,
            gasLimit: 43092000,
            gasPrice: 20000000000,
            nonce: 1,
          },
        }),
      ).rejects.toThrowError(
        'invalid_arguments: keyManagerSignEthTX `from` field does not match the chosen key. `from` field should be omitted.',
      )
    })

    it('Should Encrypt/Decrypt', async () => {
      const message = 'foo bar'
      const senderKey = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Ed25519',
      })
      const recipientKey = await agent.keyManagerCreate({
        kms: 'local',
        type: 'Ed25519',
      })
      const encrypted = await agent.keyManagerEncryptJWE({
        kid: senderKey.kid,
        to: recipientKey,
        data: message,
      })
      expect(typeof encrypted).toEqual('string')
      const decrypted = await agent.keyManagerDecryptJWE({
        kid: recipientKey.kid,
        data: encrypted,
      })
      expect(decrypted).toEqual(message)
    })

    it('Should compute sharedSecret', async () => {
      const kmsArray = await agent.keyManagerGetKeyManagementSystems()
      const kms = kmsArray[0] || 'local'
      await agent.keyManagerImport({
        type: 'X25519',
        kid: 'senderKey1',
        publicKeyHex: 'c4f35b52cc5309e70a1954b00e757d2b134f3cde9beb8179312b5ce4198a1379',
        privateKeyHex: 'c796444e0ee9ec8e1c57ae1334a5900c287426fa5177aa093ed9199573e34aca',
        kms,
      })
      const receiverKey = {
        type: <TKeyType>'X25519',
        publicKeyHex: 'c1d9ca35bd2c86ad0d61f682c30b24c73045a96773d82ff3b21ebadf85c39244',
      }
      const secret = await agent.keyManagerSharedSecret({
        secretKeyRef: 'senderKey1',
        publicKey: receiverKey,
      })
      expect(secret).toEqual('ee94c7fcf5298291029a3c3d59a8a05367a1806f36668a1f67f5ea8149097476')
    })

    describe('using Secp256k1 test vectors', () => {
      const importedKey = {
        kid: 'imported',
        kms: 'local',
        type: <TKeyType>'Secp256k1',
        publicKeyHex:
          '04155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c7037e2bd897812170c92a4c978d6a10481491a37299d74c4bd412a111a4ac875',
        privateKeyHex: '31d1ec15ff8110442012fef0d1af918c0e09b2e2ab821bba52ecc85f8655ec63',
      }

      beforeAll(async () => {
        const imported = await agent.keyManagerImport(importedKey)
      })

      it('should sign JWT using legacy method', async () => {
        const signature = await agent.keyManagerSignJWT({
          kid: importedKey.kid,
          data: 'bla.bla',
        })
        expect(signature).toEqual(
          'pNAFkgmuKhqMbb_6Km--ZmY7UCkWunWUuNajSfF6rv5lEa5nNXCU7cnZBZVptU7u8h150qetqkqUaahAf-Cepw',
        )
      })

      it('should sign EthTX using legacy method', async () => {
        const rawTx = await agent.keyManagerSignEthTX({
          kid: importedKey.kid,
          transaction: {
            to: '0xce31a19193d4b23f4e9d6163d7247243bAF801c3',
            value: 300000,
            gasLimit: 43092000,
            gasPrice: 20000000000,
            nonce: 1,
          },
        })
        expect(rawTx).toEqual(
          '0xf869018504a817c800840291882094ce31a19193d4b23f4e9d6163d7247243baf801c3830493e0801ba0f16e2206290181c3feaa04051dad19089105c24339dbdf0d80147b48a59fa152a0770e8751ec77ccc78e8b207023f168444f7cfb67055c55c70ef75234458a3d51',
        )
      })

      it('should sign JWT using generic signer', async () => {
        const signature = await agent.keyManagerSign({
          algorithm: 'ES256K',
          data: 'bla.bla',
          encoding: 'utf-8',
          keyRef: importedKey.kid,
        })
        expect(signature).toEqual(
          'pNAFkgmuKhqMbb_6Km--ZmY7UCkWunWUuNajSfF6rv5lEa5nNXCU7cnZBZVptU7u8h150qetqkqUaahAf-Cepw',
        )
      })

      it('should sign EthTX using generic signer', async () => {
        const txData = serialize({
          to: '0xce31a19193d4b23f4e9d6163d7247243bAF801c3',
          value: 300000,
          gasLimit: 43092000,
          gasPrice: 20000000000,
          nonce: 1,
        })

        const rawTx = await agent.keyManagerSign({
          algorithm: 'eth_signTransaction',
          data: txData,
          encoding: 'hex',
          keyRef: importedKey.kid,
        })

        expect(rawTx).toEqual(
          '0xf869018504a817c800840291882094ce31a19193d4b23f4e9d6163d7247243baf801c3830493e0801ba0f16e2206290181c3feaa04051dad19089105c24339dbdf0d80147b48a59fa152a0770e8751ec77ccc78e8b207023f168444f7cfb67055c55c70ef75234458a3d51',
        )
      })
    })

    describe('using Ed25519 test vectors', () => {
      const importedKey = {
        kid: 'ea75250531f6834328ac210618253288e4c54632962a9708ca82e4a399f79000',
        kms: 'local',
        type: <TKeyType>'Ed25519',
        publicKeyHex: 'ea75250531f6834328ac210618253288e4c54632962a9708ca82e4a399f79000',
        privateKeyHex:
          '65f341541643070564bb48d9fc10556f2dec246fa056e436a8ec1cdef8c74766ea75250531f6834328ac210618253288e4c54632962a9708ca82e4a399f79000',
      }

      beforeAll(async () => {
        const imported = await agent.keyManagerImport(importedKey)
      })

      it('should sign JWT using legacy method', async () => {
        const signature = await agent.keyManagerSignJWT({
          kid: importedKey.kid,
          data: 'bla.bla',
        })
        expect(signature).toEqual(
          '_2P0iukN2CPH1nQ6LeBm1zQHHp3U4wSYDrpeWTWkp7yuzJex6O60Z4OhdfD5I9WPHV734US8n5vyD2VDbT1UCg',
        )
      })

      it('should sign JWT using generic signer', async () => {
        const signature = await agent.keyManagerSign({
          keyRef: importedKey.kid,
          data: 'bla.bla',
          algorithm: 'EdDSA',
          encoding: 'utf-8',
        })
        expect(signature).toEqual(
          '_2P0iukN2CPH1nQ6LeBm1zQHHp3U4wSYDrpeWTWkp7yuzJex6O60Z4OhdfD5I9WPHV734US8n5vyD2VDbT1UCg',
        )
      })
    })

    it('should sign with eth_signTypedData', async () => {
      // https://github.com/MetaMask/test-dapp/blob/5719808b2a589be92b50fecc1d479fb1e63341c1/src/index.js#L1097
      const msgParams = {
        domain: {
          chainId: 4,
          name: 'Ether Mail',
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
          version: '1',
        },
        message: {
          contents: 'Hello, Bob!',
          from: {
            name: 'Cow',
            wallets: [
              '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
              '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
            ],
          },
          to: [
            {
              name: 'Bob',
              wallets: [
                '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
                '0xB0B0b0b0b0b0B000000000000000000000000000',
              ],
            },
          ],
        },
        types: {

          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person[]' },
            { name: 'contents', type: 'string' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallets', type: 'address[]' },
          ],
        },
      };

      const identifier = await agent.didManagerCreate({ kms: 'local' })

      const extendedKeys = await mapIdentifierKeysToDoc(identifier, 'verificationMethod', { agent })
      const extendedKey = extendedKeys[0]

      const signature = await agent.keyManagerSign({
        data: JSON.stringify(msgParams),
        keyRef: extendedKey.kid,
        algorithm: 'eth_signTypedData'
      })

      const address = extendedKey.meta.ethereumAddress

      const data = {
        ...msgParams,
        primaryType: 'Mail',
        types: {
          ...msgParams.types,
          EIP712Domain: [
            // Order of these elements matters!
            // https://github.com/ethers-io/ethers.js/blob/a71f51825571d1ea0fa997c1352d5b4d85643416/packages/hash/src.ts/typed-data.ts#L385            
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
        },
      }

      //@ts-ignore
      const recovered = recoverTypedSignature({data, signature: signature, version: SignTypedDataVersion.V4})
      expect(address.toLowerCase()).toEqual(recovered)
    })

    it('should sign credential with eth_signTypedData', async () => {
      const msgParams = {
        "domain": {
          "chainId": 4,
          "name": "VerifiableCredential",
          "version": "1"
        },
        "types": {
          "CredentialSubject": [
            {
              "name": "id",
              "type": "string"
            },
            {
              "name": "you",
              "type": "string"
            }
          ],
          "Issuer": [
            {
              "name": "id",
              "type": "string"
            }
          ],
          "VerifiableCredential": [
            {
              "name": "@context",
              "type": "string[]"
            },
            {
              "name": "credentialSubject",
              "type": "CredentialSubject"
            },
            {
              "name": "issuanceDate",
              "type": "string"
            },
            {
              "name": "issuer",
              "type": "Issuer"
            },
            {
              "name": "type",
              "type": "string[]"
            }
          ]
        },
        "message": {
          "issuer": {
            "id": "did:fake:123"
          },
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://example.com/1/2/3"
          ],
          "type": [
            "VerifiableCredential",
            "Custom"
          ],
          "issuanceDate": "2022-05-31T14:02:06.109Z",
          "credentialSubject": {
            "id": "did:web:example.com",
            "you": "Rock"
          }
        }
      }
  
      const identifier = await agent.didManagerCreate({ kms: 'local' })
  
      const extendedKeys = await mapIdentifierKeysToDoc(identifier, 'verificationMethod', { agent })
      const extendedKey = extendedKeys[0]
  
      const signature = await agent.keyManagerSign({
        data: JSON.stringify(msgParams),
        keyRef: extendedKey.kid,
        algorithm: 'eth_signTypedData'
      })
  
      const address = extendedKey.meta.ethereumAddress
  
      const data = {
        ...msgParams,
        primaryType: 'VerifiableCredential',
        types: {
          ...msgParams.types,
          EIP712Domain: [
            // Order of these elements matters!
            // https://github.com/ethers-io/ethers.js/blob/a71f51825571d1ea0fa997c1352d5b4d85643416/packages/hash/src.ts/typed-data.ts#L385
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
          ],
        },
      }

      const args = {data, signature: signature, version: SignTypedDataVersion.V4}
      //@ts-ignore
      const recovered = recoverTypedSignature(args)
      expect(address.toLowerCase()).toEqual(recovered)
    })

  })


}
