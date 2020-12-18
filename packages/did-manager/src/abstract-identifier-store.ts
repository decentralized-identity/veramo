import { IIdentifier } from '@veramo/core'

/**
 * An abstract class for the {@link @veramo/did-manager#DIDManager} identifier store
 * @public
 */
export abstract class AbstractDIDStore {
  abstract import(args: IIdentifier): Promise<boolean>
  abstract get(args: { did: string }): Promise<IIdentifier>
  abstract get(args: { alias: string; provider: string }): Promise<IIdentifier>
  abstract delete(args: { did: string }): Promise<boolean>
  abstract list(args: { alias?: string; provider?: string }): Promise<IIdentifier[]>
}
