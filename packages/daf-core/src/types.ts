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

/**
 * Input arguments for {@link IResolveDid.resolveDid}
 *
 * @public
 */
export interface ResolveDidArgs {
  /**
   * DID URL
   *
   * @example
   * `did:web:uport.me`
   */
  didUrl: string
}

export interface IResolveDid extends IPluginMethodMap {
  /**
   * Resolves DID and returns DID Document
   *
   * @example
   * ```typescript
   * const doc = await agent.resolveDid({ didUrl: 'did:web:uport.me' })
   * ```
   *
   * @param args - Input arguments for resolving a DID
   * @public
   */
  resolveDid(args: ResolveDidArgs): Promise<DIDDocument>
}
