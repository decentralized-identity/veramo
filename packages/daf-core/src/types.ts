import { DIDDocument } from 'did-resolver'
import { Verifiable, W3CCredential, W3CPresentation } from 'did-jwt-vc'

export type VerifiableCredential = Verifiable<W3CCredential>
export type VerifiablePresentation = Verifiable<W3CPresentation>
export { W3CCredential, W3CPresentation }

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
  credentials?: VerifiableCredential[]
  presentations?: VerifiablePresentation[]
}

export interface IAgentBase {
  availableMethods: () => string[]
}

export interface IAgent extends IAgentBase {
  execute: <A = any, R = any>(method: string, args: A) => Promise<R>
}

export interface IPluginMethod {
  (args: any, context: any): Promise<any>
}

export interface IPluginMethodMap extends Record<string, IPluginMethod> {}

export interface IAgentPlugin {
  readonly methods: IPluginMethodMap
}

export interface RemoveContext<T extends IPluginMethod> {
  (args?: Parameters<T>[0] | undefined): ReturnType<T>
}

export type TAgent<T extends IPluginMethodMap> = {
  [P in keyof T]: RemoveContext<T[P]>
} &
  Pick<IAgentBase, 'availableMethods'>

export interface IAgentContext<T extends IPluginMethodMap> {
  agent: TAgent<T>
}

export interface IDataStore extends IPluginMethodMap {
  dataStoreSaveMessage(args: IMessage): Promise<boolean>
  dataStoreSaveVerifiableCredential(args: VerifiableCredential): Promise<boolean>
  dataStoreSaveVerifiablePresentation(args: VerifiablePresentation): Promise<boolean>
}

export interface IResolveDid extends IPluginMethodMap {
  resolveDid(args: { didUrl: string }): Promise<DIDDocument>
}
