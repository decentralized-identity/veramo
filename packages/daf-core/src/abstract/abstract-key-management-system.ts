import { IKey, TKeyType } from '../types'

export abstract class AbstractKeyManagementSystem {
  abstract createKey(args: { type: TKeyType; meta?: any }): Promise<Omit<IKey, 'kms'>>
  abstract deleteKey(args: { kid: string }): Promise<boolean>
  abstract encryptJWE(args: { key: IKey; to: Omit<IKey, 'kms'>; data: string }): Promise<string>
  abstract decryptJWE(args: { key: IKey; data: string }): Promise<string>
  abstract signJWT(args: { key: IKey; data: string }): Promise<string>
  abstract signEthTX(args: { key: IKey; transaction: object }): Promise<string>
}
