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

export type JwkDidSupportedKeyTypes = 'Secp256r1' | 'Secp256k1' | 'Ed25519' | 'X25519'

export enum SupportedKeyTypes {
  Secp256r1 = 'Secp256r1',
  Secp256k1 = 'Secp256k1',
  Ed25519 = 'Ed25519',
  X25519 = 'X25519',
}

export type KeyUse = 'sig' | 'enc'
