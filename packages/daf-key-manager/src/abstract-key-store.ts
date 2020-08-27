import { IKey } from 'daf-core'

export abstract class AbstractKeyStore {
  abstract import(args: IKey): Promise<boolean>
  abstract get(args: { kid: string }): Promise<IKey>
  abstract delete(args: { kid: string }): Promise<boolean>
}
