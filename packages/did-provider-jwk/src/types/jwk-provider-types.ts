import { CreateIdentifierBaseOptions, JwkDidSupportedKeyTypes, KeyUse } from '@veramo/utils'

/**
 * Options for creating a JWK DID identifier
 * @internal
 */
export type JwkCreateIdentifierOptions = CreateIdentifierBaseOptions<JwkDidSupportedKeyTypes> & {
  /**
   * @deprecated use key.type instead
   */
  keyType?: JwkDidSupportedKeyTypes

  /**
   * @deprecated use key.privateKeyHex instead
   */
  privateKeyHex?: string

  keyUse?: KeyUse
};
