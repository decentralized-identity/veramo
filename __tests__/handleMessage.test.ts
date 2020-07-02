import {
  createAgent,
  KeyManager,
  IdentityManager,
  TAgent,
  IIdentity,
  IIdentityManager,
  IResolveDid,
  IDataStore,
  IKeyManager,
  IHandleMessage,
  MessageHandler,
} from 'daf-core'
import { Connection, createConnection } from 'typeorm'
import { DafResolver } from 'daf-resolver'
import { EthrIdentityProvider } from 'daf-ethr-did'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'
import { Entities, KeyStore, IdentityStore, DataStore, DataStoreORM } from 'daf-typeorm'
import { JwtMessageHandler } from 'daf-did-jwt'
import { W3c, IW3c, W3cMessageHandler } from 'daf-w3c'
import { Sdr, ISdr, SdrMessageHandler } from 'daf-selective-disclosure'
import fs from 'fs'

let agent: TAgent<IIdentityManager & IKeyManager & IDataStore & IResolveDid & IW3c>
let dbConnection: Promise<Connection>
const databaseFile = 'database3.sqlite'
const JWT =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1OTM0NTE3MDAsInR5cGUiOiJzZHIiLCJzdWJqZWN0IjoiZGlkOmV0aHI6cmlua2VieToweDM2MjQ2M2NiZTUyMjhjZTUwMGJlOGUwMzVjZGIyMWI3NzQ1ZjZkYjAiLCJ0YWciOiJzZHItb25lIiwiY2xhaW1zIjpbeyJyZWFzb24iOiJXZSBuZWVkIGl0IiwiY2xhaW1UeXBlIjoibmFtZSIsImVzc2VudGlhbCI6dHJ1ZX1dLCJpc3MiOiJkaWQ6ZXRocjpyaW5rZWJ5OjB4MTM4NGMxZmNlM2Y3MWQ3NjU5NzcwOGY1NGM0ZDEyOGMyNDFkMDBkMiJ9.L-j-gREAuN7DAxDCe1vXJWtMIdmn88HTuTFp2PasTTo_aqvIdGcFtv-rSfvRHkauNq5C3PkXkQWY01VGqpJ-QwE'

describe('integration test for handling messages', () => {
  beforeAll(() => {
    const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
    const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'

    dbConnection = createConnection({
      type: 'sqlite',
      database: databaseFile,
      synchronize: true,
      logging: false,
      entities: Entities,
    })

    agent = createAgent<
      TAgent<IIdentityManager & IKeyManager & IDataStore & IResolveDid & IHandleMessage & IW3c>
    >({
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
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
        new DafResolver({ infuraProjectId }),
        new MessageHandler({
          messageHandlers: [new JwtMessageHandler(), new W3cMessageHandler(), new SdrMessageHandler()],
        }),
        new W3c(),
        new Sdr(),
      ],
    })
  })

  afterAll(async () => {
    ;(await dbConnection).close()
    fs.unlinkSync(databaseFile)
  })

  it('should create identity and verifiable credential', async () => {
    let identity = await agent.identityManagerCreateIdentity({ kms: 'local' })

    const verifiableCredential = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: identity.did },
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: 'did:web:uport.me',
          you: 'Rock',
        },
      },
      proofFormat: 'jwt',
    })

    expect(verifiableCredential.proof.jwt).toBeDefined()
  })

  it('should save an SDR message', async () => {
    const message = await agent.handleMessage({
      raw: JWT,
      save: true,
    })

    expect(message.raw).toEqual(JWT)
  })

  it('should be able to find the request message', async () => {
    const messages = await agent.dataStoreORMGetMessages()

    expect(messages[0].raw).toEqual(JWT)
    expect(messages[0].type).toEqual('sdr')
  })

  it('should be able to sign a credential after saving a message', async () => {
    const identities = await agent.identityManagerGetIdentities()
    const identity = identities[0]

    expect(identities[0].did).toBeDefined()

    const verifiableCredential = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: identity.did },
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: 'did:web:uport.me',
          test: 'Passed?',
        },
      },
      proofFormat: 'jwt',
    })

    expect(verifiableCredential.proof.jwt).toBeDefined()
  })
})
