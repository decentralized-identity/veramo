import 'cross-fetch/polyfill'
import {
  Agent,
  IAgent,
  createAgent,
  IIdentityManager,
  IResolver,
  IKeyManager,
  IDataStore,
  IMessageHandler,
  IAgentOptions,
} from '../packages/daf-core/src'
import { MessageHandler } from '../packages/daf-message-handler/src'
import { KeyManager } from '../packages/daf-key-manager/src'
import { IdentityManager } from '../packages/daf-identity-manager/src'
import { createConnection, Connection } from 'typeorm'
import { DafResolver } from '../packages/daf-resolver/src'
import { JwtMessageHandler } from '../packages/daf-did-jwt/src'
import { CredentialIssuer, ICredentialIssuer, W3cMessageHandler } from '../packages/daf-w3c/src'
import { EthrIdentityProvider } from '../packages/daf-ethr-did/src'
import { WebIdentityProvider } from '../packages/daf-web-did/src'
import { DIDComm, DIDCommMessageHandler, IDIDComm } from '../packages/daf-did-comm/src'
import {
  SelectiveDisclosure,
  ISelectiveDisclosure,
  SdrMessageHandler,
} from '../packages/daf-selective-disclosure/src'
import { KeyManagementSystem, SecretBox } from '../packages/daf-libsodium/src'
import {
  Entities,
  KeyStore,
  IdentityStore,
  IDataStoreORM,
  DataStore,
  DataStoreORM,
} from '../packages/daf-typeorm/src'
import { AgentRestClient } from '../packages/daf-rest/src'
import express from 'express'
import { Server } from 'http'
import { AgentRouter } from '../packages/daf-express/src'
import fs from 'fs'

jest.setTimeout(30000)

// Shared tests
import verifiableData from './shared/verifiableData'
import handleSdrMessage from './shared/handleSdrMessage'
import resolveDid from './shared/resolveDid'
import webDidFlow from './shared/webDidFlow'
import documentationExamples from './shared/documentationExamples'
import keyManager from './shared/keyManager'
import identityManager from './shared/identityManager'
import messageHandler from './shared/messageHandler'

const databaseFile = 'rest-database.sqlite'
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'
const port = 3002
const basePath = '/agent'

let dbConnection: Promise<Connection>
let serverAgent: IAgent
let restServer: Server

const getAgent = (options?: IAgentOptions) =>
  createAgent<
    IIdentityManager &
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
    plugins: [
      new AgentRestClient({
        url: 'http://localhost:' + port + basePath,
        enabledMethods: Object.keys(serverAgent.getSchema().components.methods),
        schema: serverAgent.getSchema(),
      }),
    ],
  })

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  dbConnection = createConnection({
    type: 'sqlite',
    database: databaseFile,
    synchronize: true,
    logging: false,
    entities: Entities,
  })

  serverAgent = new Agent({
    ...options,
    plugins: [
      new KeyManager({
        store: new KeyStore(dbConnection, new SecretBox(secretKey)),
        kms: {
          local: new KeyManagementSystem(),
        },
      }),
      new IdentityManager({
        store: new IdentityStore(dbConnection),
        defaultProvider: 'did:ethr:rinkeby',
        providers: {
          'did:ethr': new EthrIdentityProvider({
            defaultKms: 'local',
            network: 'mainnet',
            rpcUrl: 'https://mainnet.infura.io/v3/' + infuraProjectId,
            gas: 1000001,
            ttl: 60 * 60 * 24 * 30 * 12 + 1,
          }),
          'did:ethr:rinkeby': new EthrIdentityProvider({
            defaultKms: 'local',
            network: 'rinkeby',
            rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
            gas: 1000001,
            ttl: 60 * 60 * 24 * 30 * 12 + 1,
          }),
          'did:web': new WebIdentityProvider({
            defaultKms: 'local',
          }),
        },
      }),
      new DafResolver({ infuraProjectId }),
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

  const agentRouter = AgentRouter({
    getAgentForRequest: async (req) => serverAgent,
    exposedMethods: serverAgent.availableMethods(),
  })

  return new Promise((resolve) => {
    const app = express()
    app.use(basePath, agentRouter)
    restServer = app.listen(port, () => {
      resolve()
    })
  })
}

const tearDown = async (): Promise<boolean> => {
  restServer.close()
  await (await dbConnection).close()
  fs.unlinkSync(databaseFile)
  return true
}

const testContext = { getAgent, setup, tearDown }

describe('REST integration tests', () => {
  verifiableData(testContext)
  handleSdrMessage(testContext)
  resolveDid(testContext)
  webDidFlow(testContext)
  documentationExamples(testContext)
  keyManager(testContext)
  identityManager(testContext)
  messageHandler(testContext)
})
