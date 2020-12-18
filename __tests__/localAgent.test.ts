import {
  createAgent,
  TAgent,
  IDIDManager,
  IResolver,
  IKeyManager,
  IDataStore,
  IMessageHandler,
  IAgentOptions,
} from '../packages/core/src'
import { MessageHandler } from '../packages/daf-message-handler/src'
import { KeyManager } from '../packages/key-manager/src'
import { DIDManager } from '../packages/did-manager/src'
import { createConnection, Connection } from 'typeorm'
import { DafResolver } from '../packages/daf-resolver/src'
import { JwtMessageHandler } from '../packages/did-jwt/src'
import { CredentialIssuer, ICredentialIssuer, W3cMessageHandler } from '../packages/daf-w3c/src'
import { EthrDIDProvider } from '../packages/ethr-did/src'
import { WebDIDProvider } from '../packages/daf-web-did/src'
import { DIDComm, DIDCommMessageHandler, IDIDComm } from '../packages/did-comm/src'
import {
  SelectiveDisclosure,
  ISelectiveDisclosure,
  SdrMessageHandler,
} from '../packages/daf-selective-disclosure/src'
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src'
import {
  Entities,
  KeyStore,
  DIDStore,
  IDataStoreORM,
  DataStore,
  DataStoreORM,
} from '../packages/daf-typeorm/src'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import fs from 'fs'

jest.setTimeout(30000)

// Shared tests
import verifiableData from './shared/verifiableData'
import handleSdrMessage from './shared/handleSdrMessage'
import resolveDid from './shared/resolveDid'
import webDidFlow from './shared/webDidFlow'
import saveClaims from './shared/saveClaims'
import documentationExamples from './shared/documentationExamples'
import keyManager from './shared/keyManager'
import didManager from './shared/didManager'
import messageHandler from './shared/messageHandler'

const databaseFile = 'local-database.sqlite'
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'

let agent: TAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    IMessageHandler &
    IDIDComm &
    ICredentialIssuer &
    ISelectiveDisclosure
>
let dbConnection: Promise<Connection>

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  dbConnection = createConnection({
    type: 'sqlite',
    database: databaseFile,
    synchronize: true,
    logging: false,
    entities: Entities,
  })

  agent = createAgent<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDataStoreORM &
      IResolver &
      IMessageHandler &
      IDIDComm &
      ICredentialIssuer &
      ISelectiveDisclosure
  >({
    ...options,
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
        defaultProvider: 'did:ethr:rinkeby',
        providers: {
          'did:ethr': new EthrDIDProvider({
            defaultKms: 'local',
            network: 'mainnet',
            rpcUrl: 'https://mainnet.infura.io/v3/' + infuraProjectId,
            gas: 1000001,
            ttl: 60 * 60 * 24 * 30 * 12 + 1,
          }),
          'did:ethr:rinkeby': new EthrDIDProvider({
            defaultKms: 'local',
            network: 'rinkeby',
            rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
            gas: 1000001,
            ttl: 60 * 60 * 24 * 30 * 12 + 1,
          }),
          'did:web': new WebDIDProvider({
            defaultKms: 'local',
          }),
        },
      }),
      new DafResolver({
        resolver: new Resolver({
          ...ethrDidResolver({
            networks: [
              { name: 'mainnet', rpcUrl: 'https://mainnet.infura.io/v3/' + infuraProjectId },
              { name: 'rinkeby', rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId },
              { name: 'ropsten', rpcUrl: 'https://ropsten.infura.io/v3/' + infuraProjectId },
              { name: 'kovan', rpcUrl: 'https://kovan.infura.io/v3/' + infuraProjectId },
              { name: 'goerli', rpcUrl: 'https://goerli.infura.io/v3/' + infuraProjectId },
            ],
          }),
          ...webDidResolver(),
        }),
      }),
      new DataStore(dbConnection),
      new DataStoreORM(dbConnection),
      new MessageHandler({
        messageHandlers: [
          new DIDCommMessageHandler(),
          new JwtMessageHandler(),
          new W3cMessageHandler(),
          new SdrMessageHandler(),
        ],
      }),
      new DIDComm(),
      new CredentialIssuer(),
      new SelectiveDisclosure(),
    ],
  })
  return true
}

const tearDown = async (): Promise<boolean> => {
  await (await dbConnection).close()
  fs.unlinkSync(databaseFile)
  return true
}

const getAgent = () => agent

const testContext = { getAgent, setup, tearDown }

describe('Local integration tests', () => {
  verifiableData(testContext)
  handleSdrMessage(testContext)
  resolveDid(testContext)
  webDidFlow(testContext)
  saveClaims(testContext)
  documentationExamples(testContext)
  keyManager(testContext)
  didManager(testContext)
  messageHandler(testContext)
})
