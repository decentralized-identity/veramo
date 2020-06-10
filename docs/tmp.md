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
  keyManagerCreateKey?: (args: { type: KeyType; kms: string; meta?: Record<string, any> }) => Promise<Key>
  keyManagerGetKey?: (args: { kid: string }) => Promise<Key>
  keyManagerDeleteKey?: (args: { kid: string }) => Promise<boolean>
  keyManagerImportKey?: (args: Key) => Promise<Key>
  keyManagerEncryptJWE?: (args: { kid: string; to: string; data: string }) => Promise<string>
  keyManagerDecryptJWE?: (args: { kid: string; data: string }) => Promise<string>
  keyManagerSignJWT?: (args: { kid: string; data: string }) => Promise<EcdsaSignature | string>
  keyManagerSignEthTX?: (args: { kid: string; data: string }) => Promise<string>
}
// TODO research "namespaces"

interface IAgentIdentityManager {
  identityManagerGetProviders?: () => Promise<string[]>
  identityManagerGetIdentities?: () => Promise<Identity[]>
  identityManagerGetIdentity?: (args: { did: string }) => Promise<Identity>
  identityManagerCreateIdentity?: (args?: {
    provider?: string
    alias?: string
    kms?: string
  }) => Promise<Identity>
  identityManagerGetOrCreateIdentity?: (args?: {
    provider?: string
    alias?: string
    kms?: string
  }) => Promise<Identity>
  identityManagerImportIdentity?: (args: Identity) => Promise<Identity>
  identityManagerDeleteIdentity?: (args: { provider: string; did: string }) => Promise<boolean>
  identityManagerAddKey?: (args: { did: string; key: Key; options?: any }) => Promise<any> // txHash?
  identityManagerRemoveKey?: (args: { did: string; kid: string; options?: any }) => Promise<any> // txHash?
  identityManagerAddService?: (args: { did: string; service: Service; options?: any }) => Promise<any> //txHash?
  identityManagerRemoveService?: (args: { did: string; id: string; options?: any }) => Promise<any> //txHash?
}

interface IAgentResolve {
  // TODO why null?
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
  handleMessage?: (args: { raw: string; metaData?: MetaData[]; save?: boolean }) => Promise<Message>
}

export interface Order<TColumns> {
  column: TColumns
  direction: 'ASC' | 'DESC'
}

export interface Where<TColumns> {
  column: TColumns
  value?: string[]
  not?: boolean
  op?:
    | 'LessThan'
    | 'LessThanOrEqual'
    | 'MoreThan'
    | 'MoreThanOrEqual'
    | 'Equal'
    | 'Like'
    | 'Between'
    | 'In'
    | 'Any'
    | 'IsNull'
}

export interface FindArgs<TColumns> {
  where?: Where<TColumns>[]
  order?: Order<TColumns>[]
  take?: number
  skip?: number
}

type MessageColumns =
  | 'from'
  | 'to'
  | 'id'
  | 'createdAt'
  | 'expiresAt'
  | 'threadId'
  | 'type'
  | 'raw'
  | 'replyTo'
  | 'replyUrl'
type CredentialColumns = 'context' | 'type' | 'id' | 'issuer' | 'expirationDate' | 'issuanceDate'
type PresentationColumns =
  | 'context'
  | 'type'
  | 'id'
  | 'issuer'
  | 'audience'
  | 'expirationDate'
  | 'issuanceDate'

interface IAgentDataStore {
  dataStoreSaveMessage?: (args: Message) => Promise<boolean>
  dataStoreSaveVerifiableCredential?: (args: VerifiableCredential) => Promise<boolean>
  dataStoreSaveVerifiablePresentation?: (args: VerifiablePresentation) => Promise<boolean>
  dataStoreGetMessages?: (args: FindArgs<MessageColumns>) => Promise<Message[]>
  dataStoreGetVerifiableCredentials?: (args: FindArgs<CredentialColumns>) => Promise<VerifiableCredential[]>
  dataStoreGetVerifiablePresentations?: (
    args: FindArgs<PresentationColumns>,
  ) => Promise<VerifiablePresentation[]>
}

interface IAgentDIDComm {
  sendMessage?: (args: Message) => Promise<boolean>
}

interface Credential {
  '@context'?: string[]
  type: string[]
  id?: string
  issuer: string
  expirationDate?: string
  issuanceDate?: string
  credentialSubject: {
    id?: string
    [x: string]: any
  }
  credentialStatus?: {
    id: string
    type: string
  }
  [x: string]: any
}

interface VerifiableCredential extends Credential {
  proof: {
    jwt?: string
    jws?: string
  }
}

interface Presentation {
  '@context'?: string[]
  type: string[]
  id?: string
  issuer: string
  expirationDate?: string
  issuanceDate?: string
  verifiableCredential: string[]
}

interface VerifiablePresentation extends Presentation {
  proof: {
    jwt?: string
  }
}

interface IAgentW3c {
  createVerifiableCredential?: (args: {
    data: Credential
    proofFormat: 'jwt' | 'ld'
  }) => Promise<VerifiableCredential>
  createVerifiablePresentation?: (args: {
    data: Presentation
    proofFormat: 'jwt' | 'ld'
  }) => Promise<VerifiablePresentation>
}

export interface SelectiveDisclosureRequest {
  issuer: string
  subject?: string
  replyUrl?: string
  tag?: string
  claims: CredentialRequest[]
  credentials?: string[]
}

export interface CredentialRequest {
  reason?: string
  essential?: boolean
  credentialType?: string
  credentialContext?: string
  claimType: string
  claimValue?: string
  issuers?: {
    did: string
    url: string
  }[]
}

interface VerifiableSelectiveDisclosureRequest extends SelectiveDisclosureRequest {
  proof: {
    jwt?: string
  }
}

interface IAgentSelectiveDisclosure {
  createVerifiableSelectiveDisclosureRequest?: (args: {
    data: SelectiveDisclosureRequest
    proof: 'jwt' | 'ld'
  }) => Promise<VerifiableSelectiveDisclosureRequest>
}

interface IBaseAgent {
  execute: <A = any, R = any>(method: string, args: A) => Promise<R>
  availableMethods: () => string[]
}

export type IAgent = IBaseAgent &
  IAgentKeyManager &
  IAgentIdentityManager &
  IAgentResolve &
  IAgentHandleMessage &
  IAgentDataStore &
  IAgentSelectiveDisclosure &
  IAgentW3c
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
import { SdrMessageHandler, SelectiveDisclosure } from 'daf-selective-disclosure'
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
    new SelectiveDisclosure(),
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
