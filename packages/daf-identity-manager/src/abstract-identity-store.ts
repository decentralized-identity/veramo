import { IIdentity } from 'daf-core'

/**
 * An abstract class for the {@link daf-identity-manager#IdentityManager} identity store
 * @public
 */
export abstract class AbstractIdentityStore {
  abstract import(args: IIdentity): Promise<boolean>
  abstract get(args: { did?: string; alias?: string }): Promise<IIdentity>
  abstract get(args: { alias: string }): Promise<IIdentity>
  abstract delete(args: { did: string }): Promise<boolean>
  abstract list(): Promise<IIdentity[]>
}
