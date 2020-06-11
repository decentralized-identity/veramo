import { IIdentity } from '../types'

export abstract class AbstractIdentityStore {
  abstract import(args: IIdentity): Promise<boolean>
  abstract get(args: { did?: string; alias?: string }): Promise<IIdentity>
  abstract delete(args: { did: string }): Promise<boolean>
  abstract list(): Promise<IIdentity[]>
}
