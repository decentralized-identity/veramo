import 'cross-fetch/polyfill'
import {
  Agent,
  createAgent,
  TAgent,
  IIdentityManager,
  IResolver,
  IKeyManager,
  IDataStore,
  IMessageHandler,
  IAgentPluginSchema
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
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { Server } from 'http'
import { createSchema, AgentGraphQLClient, supportedMethods } from '../packages/daf-graphql/src'
import fs from 'fs'

import IMessageHandlerSchema from '../packages/daf-core/build/schemas/IMessageHandler'
import IDataStoreSchema from '../packages/daf-core/build/schemas/IDataStore'
import IKeyManagerSchema from '../packages/daf-core/build/schemas/IKeyManager'
import IResolverSchema from '../packages/daf-core/build/schemas/IResolver'
import IIdentityManagerSchema from '../packages/daf-core/build/schemas/IIdentityManager'
import ISelectiveDisclosureSchema from '../packages/daf-selective-disclosure/build/schemas/ISelectiveDisclosure'
import ICredentialIssuerSchema from '../packages/daf-w3c/build/schemas/ICredentialIssuer'
import IDIDCommSchema from '../packages/daf-did-comm/build/schemas/IDIDComm'
import IDataStoreORMSchema from '../packages/daf-typeorm/build/schemas/IDataStoreORM'

const schema: IAgentPluginSchema = {
  components: {
    schemas: {
      ...IMessageHandlerSchema.components.schemas,
      ...IDataStoreSchema.components.schemas,
      ...IKeyManagerSchema.components.schemas,
      ...IResolverSchema.components.schemas,
      ...IIdentityManagerSchema.components.schemas,
      ...ISelectiveDisclosureSchema.components.schemas,
      ...ICredentialIssuerSchema.components.schemas,
      ...IDIDCommSchema.components.schemas,
      ...IDataStoreORMSchema.components.schemas,
    },
    methods: {
      ...IMessageHandlerSchema.components.methods,
      ...IDataStoreSchema.components.methods,
      ...IKeyManagerSchema.components.methods,
      ...IResolverSchema.components.methods,
      ...IIdentityManagerSchema.components.methods,
      ...ISelectiveDisclosureSchema.components.methods,
      ...ICredentialIssuerSchema.components.methods,
      ...IDIDCommSchema.components.methods,
      ...IDataStoreORMSchema.components.methods,
    },
  }
}

// Shared tests
import verifiableData from './shared/verifiableData'
import handleSdrMessage from './shared/handleSdrMessage'
import resolveDid from './shared/resolveDid'
import webDidFlow from './shared/webDidFlow'
import documentationExamples from './shared/documentationExamples'
import keyManager from './shared/keyManager'
import identityManager from './shared/identityManager'
import messageHandler from './shared/messageHandler'

const databaseFile = 'graphql-database.sqlite'
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'
const port = 3001

const agent = createAgent<
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
  plugins: [
    new AgentGraphQLClient({
      url: 'http://localhost:' + port + '/graphql',
      enabledMethods: Object.keys(schema.components.methods),
      schema
    }),
  ],
})

let dbConnection: Promise<Connection>
let httpServer: Server

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

  const { typeDefs, resolvers } = createSchema({
    enabledMethods: Object.keys(supportedMethods),
  })

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: { agent: serverAgent },
    introspection: true,
  })

  return new Promise((resolve, reject) => {
    const app = express()
    server.applyMiddleware({ app })
    httpServer = app.listen(port, () => {
      resolve()
    })
  })
}

const tearDown = async (): Promise<boolean> => {
  httpServer.close()
  await (await dbConnection).close()
  fs.unlinkSync(databaseFile)
  return true
}

const getAgent = () => agent

const testContext = { getAgent, setup, tearDown }

describe('GraphQL integration tests', () => {
  verifiableData(testContext)
  handleSdrMessage(testContext)
  resolveDid(testContext)
  webDidFlow(testContext)
  documentationExamples(testContext)
  keyManager(testContext)
  identityManager(testContext)
  messageHandler(testContext)
})
