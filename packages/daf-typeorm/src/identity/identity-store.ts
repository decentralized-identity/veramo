import { IIdentity } from 'daf-core'
import { AbstractIdentityStore } from 'daf-identity-manager'
import { Identity } from '../entities/identity'
import { Key } from '../entities/key'
import { Service } from '../entities/service'
import { Connection, IsNull, Not } from 'typeorm'

import Debug from 'debug'
const debug = Debug('daf:typeorm:identity-store')

export class IdentityStore extends AbstractIdentityStore {
  constructor(private dbConnection: Promise<Connection>) {
    super()
  }

  async get({ did, alias, provider }: { did: string; alias: string; provider: string }): Promise<IIdentity> {
    let where = {}
    if (did !== undefined && alias === undefined) {
      where = { did }
    } else if (did === undefined && alias !== undefined && provider !== undefined) {
      where = { alias, provider }
    } else {
      throw Error('[daf:typeorm:identity-store] Get requires did or (alias and provider)')
    }

    const identity = await (await this.dbConnection).getRepository(Identity).findOne({
      where,
      relations: ['keys', 'services'],
    })

    if (!identity) throw Error('Identity not found')
    const result: IIdentity = {
      did: identity.did,
      controllerKeyId: identity.controllerKeyId,
      provider: identity.provider,
      services: identity.services,
      keys: identity.keys.map((k) => ({
        kid: k.kid,
        type: k.type,
        kms: k.kms,
        publicKeyHex: k.publicKeyHex,
      })),
    }
    if (identity.alias) {
      result.alias = identity.alias
    }
    return result
  }

  async delete({ did }: { did: string }) {
    const identity = await (await this.dbConnection).getRepository(Identity).findOne(did)
    if (!identity) throw Error('Identity not found')
    debug('Deleting', did)
    await (await this.dbConnection).getRepository(Identity).remove(identity)

    return true
  }

  async import(args: IIdentity) {
    const identity = new Identity()
    identity.did = args.did
    identity.controllerKeyId = args.controllerKeyId
    identity.provider = args.provider
    if (args.alias) {
      identity.alias = args.alias
    }

    identity.keys = []
    for (const argsKey of args.keys) {
      const key = new Key()
      key.kid = argsKey.kid
      key.publicKeyHex = argsKey.publicKeyHex
      key.privateKeyHex = argsKey.privateKeyHex
      key.kms = argsKey.kms
      key.meta = argsKey.meta
      identity.keys.push(key)
    }

    identity.services = []
    for (const argsService of args.services) {
      const service = new Service()
      service.id = argsService.id
      service.type = argsService.type
      service.serviceEndpoint = argsService.serviceEndpoint
      service.description = argsService.description
      identity.services.push(service)
    }

    await (await this.dbConnection).getRepository(Identity).save(identity)

    debug('Saving', args.did)
    return true
  }

  async list(args: { alias?: string; provider?: string }): Promise<IIdentity[]> {
    const where: any = { provider: args?.provider || Not(IsNull()) }
    if (args?.alias) {
      where['alias'] = args.alias
    }
    const identities = await (await this.dbConnection).getRepository(Identity).find({
      where,
      relations: ['keys', 'services'],
    })
    return identities.map( identity => {
      const i = identity
      if (i.alias === null) {
        delete i.alias
      }
      return i
    })
  }
}
