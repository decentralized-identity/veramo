import { IIdentity, IKey, IService } from '../types'

export abstract class AbstractIdentityProvider {
  abstract createIdentity(args?: any): Promise<IIdentity>
  abstract deleteIdentity(args: { did: string }): Promise<boolean>
  abstract addKey?: (args: { did: string; key: IKey; options?: any }) => Promise<any>
  abstract removeKey?: (args: { did: string; kid: string; options?: any }) => Promise<any>
  abstract addService?: (args: { did: string; service: IService; options?: any }) => Promise<any>
  abstract removeService?: (args: { did: string; id: string; options?: any }) => Promise<any>
}
