import { RequireOnly, KeyMetadata } from '@veramo/core-types'
import { JwkDidSupportedKeyTypes, KeyUse } from '@veramo/utils'

export type JwkCreateIdentifierOptions = {
  /**
   * @deprecated use key.type instead
   */
  keyType?: JwkDidSupportedKeyTypes

  /**
   * @deprecated use key.privateKeyHex instead
   */
  privateKeyHex?: string

  key?: {
    type?: JwkDidSupportedKeyTypes
    privateKeyHex?: string
    meta?: KeyMetadata
  }

  keyUse?: KeyUse
}

export type JwkDidImportOrGenerateKeyArgs = {
  kms: string
  options: RequireOnly<
    RequireOnly<JwkCreateIdentifierOptions, 'key'>['key'],
    'type'
  >
}