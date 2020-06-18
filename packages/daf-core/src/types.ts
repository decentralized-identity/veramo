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
  services: IService[]
}

// Todo make it a String
export interface EcdsaSignature {
  r: string
  s: string
  recoveryParam?: number
}

export interface ICredential {
  '@context': string[]
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

export interface IVerifiableCredential extends ICredential {
  proof: {
    jwt?: string
    jws?: string
  }
}

export interface IPresentation {
  '@context': string[]
  type: string[]
  id?: string
  issuer: string
  audience: string[]
  expirationDate?: string
  issuanceDate?: string
  verifiableCredential: IVerifiableCredential[]
  [x: string]: any
}

export interface IVerifiablePresentation extends IPresentation {
  proof: {
    jwt?: string
  }
}

export interface IMetaData {
  type: string
  value?: string
}

export interface IMessage {
  id: string
  type: string
  createdAt?: string
  expiresAt?: string
  threadId?: string
  raw?: string
  data?: any
  replyTo?: string[]
  replyUrl?: string
  from?: string
  to?: string
  metaData?: IMetaData[]
  credentials?: IVerifiableCredential[]
  presentations?: IVerifiablePresentation[]
}

export interface IAgentBase {
  execute: <A = any, R = any>(method: string, args: A) => Promise<R>
  availableMethods: () => string[]
}

export interface IContext extends Record<string, any> {
  agent: IAgentBase
}

export type TAgentMethod = (...args: any) => Promise<any>

export type TMethodMap = Record<string, TAgentMethod>

export interface IAgentExtension<T extends TAgentMethod> {
  (args?: Parameters<T>[0] | undefined): ReturnType<T>
}

export type TAgentMethods<T extends TMethodMap> = {
  [P in keyof T]?: IAgentExtension<T[P]>
}

export interface IAgentPlugin {
  readonly methods: TMethodMap
}

export interface IAgentDataStore {
  dataStoreSaveMessage?(args: IMessage): Promise<boolean>
  dataStoreSaveVerifiableCredential?(args: IVerifiableCredential): Promise<boolean>
  dataStoreSaveVerifiablePresentation?(args: IVerifiablePresentation): Promise<boolean>
}

export interface IAgentResolve {
  resolveDid?(args: { didUrl: string }): Promise<DIDDocument>
}
