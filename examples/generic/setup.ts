import { 
  Agent, 
  KeyManager,
  MessageHandler,
  IdentityManager,
  IAgentBase,
  IAgentIdentityManager,
  IAgentResolve,
  IAgentKeyManager,
  IAgentHandleMessage,
} from 'daf-core'
import { DafResolver} from 'daf-resolver'
import { JwtMessageHandler } from 'daf-did-jwt'
import { W3c, IAgentW3c, W3cMessageHandler } from 'daf-w3c'
import { DIDComm, DIDCommMessageHandler, IAgentSendMessageDIDCommAlpha1 } from 'daf-did-comm'
import { EthrIdentityProvider } from 'daf-ethr-did'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'
import { Entities, KeyStore, IdentityStore } from 'daf-typeorm'
import { createConnection } from 'typeorm'

const dbConnection = createConnection({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: Entities,
})

const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

type ConfiguredAgent = IAgentBase &
  IAgentIdentityManager &
  IAgentKeyManager &
  IAgentResolve &
  IAgentHandleMessage &
  IAgentSendMessageDIDCommAlpha1 &
  IAgentW3c

export const agent: ConfiguredAgent = new Agent({
  plugins: [
    new KeyManager({
      store: new KeyStore(dbConnection, new SecretBox(secretKey)),
      kms: {
        local: new KeyManagementSystem()
      }
    }),
    new IdentityManager({
      store: new IdentityStore(dbConnection),
      defaultProvider: 'did:ethr:rinkeby',
      providers: {
        'did:ethr:rinkeby': new EthrIdentityProvider({
          defaultKms: 'local',
          network: 'rinkeby',
          rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
          gas: 10001,
          ttl: 60 * 60 * 24 * 30 * 12 + 1,
        })
      }
    }),
    new DafResolver({ infuraProjectId }),
    new MessageHandler({
      messageHandlers: [
        new DIDCommMessageHandler(),
        new JwtMessageHandler(),
        new W3cMessageHandler()
      ],
    }),
    new DIDComm(),
    new W3c(),
  ],
})
