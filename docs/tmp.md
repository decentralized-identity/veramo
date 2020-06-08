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

// Todo make it a String
interface EcdsaSignature {
  r: string
  s: string
  recoveryParam?: number
}

interface IAgentKeyManager {
  createKey?: (args: { type: KeyType, kms: string, meta?: Record<string, any> }) => Promise<Key>
  getKey?: (args: { kid: string }) => Promise<Key>
  deleteKey?: (args: { kid: string }) => Promise<boolean>
  importKey?: (args: Key ) => Promise<Key>
  // how is this related to secretBox?
  // why does it need key prefix?
  keyEncryptJWE?: (args: { kid: sting, to: string, data: string }) => Promise<string>
  keyDecryptJWE?: (args: { kid: sting, data: string }) => Promise<string>
  keySignJwt?: (args: { kid: sting, data: string }) => Promise<EcdsaSignature | string>
  keySignEthTX?: (args: { kid: sting, data: string }) => Promise<string>
}
// TODO research "namespaces"

// await agent.identityManager.create()
// await agent.identityManagerCreate()


interface IAgentIdentityManager {
  getIdentityProviders?: () => Promise<string[]>
  getIdentities?: () => Promise<Identity[]>
  getIdentity?: (args: { did: string }) => Promise<Identity>
  createIdentity?: (args?: { provider?: string; alias?: string, kms?: string }) => Promise<Identity>
  getOrCreateIdentity?: (args?: { provider?: string; alias?: string, kms?: string }) => Promise<Identity>
  importIdentity?: (args: Identity) => Promise<Identity>
  deleteIdentity?: (args: { provider: string; did: string }) => Promise<boolean>
  // Sometimes only initiates:
  identityAddKey?: (args: { did: string, key: Key, options?: any }) => Promise<any> // txHash?
  identityRemoveKey?: (args: { did: string, kid: string, options?: any }) => Promise<any> // txHash?
  identityAddService?: (args: { did: string, service: Service, options?: any }) => Promise<any> //txHash?
  identityRemoveService?: (args: { did: string, id: string, options?: any }) => Promise<any> //txHash?
}

interface IAgentResolve {
  // TODO why null?
  resolve?: (args: { did: string }) => Promise<DIDDocument | null>
  // TODO:
  dereference?: (args: { didUrl: string }) => Promise<any>
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

interface VerifiableCredential extends Credential {
  proof: any
}


interface Presentation {

}

interface IAgentW3c {
  createVerifiableCredential?: (args: { data: Credential, proof: 'jwt' | 'ld' }) => Promise<VerifiableCredential>
  createVerifiablePresentation?: (args: { data: Presentation, proof: 'jwt' | 'ld' }) => Promise<VerifiablePresentation>
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

import { Agent, IdentityManager, KeyManager, HandleMessage } from 'daf-core'
import { EthrIdentityProvider } from 'daf-ethr-did'
import { WebIdentityProvider } from 'daf-web-did'
import { SecretBox, KeyManagementSystem } from 'daf-libsodium'
import { HSMKeyManagementSystem } from 'some-hsm-kms'
import { Resolver } from 'daf-resolver'
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
    new KeyManager({
      store: new KeyStore(dbConnection, new SecretBox(secretKey)),
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
    new Resolver({ infuraProjectId }),
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
