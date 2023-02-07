import { IKey, ManagedKeyInfo } from '@veramo/core-types'

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
  abstract importKey(args: Partial<IKey>): Promise<boolean>

  abstract getKey(args: { kid: string }): Promise<IKey>

  abstract deleteKey(args: { kid: string }): Promise<boolean>

  abstract listKeys(args: {}): Promise<Array<ManagedKeyInfo>>
}
