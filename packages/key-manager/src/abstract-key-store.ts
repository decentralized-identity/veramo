import { IKey, ManagedKeyInfo } from '@veramo/core'

/**
 * This base abstract class should be extended to provide platform specific implementations that are usable by
 * {@link @veramo/key-manager#KeyManager | KeyManager}.
 *
 * Implementations of this class are used to store mappings between key IDs and their respective
 * {@link @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem} implementations.
 *
 * @public
 */
export abstract class AbstractKeyStore {
  abstract import(args: Partial<IKey>): Promise<boolean>

  abstract get(args: { kid: string }): Promise<IKey>

  abstract delete(args: { kid: string }): Promise<boolean>

  abstract list(args: {}): Promise<Array<ManagedKeyInfo>>
}
