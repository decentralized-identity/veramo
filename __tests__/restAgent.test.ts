import 'cross-fetch/polyfill'
import {
  Agent,
  createAgent,
  KeyManager,
  IdentityManager,
  TAgent,
  IIdentityManager,
  IResolveDid,
  IKeyManager,
  IDataStore,
  IHandleMessage,
  MessageHandler,
  IAgentBase,
} from 'daf-core'
import { createConnection, Connection } from 'typeorm'
import { DafResolver } from 'daf-resolver'
import { JwtMessageHandler } from 'daf-did-jwt'
import { W3c, IW3c, W3cMessageHandler } from 'daf-w3c'
import { EthrIdentityProvider } from 'daf-ethr-did'
import { DIDComm, DIDCommMessageHandler, ISendMessageDIDCommAlpha1 } from 'daf-did-comm'
import { Sdr, ISdr, SdrMessageHandler } from 'daf-selective-disclosure'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'
import { Entities, KeyStore, IdentityStore, IDataStoreORM, DataStore, DataStoreORM } from 'daf-typeorm'
import { AgentRestClient, supportedMethods } from 'daf-rest'
import express from 'express'
import { Server } from 'http'
import { AgentRouter } from 'daf-express'
import fs from 'fs'

// Shared tests
import createVerifiableCredential from './shared/createVerifiableCredential'
import handleSdrMessage from './shared/handleSdrMessage'
import resolveDid from './shared/resolveDid'

const databaseFile = 'rest-database.sqlite'
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'
const port = 3002

const agent = createAgent<
  TAgent<
    IIdentityManager &
      IKeyManager &
      IDataStore &
      IDataStoreORM &
      IResolveDid &
      IHandleMessage &
      ISendMessageDIDCommAlpha1 &
      IW3c &
      ISdr
  >
>({
  plugins: [
    new AgentRestClient({
      url: 'http://localhost:' + port + '/agent',
      enabledMethods: Object.keys(supportedMethods),
    }),
  ],
})

let dbConnection: Promise<Connection>
let restServer: Server

const setup = async (): Promise<boolean> => {
  dbConnection = createConnection({
    type: 'sqlite',
    database: databaseFile,
    synchronize: true,
    logging: false,
    entities: Entities,
  })

  const serverAgent = new Agent({
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
          'did:ethr:rinkeby': new EthrIdentityProvider({
            defaultKms: 'local',
            network: 'rinkeby',
            rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
            gas: 1000001,
            ttl: 60 * 60 * 24 * 30 * 12 + 1,
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
      new W3c(),
      new Sdr(),
    ],
  })

  const agentRouter = AgentRouter({
    getAgentForRequest: async req => serverAgent,
    exposedMethods: serverAgent.availableMethods(),
  })

  return new Promise((resolve, reject) => {
    const app = express()
    app.use('/agent', agentRouter)
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

const getAgent = () => agent

const testContext = { getAgent, setup, tearDown }

describe('REST integration tests', () => {
  createVerifiableCredential(testContext)
  handleSdrMessage(testContext)
  resolveDid(testContext)
})
