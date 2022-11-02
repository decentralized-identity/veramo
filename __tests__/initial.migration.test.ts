// noinspection ES6PreferShortImport

/**
 * This suite runs through a few agent operations using data that was created before
 * TypeORM migrations were available (before Veramo 3.0.0)
 */

import {
  createAgent,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IResolver,
  TAgent,
  VerifiableCredential,
} from '../packages/core/src'
import { DIDResolverPlugin } from '../packages/did-resolver/src'
import { EthrDIDProvider } from '../packages/did-provider-ethr/src'
import { WebDIDProvider } from '../packages/did-provider-web/src'
import { EnsDIDProvider } from '../packages/did-provider-ens/src'
import { getDidKeyResolver, KeyDIDProvider } from '../packages/did-provider-key/src'
import { DIDComm, IDIDComm } from '../packages/did-comm/src'
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src'
import {
  DataStore,
  DataStoreORM,
  DIDStore,
  Entities,
  KeyStore,
  migrations,
  PrivateKeyStore,
} from '../packages/data-store/src'
import { KeyManager } from '../packages/key-manager/src'
import { DIDManager } from '../packages/did-manager/src'
import { FakeDidProvider, FakeDidResolver } from '../packages/test-utils/src'

import { DataSourceOptions, DataSource } from 'typeorm'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import * as fs from 'fs'

jest.setTimeout(60000)

const infuraProjectId = '3586660d179141e3801c3895de1c2eba'
const dbEncryptionKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'

describe('database initial migration tests', () => {
  describe('simple migrations', () => {
    const dbFile = __dirname + '/fixtures/local-database-before-migration.sqlite'
    createTestsUsingOptions(dbFile, {})
  })

  describe('migrations WITH entityPrefix', () => {
    const dbFile = __dirname + '/fixtures/local-database-before-migration-with-prefix.sqlite'
    createTestsUsingOptions(dbFile, {
      entityPrefix: 'veramo_',
    })
  })

  function createTestsUsingOptions(
    databaseBeforeFile: string,
    connectionOverrides: Partial<DataSourceOptions>,
  ) {
    describe('using pre-migration database fixture', () => {
      const databaseFile = databaseBeforeFile + '.tmp'
      type TestingAgentPlugins = IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver & IDIDComm
      let agent: TAgent<TestingAgentPlugins>
      let dbConnection: DataSource

      beforeAll(async () => {
        fs.copyFileSync(databaseBeforeFile, databaseFile)

        // intentionally using DataSource instead of Promise<DataSource> to test compatibility
        dbConnection = new DataSource({
          name: 'test',
          type: 'sqlite',
          database: databaseFile,
          synchronize: false,
          migrations: migrations,
          migrationsRun: true,
          logging: false,
          entities: Entities,
          ...connectionOverrides,
        } as DataSourceOptions)

        agent = createAgent<TestingAgentPlugins>({
          context: {
            // authorizedDID: 'did:example:3456'
          },
          plugins: [
            new KeyManager({
              store: new KeyStore(dbConnection),
              kms: {
                local: new KeyManagementSystem(
                  new PrivateKeyStore(dbConnection, new SecretBox(dbEncryptionKey)),
                ),
              },
            }),
            new DIDManager({
              store: new DIDStore(dbConnection),
              defaultProvider: 'did:ethr:goerli',
              providers: {
                // intentionally using deprecated config for backward compatibility checks
                'did:ethr:goerli': new EthrDIDProvider({
                  defaultKms: 'local',
                  network: 'goerli',
                  rpcUrl: 'https://goerli.infura.io/v3/' + infuraProjectId,
                }),
                'did:web': new WebDIDProvider({
                  defaultKms: 'local',
                }),
                'did:ens': new EnsDIDProvider({
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

      it('signs using a migrated key', async () => {
        expect.assertions(2)
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
        const cred = await agent.dataStoreGetVerifiableCredential({
          hash: '133b9636e2fe2b7a77b88ca5d81998773b8bc3ebe0b1f3f80dc419dfa0bb797bea779ba0946d603c3ea8611fee5148395894f327661531929294a61589d4d0e7',
        })
        expect(cred.credentialSubject.name).toEqual('Alice')
      })

      it('reads a presentation by hash', async () => {
        const presentation = await agent.dataStoreGetVerifiablePresentation({
          hash: '4cfe965596a0d343ff2cc02afd32068bced34caa2b1e7e3f253b23e420de106b58a613f06f55d9d9cbbdbe0b0f051a45d44404020b123c58f0ee48bdaeafdc90',
        })
        const cred0: VerifiableCredential = presentation?.verifiableCredential?.[0] as VerifiableCredential
        expect(cred0.credentialSubject?.name).toEqual('Alice')
      })

      it('reads existing messages', async () => {
        const msgs = await agent.dataStoreORMGetMessages()
        expect(msgs.length).toEqual(3)
      })

      it('reads existing message with attachments', async () => {
        const msgs = await agent.dataStoreORMGetMessages({
          where: [
            {
              column: 'id',
              value: [
                '13065b8bb97cd37410f4f43cfa878f396aa906701e70c7e2bb86c5de1fe1351a41fb05f445cb68b1ba2805858db619ddd26c71e30a0079c200843d52276213d8',
              ],
            },
          ],
        })
        expect(msgs[0]?.presentations?.length).toEqual(1)
        expect(msgs[0]?.credentials?.length).toEqual(1)
      })

      it('reads a credential by claim', async () => {
        const creds = await agent.dataStoreORMGetVerifiableCredentialsByClaims({
          where: [
            { column: 'type', value: ['name'] },
            { column: 'value', value: ['Alice'] },
          ],
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
  }
})
