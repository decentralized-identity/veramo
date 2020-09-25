import {
  createAgent,
  TAgent,
  IIdentityManager,
  IResolver,
  IKeyManager,
  IDataStore,
  IMessageHandler,
} from 'daf-core'
import { MessageHandler } from 'daf-message-handler'
import { KeyManager } from 'daf-key-manager'
import { IdentityManager } from 'daf-identity-manager'
import { createConnection, Connection } from 'typeorm'
import { DafResolver } from 'daf-resolver'
import { JwtMessageHandler } from 'daf-did-jwt'
import { CredentialIssuer, ICredentialIssuer, W3cMessageHandler } from 'daf-w3c'
import { EthrIdentityProvider } from 'daf-ethr-did'
import { WebIdentityProvider } from 'daf-web-did'
import { DIDComm, DIDCommMessageHandler, IDIDComm } from 'daf-did-comm'
import { SelectiveDisclosure, ISelectiveDisclosure, SdrMessageHandler } from 'daf-selective-disclosure'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'
import { Entities, KeyStore, IdentityStore, IDataStoreORM, DataStore, DataStoreORM } from 'daf-typeorm'
import fs from 'fs'

// Shared tests
import createVerifiableCredential from './shared/createVerifiableCredential'
import handleSdrMessage from './shared/handleSdrMessage'
import resolveDid from './shared/resolveDid'
import webDidFlow from './shared/webDidFlow'
import saveClaims from './shared/saveClaims'
import documentationExamples from './shared/documentationExamples'
import keyManager from './shared/keyManager'
import identityManager from './shared/identityManager'

const databaseFile = 'local-database.sqlite'
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'

let agent: TAgent<
  IIdentityManager &
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

const setup = async (): Promise<boolean> => {
  dbConnection = createConnection({
    type: 'sqlite',
    database: databaseFile,
    synchronize: true,
    logging: false,
    entities: Entities,
  })

  agent = createAgent<
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
  createVerifiableCredential(testContext)
  handleSdrMessage(testContext)
  resolveDid(testContext)
  webDidFlow(testContext)
  saveClaims(testContext)
  documentationExamples(testContext)
  keyManager(testContext)
  identityManager(testContext)
})
