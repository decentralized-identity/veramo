import { IIdentifier, IKey } from '@veramo/core'
import { AbstractDIDStore } from '@veramo/did-manager'
import { Identifier } from '../entities/identifier'
import { Credential } from '../entities/credential'
import { Key } from '../entities/key'
import { Service } from '../entities/service'
import { Connection, In, IsNull, Not } from 'typeorm'

import Debug from 'debug'
import { Presentation } from '../entities/presentation'
const debug = Debug('veramo:typeorm:identifier-store')

export class DIDStore extends AbstractDIDStore {
  constructor(private dbConnection: Promise<Connection>) {
    super()
  }

  async get({
    did,
    alias,
    provider,
  }: {
    did: string
    alias: string
    provider: string
  }): Promise<IIdentifier> {
    let where = {}
    if (did !== undefined && alias === undefined) {
      where = { did }
    } else if (did === undefined && alias !== undefined && provider !== undefined) {
      where = { alias, provider }
    } else {
      throw Error('[veramo:data-store:identifier-store] Get requires did or (alias and provider)')
    }

    const identifier = await (await this.dbConnection).getRepository(Identifier).findOne({
      where,
      relations: ['keys', 'services'],
    })

    if (!identifier) throw Error('Identifier not found')
    const result: IIdentifier = {
      did: identifier.did,
      controllerKeyId: identifier.controllerKeyId,
      provider: identifier.provider!!,
      services: identifier.services,
      keys: identifier.keys.map(
        (k) =>
          ({
            kid: k.kid,
            type: k.type,
            kms: k.kms,
            publicKeyHex: k.publicKeyHex,
            meta: k.meta,
          } as IKey),
      ),
    }
    if (identifier.alias) {
      result.alias = identifier.alias
    }
    return result
  }

  async delete({ did }: { did: string }) {
    const identifier = await (await this.dbConnection).getRepository(Identifier).findOne({
      where: { did },
      relations: ['keys', 'services', 'issuedCredentials', 'issuedPresentations'],
    })
    if (!identifier || typeof identifier === 'undefined') {
      return true
    }
    // some drivers don't support cascading so we delete these manually

    //unlink existing keys that are no longer tied to this identifier
    let existingKeys = identifier.keys.map((key) => {
      delete key.identifier
      return key
    })
    await (await this.dbConnection).getRepository(Key).save(existingKeys)

    if (identifier.issuedCredentials || typeof identifier.issuedCredentials !== 'undefined') {
      await (await this.dbConnection).getRepository(Credential).remove(identifier.issuedCredentials)
    }

    if (identifier.issuedPresentations || typeof identifier.issuedPresentations !== 'undefined') {
      await (await this.dbConnection).getRepository(Presentation).remove(identifier.issuedPresentations)
    }

    //delete existing services that are no longer tied to this identifier
    let oldServices = identifier.services
    const srvRepo = await (await this.dbConnection).getRepository(Service).remove(oldServices)

    if (!identifier) throw Error('Identifier not found')
    debug('Deleting', did)
    await (await this.dbConnection).getRepository(Identifier).remove(identifier)

    return true
  }

  async import(args: IIdentifier) {
    const identifier = new Identifier()
    identifier.did = args.did
    if (args.controllerKeyId) {
      identifier.controllerKeyId = args.controllerKeyId
    }
    identifier.provider = args.provider
    if (args.alias) {
      identifier.alias = args.alias
    }

    identifier.keys = []
    for (const argsKey of args.keys) {
      const key = new Key()
      key.kid = argsKey.kid
      key.publicKeyHex = argsKey.publicKeyHex
      key.kms = argsKey.kms
      key.meta = argsKey.meta
      identifier.keys.push(key)
    }

    identifier.services = []
    for (const argsService of args.services) {
      const service = new Service()
      service.id = argsService.id
      service.type = argsService.type
      service.serviceEndpoint = argsService.serviceEndpoint
      service.description = argsService.description
      identifier.services.push(service)
    }

    await (await this.dbConnection).getRepository(Identifier).save(identifier)

    debug('Saving', args.did)
    return true
  }

  async list(args: { alias?: string; provider?: string }): Promise<IIdentifier[]> {
    const where: any = { provider: args?.provider || Not(IsNull()) }
    if (args?.alias) {
      where['alias'] = args.alias
    }
    const identifiers = await (await this.dbConnection).getRepository(Identifier).find({
      where,
      relations: ['keys', 'services'],
    })
    return identifiers.map((identifier) => {
      const i = identifier
      if (i.alias === null) {
        delete i.alias
      }
      return i as IIdentifier
    })
  }
}
