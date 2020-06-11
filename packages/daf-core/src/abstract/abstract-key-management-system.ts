import { IKey, EcdsaSignature } from '../types'

export abstract class AbstractKeyManagementSystem {
  abstract createKey(args: { type: KeyType; meta?: any }): Promise<IKey>
  abstract getKey(args: { kid: string }): Promise<IKey>
  abstract deleteKey(args: { kid: string }): Promise<boolean>
  abstract encryptJWE: (args: { key: IKey; to: string; data: string }) => Promise<string>
  abstract decryptJWE: (args: { key: IKey; data: string }) => Promise<string>
  abstract signJWT: (args: { key: IKey; data: string }) => Promise<EcdsaSignature | string>
  abstract signEthTX: (args: { key: IKey; data: string }) => Promise<string>
}
