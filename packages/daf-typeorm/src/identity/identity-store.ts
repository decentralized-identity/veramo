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

  async get({ did, alias }: { did: string; alias: string }): Promise<IIdentity> {
    let where = {}
    if (did !== undefined && alias === undefined) {
      where = { did }
    } else if (did === undefined && alias !== undefined) {
      where = { alias }
    } else {
      throw Error('[daf:typeorm:identity-store] Get requires did or alias')
    }

    const identity = await (await this.dbConnection).getRepository(Identity).findOne({
      where,
      relations: ['keys', 'services'],
    })

    if (!identity) throw Error('Identity not found')
    return {
      did: identity.did,
      controllerKeyId: identity.controllerKeyId,
      alias: identity.alias,
      provider: identity.provider,
      services: identity.services,
      keys: identity.keys.map((k) => ({
        kid: k.kid,
        type: k.type,
        kms: k.kms,
        publicKeyHex: k.publicKeyHex,
      })),
    }
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
    identity.alias = args.alias

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

  async list(): Promise<IIdentity[]> {
    const identities = await (await this.dbConnection).getRepository(Identity).find({
      where: [{ provider: Not(IsNull()) }],
      relations: ['keys', 'services'],
    })
    return identities
  }
}
