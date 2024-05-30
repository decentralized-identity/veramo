export type OydCreateIdentifierOptions = {
    keyType?: OydDidSupportedKeyTypes
    privateKeyHex?: string
    keyUse?: KeyUse
  }
  
  export type OydDidHoldKeysArgs = {
    kms: string
    options: HoldKeysOpts
  }
  
  type HoldKeysOpts = {
    keyType: OydDidSupportedKeyTypes
    kid: string
    publicKeyHex?: string
    privateKeyHex?: string
  }
  
  export enum SupportedKeyTypes {
    Secp256r1 = 'Secp256r1',
    Secp256k1 = 'Secp256k1',
    Ed25519 = 'Ed25519',
    X25519 = 'X25519',
  }
  
  export type OydDidSupportedKeyTypes = keyof typeof SupportedKeyTypes
  
  export type KeyUse = 'sig' | 'enc'
  