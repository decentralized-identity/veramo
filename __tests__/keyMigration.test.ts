import { createAgent, TAgent, IDIDManager, IResolver, IKeyManager, IDataStore } from '../packages/core/src'
import { DIDResolverPlugin } from '../packages/did-resolver/src'
import { EthrDIDProvider } from '../packages/did-provider-ethr/src'
import { WebDIDProvider } from '../packages/did-provider-web/src'
import { KeyDIDProvider } from '../packages/did-provider-key/src'
import { DIDComm, IDIDComm } from '../packages/did-comm/src'
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src'
import {
  Entities,
  IDataStoreORM,
  DataStore,
  DataStoreORM,
  KeyStore,
  DIDStore,
  PrivateKeyStore,
  migrations,
} from '../packages/data-store/src'
import { getDidKeyResolver } from '../packages/did-provider-key/src'
import { KeyManager } from '../packages/key-manager/src'
import { DIDManager } from '../packages/did-manager/src'
import { FakeDidProvider, FakeDidResolver } from './utils/fake-did'

import { createConnection, Connection } from 'typeorm'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import fs from 'fs'

jest.setTimeout(30000)

const databaseBeforeFile = __dirname + '/fixtures/local-database-before-3.0.sqlite'
const databaseFile = __dirname + '/migrated.keys.database.sqlite'
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'

describe('database private-key migration tests', () => {
  describe('using pre-migration database fixture', () => {
    type TestingAgentPlugins = IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver & IDIDComm
    let agent: TAgent<TestingAgentPlugins>
    let dbConnection: Promise<Connection>

    beforeAll(async () => {
      fs.copyFileSync(databaseBeforeFile, databaseFile)

      dbConnection = createConnection({
        name: 'key-migration-test',
        type: 'sqlite',
        database: databaseFile,
        synchronize: false,
        migrations: migrations,
        migrationsRun: true,
        logging: false,
        entities: Entities,
      })

      agent = createAgent<TestingAgentPlugins>({
        context: {
          // authenticatedDid: 'did:example:3456'
        },
        plugins: [
          new KeyManager({
            store: new KeyStore(dbConnection),
            kms: {
              local: new KeyManagementSystem({
                keyStore: new PrivateKeyStore(dbConnection, new SecretBox(secretKey)),
              }),
            },
          }),
          new DIDManager({
            store: new DIDStore(dbConnection),
            defaultProvider: 'did:ethr:goerli',
            providers: {
              'did:ethr:goerli': new EthrDIDProvider({
                defaultKms: 'local',
                network: 'goerli',
                rpcUrl: 'https://goerli.infura.io/v3/' + infuraProjectId,
              }),
              'did:web': new WebDIDProvider({
                defaultKms: 'local',
              }),
              'did:key': new KeyDIDProvider({
                defaultKms: 'local',
              }),
              'did:fake': new FakeDidProvider(),
            },
          }),
          new DIDResolverPlugin({
            resolver: new Resolver({
              ...ethrDidResolver({ infuraProjectId }),
              ...webDidResolver(),
              ...getDidKeyResolver(),
              ...new FakeDidResolver(() => agent).getDidFakeResolver(),
            }),
          }),
          new DataStore(dbConnection),
          new DataStoreORM(dbConnection),
          new DIDComm(),
        ],
      })
      return true
    })
    afterAll(async () => {
      await (await dbConnection).close()
      fs.unlinkSync(databaseFile)
    })

    it('loads a migrated key', async () => {
      // output of agent.keyManagerGet() before migration
      const key = {
        kid: '04539ffde912c094bc48b64c9ee71b2baece24c710bcad2c7bacced615f60ae53949cdc95379eb50556d11cb0afab0e5a6ca8cb475d413b2f12307cc2d7f5438de',
        kms: 'local',
        type: 'Secp256k1',
        publicKeyHex:
          '04539ffde912c094bc48b64c9ee71b2baece24c710bcad2c7bacced615f60ae53949cdc95379eb50556d11cb0afab0e5a6ca8cb475d413b2f12307cc2d7f5438de',
        privateKeyHex: 'a5e81a8cd50cf5c31d5b87db3e153e2817f86de350a60edc2335f76d5c3b4e0d',
        meta: {
          algorithms: ['ES256K', 'ES256K-R', 'eth_signTransaction', 'eth_signTypedData', 'eth_signMessage'],
        },
      }
      const migratedKey = await agent.keyManagerGet({ kid: key.kid })
      expect(migratedKey.kid).toEqual(key.kid)
      expect(migratedKey).not.toHaveProperty('privateKeyHex')
      const signedMessage = await agent.keyManagerSign({
        data: 'hello world',
        keyRef: migratedKey.kid,
        algorithm: 'ES256K',
        encoding: 'utf-8',
      })
      expect(signedMessage).toEqual(
        'vzDocUViJh7ooOCZ-jBHKZddEsTa4yClHwhIL9SHJwjAv3bC6TZIcUnX36ZqNBWvLbnNAQvdtzqrVf3l0pv3QQ',
      )
    })

    it('unpacks DIDComm message intended for migrated managed key', async () => {
      const packed = {
        message:
          '{"protected":"eyJ0eXAiOiJhcHBsaWNhdGlvbi9kaWRjb21tLWVuY3J5cHRlZCtqc29uIiwiZW5jIjoiWEMyMFAifQ","iv":"mBAgYLce2JpmKtmlNQLG6w9lm6kqf4Ne","ciphertext":"D9_7Xxj51xn3T9yBU-rZmxSTrR82Pi4G7hWCDSxSpRUlmUh2uJoqeCHixSTFeZvFAfw2ryROjrxbpCh5Arg-wqrW3WwKGpVFHXO_r0jHso5lNMO-vGjxOULN","tag":"9Qs-esw1tcnM0jE_Q3LxIQ","recipients":[{"encrypted_key":"kGNaBfhPS2VETu-_iYaUwy13sC1ZVm3i_qYiYkuEleA","header":{"alg":"ECDH-ES+XC20PKW","iv":"1sK1pyOwy_hNY_WsJPGdoFqE8ken51IA","tag":"MplY66h-bHnuSdP1ZGLYyw","epk":{"kty":"OKP","crv":"X25519","x":"UZx8Uf3BJ-m3wm7sBjvCp1UXuHA9v0Qu5KvWfWyBNio"},"kid":"did:key:z6MkiPXoC2uAWPdQpotWxzNMJpaDbfPxaQWcbux5avNwEMfD#z6LSqL9zfeZa53RwpAkjxN7Gizvzv4rjAT7GwhLVYLPXK5dC"}}]}',
      }
      const msg = await agent.unpackDIDCommMessage(packed)
      expect(msg.message.body).toEqual({ hello: 'world' })
    })
  })
})
