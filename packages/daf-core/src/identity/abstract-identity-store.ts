import { SerializedKey } from './abstract-key-management-system'

export interface SerializedIdentity {
  did: string
  controllerKeyId: string
  keys: SerializedKey[]
}

export abstract class AbstractIdentityStore {
  abstract set(did: string, serializedIdentity: SerializedIdentity): Promise<boolean>
  abstract get(did: string): Promise<SerializedIdentity>
  abstract delete(did: string): Promise<boolean>
  abstract listDids(): Promise<string[]>
}
