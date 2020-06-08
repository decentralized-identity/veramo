# Types

```typescript

type KeyType = 'Ed25519' | 'Secp256k1'

interface Key {
  kid: string
  kms: string
  type: KeyType
  publicKeyHex: string
  privateKeyHex?: string
  meta?: Record<string, any>
}

interface Service {
  id: string
  type: string
  serviceEndpoint: string
  description?: string
}

interface Identity {
  did: string
  alias?: string
  provider: string
  controllerKeyId: string
  keys: Key[]
  service: Service[]
}


interface EcdsaSignature {
  r: string
  s: string
  recoveryParam?: number
}

interface IAgentSecretBox {
  secretEncrypt?: (args: { message: string }) => Promise<string>
  secretDecrypt?: (args: { encryptedMessageHex: string }) => Promise<string>
}

interface IAgentKeyManager {
  createKey?: (args: { type: KeyType, kms: string, meta?: Record<string, any> }) => Promise<Key>
  getKey?: (args: { kid: string }) => Promise<Key>
  deleteKey?: (args: { kid: string }) => Promise<boolean>
  saveKey?: (args: Key ) => Promise<Key> // import
  keyEncrypt?: (args: { kid: sting, to: string, data: string }) => Promise<string>
  keyDecrypt?: (args: { kid: sting, data: string }) => Promise<string>
  keySignJwt?: (args: { kid: sting, data: string }) => Promise<EcdsaSignature | string>
  keySignEthTX?: (args: { kid: sting, data: string }) => Promise<string>
}

interface IAgentIdentityManager {
  getIdentityProviders?: () => Promise<string[]>
  getIdentities?: () => Promise<Identity[]>
  getIdentity?: (args: { did: string }) => Promise<Identity>
  createIdentity?: (args?: { provider?: string; alias?: string, kms?: string }) => Promise<Identity>
  getOrCreateIdentity?: (args?: { provider?: string; alias?: string, kms?: string }) => Promise<Identity>
  saveIdentity?: (args: Identity) => Promise<Identity> // import
  deleteIdentity?: (args: { provider: string; did: string }) => Promise<boolean>
  addKey?: (args: { did: string, key: Key }) => Promise<any> // txHash?
  removeKey?: (args: { did: string, kid: string }) => Promise<any> // txHash?
  addService?: (args: { did: string, service: Service }) => Promise<any> //txHash?
  removeService?: (args: { did: string, id: string }) => Promise<any> //txHash?
}

interface IAgentResolve {
  resolve?: (args: { did: string }) => Promise<DIDDocument | null>
}

interface Message {
  id: string
  createdAt?: Date
  expiresAt?: Date
  threadId?: string
  type: string
  raw?: string
  data?: any
  replyTo?: string[]
  replyUrl?: string
  from?: string
  to?: string
  metaData?: MetaData[]
}

interface MetaData {
  type: string
  value?: string
}

interface IAgentHandleMessage {
  handleMessage?: (args: { raw: string, metaData?: MetaData[], save?: boolean }) => Promise<Message>
  saveMessage?: (args: Message) => Promise<Message>
}

interface IAgentDataStore {
  saveMessage?: (args: Message) => Promise<boolean>
  getMessage?: (args: { id: string }) => Promise<Message>
  // TODO
  // saveCredential
  // getCredential
  // savePresentation
  // getPresentation
}

interface IAgentDIDComm {
  sendMessage?: (args: Message) => Promise<boolean>
}

interface Credential {

}

interface Presentation {

}

interface IAgentW3c {
  signCredential?: (args: { data: Credential, proof: 'jwt' | 'ld' }) => Promise<Credential>
  signPresentation?: (args: { data: Presentation, proof: 'jwt' | 'ld' }) => Promise<Presentation>
}

interface IBaseAgent {
  execute: <A = any, R = any>(method: string, args: A) => Promise<R>
  availableMethods: () => string[]
}

export type IAgent = IBaseAgent &
  IAgentSecretBox &
  IAgentKeyManager &
  IAgentIdentityManager &
  IAgentResolve &
  IAgentHandleMessage &
  IAgentDataStore &
  IAgentW3c &


```

# Setup

```typescript

import { Agent, IdentityManager, HandleMessage } from 'daf-core'
import { EthrIdentityProvider } from 'daf-ethr-did'
import { WebIdentityProvider } from 'daf-web-did'
import { SecretBox, KeyManagementSystem } from 'daf-libsodium'
import { HSMKeyManagementSystem } from 'some-hsm-kms'
import { DafResolver } from 'daf-resolver'
import { JwtMessageHandler } from 'daf-did-jwt'
import { W3cMessageHandler, W3c } from 'daf-w3c'
import { SdrMessageHandler, Sdr } from 'daf-selective-disclosure'
import { DIDComm } from 'daf-did-comm'
import { Entities, KeyStore, IdentityStore, DataStore } from 'daf-typeorm'
import { createConnection } from 'typeorm'

const dbConnection = createConnection({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: Entities,
})
const secretKey = process.env.DAF_SECRET_KEY
const infuraProjectId = process.env.INFURA_PROJECT_ID

export const agent: IAgent = new Agent({
  plugins: [
    new SecretBox(secretKey),
    new KeyManager({
      store: new KeyStore(dbConnection)
      kms: {
        local: new KeyManagementSystem(),
        hsm: new HSMKeyManagementSystem(process.env.HSM_API_KEY),
      }
    })
    new IdentityManager({
      store: new IdentityStore(dbConnection),
      defaultProvider: 'did:ethr:rinkeby',
      providers: {
        'did:ethr:rinkeby': new EthrIdentityProvider({
          defaultKms: 'local',
          network: 'rinkeby',
          rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
        }),
        'did:ethr': new EthrIdentityProvider({
          defaultKms: 'hsm',
          network: 'mainnet',
          rpcUrl: 'https://mainnet.infura.io/v3/' + infuraProjectId,
        }),
        'did:web': new WebIdentityProvider({
          defaultKms: 'hsm'
        }),

      }
    }),
    new DafResolver({ infuraProjectId }),
    new HandleMessage({
      handlers: [
        new JwtMessageHandler(),
        new W3cMessageHandler(),
        new SdrMessageHandler(),
      ],
    }),
    new DataStore(dbConnection),
    new DIDComm(),
    new W3c(),
    new Sdr(),
  ],
})

```

# Usage

```typescript
async function main() {
  let serviceIdentity = await agent.getOrCreateIdentity({ alias: 'example.com', provider: 'did:web' })

  // Getting existing identity or creating a new one
  let bob = await agent.getOrCreateIdentity({ alias: 'bob' })

  // Sign verifiable credential
  const credential = await agent.signCredential({
    proof: 'jwt',
    data: {
      issuer: serviceIdentity.did,
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        id: bob.did,
        skill: 'Developer',
      },
    },
  })

  // Send verifiable credential using DIDComm
  const message = await agent.sendMessageDIDCommAlpha1({
    data: {
      from: bob.did,
      to: 'did:web:public-credential-registry.com',
      type: 'jwt',
      body: credential.raw,
    },
  })
  console.log({ message })
}

main().catch(console.log)
```
