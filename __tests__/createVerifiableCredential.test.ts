import {
  createAgent,
  KeyManager,
  IdentityManager,
  TAgent,
  IIdentityManager,
  IResolveDid,
  IKeyManager,
} from 'daf-core'
import { Connection, createConnection } from 'typeorm'
import { DafResolver } from 'daf-resolver'
import { W3c, IW3c } from 'daf-w3c'
import { EthrIdentityProvider } from 'daf-ethr-did'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'
import { Entities, KeyStore, IdentityStore } from 'daf-typeorm'
import fs from 'fs'

let agent: TAgent<IIdentityManager & IKeyManager & IResolveDid & IW3c>
let dbConnection: Promise<Connection>
const databaseFile = 'database.sqlite'
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'

describe('integration test for creating Verifiable Credentials', () => {
  beforeAll(() => {
    dbConnection = createConnection({
      type: 'sqlite',
      database: databaseFile,
      synchronize: true,
      logging: false,
      entities: Entities,
    })

    agent = createAgent<TAgent<IIdentityManager & IKeyManager & IResolveDid & IW3c>>({
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
        new W3c(),
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

    expect(verifiableCredential.proof.jwt).toBeTruthy()
  })
})
