import { RequireOnly, KeyMetadata } from '@veramo/core-types'
import { JwkDidSupportedKeyTypes, KeyUse, CreateIdentifierBaseOptions } from '@veramo/utils'

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
