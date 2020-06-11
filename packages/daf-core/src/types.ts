import { DIDDocument } from 'did-resolver'

export type TKeyType = 'Ed25519' | 'Secp256k1'

export interface IKey {
  kid: string
  kms: string
  type: TKeyType
  publicKeyHex: string
  privateKeyHex?: string
  meta?: Record<string, any>
}

export interface IService {
  id: string
  type: string
  serviceEndpoint: string
  description?: string
}

export interface IIdentity {
  did: string
  alias?: string
  provider: string
  controllerKeyId: string
  keys: IKey[]
  service: IService[]
}

// Todo make it a String
export interface EcdsaSignature {
  r: string
  s: string
  recoveryParam?: number
}

export interface IMetaData {
  type: string
  value?: string
}

export interface IMessage {
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
  metaData?: IMetaData[]
}

export interface IAgent {
  execute: <A = any, R = any>(method: string, args: A) => Promise<R>
  availableMethods: () => string[]
}

export interface IContext extends Record<string, any> {
  agent: IAgent
}

export type TAgentMethod = (args?: any, context?: IContext) => Promise<any>

export type TMethodMap = Record<string, TAgentMethod>

export interface IAgentExtension<T extends TAgentMethod> {
  (arg: Parameters<T>[0]): ReturnType<T>
}
export interface IAgentPlugin {
  readonly methods: TMethodMap
}

export interface IAgentDataStore {
  dataStoreSaveMessage?: (args: IMessage) => Promise<boolean>
  // dataStoreSaveVerifiableCredential?: (args: VerifiableCredential) => Promise<boolean>
  // dataStoreSaveVerifiablePresentation?: (args: VerifiablePresentation) => Promise<boolean>
}

export interface IAgentKeyManager {
  keyManagerCreateKey?: (args: { type: KeyType; kms: string; meta?: Record<string, any> }) => Promise<IKey>
  keyManagerGetKey?: (args: { kid: string }) => Promise<IKey>
  keyManagerDeleteKey?: (args: { kid: string }) => Promise<boolean>
  keyManagerImportKey?: (args: IKey) => Promise<IKey>
  keyManagerEncryptJWE?: (args: { kid: string; to: string; data: string }) => Promise<string>
  keyManagerDecryptJWE?: (args: { kid: string; data: string }) => Promise<string>
  keyManagerSignJWT?: (args: { kid: string; data: string }) => Promise<EcdsaSignature | string>
  keyManagerSignEthTX?: (args: { kid: string; data: string }) => Promise<string>
}

export interface IAgentIdentityManager {
  identityManagerGetProviders?: () => Promise<string[]>
  identityManagerGetIdentities?: () => Promise<IIdentity[]>
  identityManagerGetIdentity?: (args: { did: string }) => Promise<IIdentity>
  identityManagerCreateIdentity?: (args?: {
    provider?: string
    alias?: string
    kms?: string
  }) => Promise<IIdentity>
  identityManagerGetOrCreateIdentity?: (args?: {
    provider?: string
    alias?: string
    kms?: string
  }) => Promise<IIdentity>
  identityManagerImportIdentity?: (args: IIdentity) => Promise<IIdentity>
  identityManagerDeleteIdentity?: (args: { provider: string; did: string }) => Promise<boolean>
  identityManagerAddKey?: (args: { did: string; key: IKey; options?: any }) => Promise<any> // txHash?
  identityManagerRemoveKey?: (args: { did: string; kid: string; options?: any }) => Promise<any> // txHash?
  identityManagerAddService?: (args: { did: string; service: IService; options?: any }) => Promise<any> //txHash?
  identityManagerRemoveService?: (args: { did: string; id: string; options?: any }) => Promise<any> //txHash?
}

interface IAgentResolve {
  resolveDid?: (args: { did: string }) => Promise<DIDDocument>
}
