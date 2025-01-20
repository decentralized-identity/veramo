// noinspection ES6PreferShortImport

/**
 * This runs a suite of ./shared tests using an agent configured for local operations,
 * using a SQLite db for storage of credentials, presentations, messages as well as keys and DIDs.
 *
 * This suite also runs a ganache local blockchain to run through some examples of DIDComm using did:ethr identifiers.
 */

import { createAgent } from '../packages/core/src/index.js'
import {
  IAgentOptions,
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IResolver,
  TAgent,
} from '../packages/core-types/src/index.js'
import { DIDManager } from '../packages/did-manager/src/index.js'
import { DIDResolverPlugin } from '../packages/did-resolver/src/index.js'
import { CredentialPlugin } from '../packages/credential-w3c/src/index.js'
import { Resolver } from 'did-resolver'
import { EthrDIDProvider } from '../packages/did-provider-ethr/src/index.js'
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src/index.js'
import {
  DataStoreORM,
  DIDStore,
  Entities,
  KeyStore,
  migrations,
  PrivateKeyStore,
} from '../packages/data-store/src/index.js'
import { DataSource } from 'typeorm'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import * as fs from 'fs'
import { jest } from '@jest/globals'
import * as path from 'path';
import {
  ContextDoc,
  BbsDefaultContexts,
  BbsSelectiveDisclosureCredentialPlugin,
  CredentialProviderBBS,
  CustomKeyManager,
  VeramoBbsBlsSignature
} from '../packages/credential-bbs/src/index.js'
import citizenVocab from "../packages/credential-bbs/src/custom_contexts/citizenVocab.json"
// Shared tests
import verifiableDataBBS from './shared/verifiableDataBBS.js'


jest.setTimeout(120000)
// This will be the secret key for the KMS
const KMS_SECRET_KEY = '11b574d316903ced6cc3f4787bbcc3047d9c72d1da4d83e36fe714ef785d10c1'
jest.setTimeout(600000)

const customContext: Record<string, ContextDoc> = {
  "https://w3id.org/citizenship/v1": citizenVocab,
}
let bbsContextMaps = [BbsDefaultContexts, customContext]
let bbsSuites = [new VeramoBbsBlsSignature()]
const bbs = new CredentialProviderBBS({
  contextMaps: bbsContextMaps,
  suites: bbsSuites
})
let dbConnection: any

let agent: TAgent<
  IDIDManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolver &
  ICredentialPlugin
>
let databaseFile: string
const database_test = path.normalize(path.resolve() + '/__tests__/fixtures/bbs_database_test.sqlite.tmp')

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  databaseFile = options?.context?.databaseFile || ':memory:'
  dbConnection = new DataSource({
    type: 'sqlite',
    database: database_test,
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: [...Entities]
  }).initialize()

  agent = createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver &
    ICredentialPlugin>({
      plugins: [
        new CustomKeyManager({
          store: new KeyStore(dbConnection),
          kms: {
            local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
          },
        }),
        new DIDManager({
          store: new DIDStore(dbConnection),
          defaultProvider: 'did:ethr:sepolia',
          providers: {
            'did:ethr:sepolia': new EthrDIDProvider({
              defaultKms: 'local',
              network: 'sepolia',
              rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/fTk2Z4HtEe0uc2Lt73cIww13r4_REbj8',

              name: 'sepolia',
              registry: '0x03d5003bf0e79c5f5223588f347eba39afbc3818',
              gas: 100000,
              ttl: 60 * 60 * 24 * 30 * 12 + 1,
            })
          },
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...ethrDidResolver(
              {
                networks: [
                  {
                    name: 'sepolia',
                    chainId: 11155111,
                    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/fTk2Z4HtEe0uc2Lt73cIww13r4_REbj8',
                    registry: '0x03d5003bf0e79c5f5223588f347eba39afbc3818'
                  }
                ]
              })
          }),
        }),
        new CredentialPlugin({ issuers: [bbs] }),
        new BbsSelectiveDisclosureCredentialPlugin({ contextMaps: bbsContextMaps, suites: bbsSuites }),
        new DataStoreORM(dbConnection),
      ],
    })
  return true
}

const tearDown = async (): Promise<boolean> => {
  try {
    await (await dbConnection).dropDatabase()
    await (await dbConnection).close()
  } catch (e) {
    // nop
  }
  try {
    fs.unlinkSync(databaseFile)
  } catch (e) {
    // nop
  }
  return true
}

const getAgent = () => agent
const testContext = { getAgent, setup, tearDown }

describe('BBS Local integration tests', () => {
  verifiableDataBBS(testContext)
})
