import { SerializedKey } from './abstract-key-management-system'

export interface SerializedIdentity {
  did: string
  controller: SerializedKey
  keys: SerializedKey[]
}

export abstract class AbstractIdentityStore {
  abstract set(did: string, serializedIdentity: SerializedIdentity): Promise<boolean>
  abstract get(did: string): Promise<SerializedKey>
  abstract delete(did: string): Promise<boolean>
  abstract listDids(): Promise<string[]>
}
