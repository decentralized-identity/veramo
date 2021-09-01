import { IKey, ManagedKeyInfo } from '@veramo/core'

export abstract class AbstractKeyStore {
  abstract import(args: Partial<IKey>): Promise<boolean>
  abstract get(args: { kid: string }): Promise<IKey>
  abstract delete(args: { kid: string }): Promise<boolean>
  abstract list(args: {}): Promise<Array<ManagedKeyInfo>>
}
