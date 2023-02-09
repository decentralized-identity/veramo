import { RequireOnly, TKeyType } from '@veramo/core-types'

/**
 * Represents a private key.
 *
 * The `alias` is used to refer to the key material which is stored as the hex encoding of the raw byte array
 * (`privateKeyHex`).
 *
 * The `type` refers to the type of key that is represented.
 *
 * @public
 */
export interface ManagedPrivateKey {
  alias: string
  privateKeyHex: string
  type: TKeyType
}

/**
 * Represents private key data that can be imported. This is a subset of {@link ManagedPrivateKey}.
 *
 * The `alias` of the resulting {@link ManagedPrivateKey} can be generated automatically if none is provided.
 *
 * @public
 */
export type ImportablePrivateKey = RequireOnly<ManagedPrivateKey, 'privateKeyHex' | 'type'>

/**
 * This base abstract class should be extended to provide platform specific implementations that are usable by
 * {@link @veramo/kms-local#KeyManagementSystem | kms-local}.
 *
 * Implementations of this class are used to store mappings between key aliases and key material.
 *
 * @public
 */
export abstract class AbstractPrivateKeyStore {
  abstract importKey(args: ImportablePrivateKey): Promise<ManagedPrivateKey>

  abstract getKey(args: { alias: string }): Promise<ManagedPrivateKey>

  abstract deleteKey(args: { alias: string }): Promise<boolean>

  abstract listKeys(args: {}): Promise<Array<ManagedPrivateKey>>
}
