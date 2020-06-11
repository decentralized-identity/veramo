import { IIdentity } from '../types'

export abstract class AbstractIdentityStore {
  abstract import(identity: IIdentity): Promise<boolean>
  abstract get(did: string): Promise<IIdentity>
  abstract delete(did: string): Promise<boolean>
  abstract list(): Promise<IIdentity[]>
}
