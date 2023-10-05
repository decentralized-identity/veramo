import { IIdentifier } from '@veramo/core-types'

/**
 * An abstract class for the {@link @veramo/did-manager#DIDManager} identifier store
 * @public
 */
export abstract class AbstractDIDStore {
  abstract importDID(args: IIdentifier): Promise<boolean>
  abstract getDID(args: { did: string }): Promise<IIdentifier>
  abstract getDID(args: { alias: string }): Promise<IIdentifier>
  abstract deleteDID(args: { did: string }): Promise<boolean>
  abstract listDIDs(args: { alias?: string; provider?: string }): Promise<IIdentifier[]>
}
