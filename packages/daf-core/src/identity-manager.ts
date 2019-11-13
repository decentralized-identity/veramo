export interface EcdsaSignature {
  r: string
  s: string
  recoveryParam?: number
}

export type Signer = (data: string) => Promise<EcdsaSignature | string>

export interface Issuer {
  // did-jwt-vc
  type: string
  did: string
  signer: Signer
}

export interface IdentityController {
  type: string
  create: () => Promise<string>
  delete: (did: string) => Promise<boolean>
  listDids: () => Promise<string[]>
  listIssuers: () => Promise<Issuer[]>
  issuer: (did: string) => Promise<Issuer>
  export?: (did: string) => Promise<string>
  import?: (secret: string) => Promise<Issuer>
}

interface Options {
  identityControllers: IdentityController[]
}

export class IdentityManager {
  private identityControllers: IdentityController[]

  constructor(options: Options) {
    this.identityControllers = options.identityControllers
  }

  async listDids(): Promise<string[]> {
    let allDids: string[] = []

    for (const identityController of this.identityControllers) {
      const dids = await identityController.listDids()
      allDids = allDids.concat(dids)
    }

    return allDids
  }

  async listIssuers(): Promise<Issuer[]> {
    let allIssuers: Issuer[] = []

    for (const identityController of this.identityControllers) {
      const issuers = await identityController.listIssuers()
      allIssuers = allIssuers.concat(issuers)
    }

    return allIssuers
  }

  async issuer(did: string): Promise<Issuer> {
    const issuers = await this.listIssuers()
    const issuer = issuers.find(item => item.did === did)
    if (issuer) {
      return issuer
    } else {
      return Promise.reject('No issuer for did: ' + did)
    }
  }

  listTypes(): string[] {
    return this.identityControllers.map(
      identityController => identityController.type,
    )
  }

  create(type: string): Promise<string> {
    for (const identityController of this.identityControllers) {
      if (identityController.type === type) {
        return identityController.create()
      }
    }

    return Promise.reject('IdentityController not found for type: ' + type)
  }

  delete(type: string, did: string): Promise<boolean> {
    for (const identityController of this.identityControllers) {
      if (identityController.type === type) {
        return identityController.delete(did)
      }
    }

    return Promise.reject('IdentityController not found for type: ' + type)
  }

  import(type: string, secret: string): Promise<Issuer> {
    for (const identityController of this.identityControllers) {
      if (identityController.type === type) {
        if (identityController.import) {
          return identityController.import(secret)
        } else {
          return Promise.reject(type + ' does not support import')
        }
      }
    }

    return Promise.reject('IdentityController not found for type: ' + type)
  }

  export(type: string, did: string): Promise<string> {
    for (const identityController of this.identityControllers) {
      if (identityController.type === type) {
        if (identityController.export) {
          return identityController.export(did)
        } else {
          return Promise.reject(type + ' does not support export')
        }
      }
    }

    return Promise.reject('IdentityController not found for type: ' + type)
  }
}
