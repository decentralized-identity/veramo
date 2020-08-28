import {
  createAgent,
  IIdentityManager,
  IResolveDid,
  IDataStore,
  IKeyManager,
  IMessageHandler,
} from 'daf-core'
import { MessageHandler } from 'daf-message-handler'
import { KeyManager } from 'daf-key-manager'
import { IdentityManager } from 'daf-identity-manager'
import { DafResolver } from 'daf-resolver'
import { JwtMessageHandler } from 'daf-did-jwt'
import { CredentialIssuer, ICredentialIssuer, W3cMessageHandler } from 'daf-w3c'
import { Sdr, ISdr, SdrMessageHandler } from 'daf-selective-disclosure'
import { DIDComm, DIDCommMessageHandler, IDIDComm } from 'daf-did-comm'
import { EthrIdentityProvider } from 'daf-ethr-did'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'
import { Entities, KeyStore, IdentityStore, DataStore, DataStoreORM, IDataStoreORM } from 'daf-typeorm'
import { createConnection } from 'typeorm'

const dbConnection = createConnection({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: true,
  entities: Entities,
})

const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

export const agent = createAgent<
  IIdentityManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolveDid &
  IMessageHandler &
  IDIDComm &
  ICredentialIssuer &
  ISdr
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
    new CredentialIssuer(),
    new Sdr(),
  ],
})
