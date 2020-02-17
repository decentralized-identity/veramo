import { SerializedKey } from './abstract-key-management-system'

export abstract class AbstractKeyStore {
  abstract set(kid: string, serializedKey: SerializedKey): Promise<boolean>
  abstract get(kid: string): Promise<SerializedKey>
  abstract delete(kid: string): Promise<boolean>
}
