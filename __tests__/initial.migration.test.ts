import { createAgent, TAgent, IDIDManager, IResolver, IKeyManager, IDataStore } from '@veramo/core/src'
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
  migrations,
} from '../packages/data-store/src'
import { createConnection, Connection } from 'typeorm'
import { getDidKeyResolver } from '../packages/did-provider-key/src'
import { KeyManager } from '../packages/key-manager/src'
import { DIDManager } from '../packages/did-manager/src'
import { FakeDidProvider, FakeDidResolver } from './utils/fake-did'

import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import fs from 'fs'

jest.setTimeout(30000)

const databaseBeforeFile = __dirname + '/fixtures/local-database-before-migration.sqlite'
const databaseFile = __dirname + '/migrated1.database.sqlite'
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'

describe('database migration tests', () => {
  describe('using pre-migration database fixture', () => {
    type TestingAgentPlugins = IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver & IDIDComm
    let agent: TAgent<TestingAgentPlugins>
    let dbConnection: Promise<Connection>

    beforeAll(async () => {
      fs.copyFileSync(databaseBeforeFile, databaseFile)

      dbConnection = createConnection({
        name: 'test',
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
            store: new KeyStore(dbConnection, new SecretBox(secretKey)),
            kms: {
              local: new KeyManagementSystem(),
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

    it('signs using a migrated key', async () => {
      // output of agent.keyManagerGet() before migration
      const key = {
        kid: '048bb0844ebbcf434048862008991b01cdebb564207f0cea08e5c8d925cec3542bb4c8c1630f38a6b05528ec7460139fe0978bf34a1e4ff32ec210bbaed98dddda',
        kms: 'local',
        type: 'Secp256k1',
        publicKeyHex:
          '048bb0844ebbcf434048862008991b01cdebb564207f0cea08e5c8d925cec3542bb4c8c1630f38a6b05528ec7460139fe0978bf34a1e4ff32ec210bbaed98dddda',
        privateKeyHex: 'bb956a5f43283fc4da8ea202ce5ff93e1961d397b98c5871bd6fe420ce56cd53',
        meta: {
          algorithms: ['ES256K', 'ES256K-R', 'eth_signTransaction', 'eth_signTypedData', 'eth_signMessage'],
        },
      }
      const migratedKey = await agent.keyManagerGet({ kid: key.kid })
      expect(migratedKey.kid).toEqual(key.kid)
      const signedMessage = await agent.keyManagerSign({
        data: 'hello world',
        keyRef: migratedKey.kid,
        algorithm: 'ES256K',
        encoding: 'utf-8',
      })
      expect(signedMessage).toEqual(
        'JDaZFSC4eWQdau4G9a8l8ml0rhwmzCY4oEDIr-cjWK2nVCOGZP94HV3EfbpO_X3bZKPITLg8FJgVVSyRRPcObQ',
      )
    })

    it('reads a credential by hash', async () => {
      const cred = await agent.dataStoreGetVerifiableCredential({hash: '133b9636e2fe2b7a77b88ca5d81998773b8bc3ebe0b1f3f80dc419dfa0bb797bea779ba0946d603c3ea8611fee5148395894f327661531929294a61589d4d0e7'})
      expect(cred.credentialSubject.name).toEqual('Alice')
    })

    it('reads a presentation by hash', async () => {
      const cred = await agent.dataStoreGetVerifiablePresentation({hash: '4cfe965596a0d343ff2cc02afd32068bced34caa2b1e7e3f253b23e420de106b58a613f06f55d9d9cbbdbe0b0f051a45d44404020b123c58f0ee48bdaeafdc90'})
      expect(cred?.verifiableCredential?.[0]?.credentialSubject?.name).toEqual('Alice')
    })

    it('reads existing messages', async () => {
      const msgs = await agent.dataStoreORMGetMessages()
      expect(msgs.length).toEqual(3)
    })

    it('reads existing message with attachments', async () => {
      const msgs = await agent.dataStoreORMGetMessages({
        where: [{column: 'id', value: ['13065b8bb97cd37410f4f43cfa878f396aa906701e70c7e2bb86c5de1fe1351a41fb05f445cb68b1ba2805858db619ddd26c71e30a0079c200843d52276213d8']}]
      })
      expect(msgs[0]?.presentations?.length).toEqual(1)
      expect(msgs[0]?.credentials?.length).toEqual(1)
    })

    it('reads a credential by claim', async () => {
      const creds = await agent.dataStoreORMGetVerifiableCredentialsByClaims({
        where: [{ column: 'type', value: ['name'] }, { column: 'value', value: ['Alice']}]
      })
      expect(creds.length).toEqual(1)
    })

    it('unpacks DIDComm message intended for migrated managed key', async () => {
      const packed = {
        message:
          '{"protected":"eyJ0eXAiOiJhcHBsaWNhdGlvbi9kaWRjb21tLWVuY3J5cHRlZCtqc29uIiwiZW5jIjoiWEMyMFAifQ","iv":"_lIE23TIaFAPT_YRvlGzZnXhwQh8AqJ2","ciphertext":"uinIkbE-D8h-IkHPsNHsI9ni2EmGLo368OO0F_AaZG3KP_IAhfA2F8Bevt-LrWxoQJn2_NDhudXCbTpypK0fAnmY9tUEooLimdLxdxLsXHBBr2oZLiQoiRNxxGCSBc0EmQbek4-9b2M3jUauStoptQ","tag":"JbjiNGIYxDPY-_Oj6MHpAA","recipients":[{"encrypted_key":"y2JT-2YpW4PgNJBRKKQyWzGuC-KGDVc2wvN889tIGoY","header":{"alg":"ECDH-ES+XC20PKW","iv":"8Xy5KfRVkrzY8lbCK5ZAdotp9Idxl0_P","tag":"vEzPgqiv3vFc1DppvdVXnA","epk":{"kty":"OKP","crv":"X25519","x":"JFD40GD40ywqCyoeQ4jGJz_adfOqUg6ukX0tYU7iFw8"},"kid":"did:key:z6MktEQbgrewCxg3bXkdKAqHJXSEMJVcxUhcEvkWVqyBpzYn#z6LSpCBthn9h34KEFKPaDjm5Ce7ZQYUtwyqTmwDqTDbAJHBk"}}]}',
      }
      const msg = await agent.unpackDIDCommMessage(packed)
      expect(msg.message.body).toEqual({ hello: 'world' })
    })
  })
})
