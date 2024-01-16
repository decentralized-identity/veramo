import { JwkDidSupportedKeyTypes, KeyUse } from '@veramo/utils'

export type JwkCreateIdentifierOptions = {
  keyType?: JwkDidSupportedKeyTypes
  privateKeyHex?: string
  keyUse?: KeyUse
}

export type JwkDidImportOrGenerateKeyArgs = {
  kms: string
  options: ImportOrGenerateKeyOpts
}

type ImportOrGenerateKeyOpts = {
  keyType: JwkDidSupportedKeyTypes
  privateKeyHex?: string
}
