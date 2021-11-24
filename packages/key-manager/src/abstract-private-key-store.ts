import { ManagedKeyInfo, RequireOnly, TKeyType } from '@veramo/core'

export interface ManagedPrivateKey {
  alias: string
  privateKeyHex: string
  type: TKeyType
}

export type ImportablePrivateKey = RequireOnly<ManagedPrivateKey, 'privateKeyHex' | 'type'>

export abstract class AbstractPrivateKeyStore {
  abstract import(args: ImportablePrivateKey): Promise<ManagedPrivateKey>
  abstract get(args: { alias: string }): Promise<ManagedPrivateKey>
  abstract delete(args: { alias: string }): Promise<boolean>
  abstract list(args: {}): Promise<Array<ManagedPrivateKey>>
}
