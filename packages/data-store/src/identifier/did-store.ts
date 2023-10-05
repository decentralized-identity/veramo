import { IIdentifier, IKey } from '@veramo/core-types'
import { AbstractDIDStore } from '@veramo/did-manager'
import { Identifier } from '../entities/identifier.js'
import { Credential } from '../entities/credential.js'
import { Key } from '../entities/key.js'
import { Service } from '../entities/service.js'
import { DataSource, IsNull, Not } from 'typeorm'

import Debug from 'debug'
import { Presentation } from '../entities/presentation.js'
import { OrPromise } from "@veramo/utils";
import { getConnectedDb } from "../utils.js";

const debug = Debug('veramo:typeorm:identifier-store')

/**
 * An implementation of {@link @veramo/did-manager#AbstractDIDStore | AbstractDIDStore} that uses a TypeORM database to
 * store the relationships between DIDs, their providers and controllers and their keys and services as they are known
 * and managed by a Veramo agent.
 *
 * An instance of this class can be used by {@link @veramo/did-manager#DIDManager} as the data storage layer.
 *
 * To make full use of this class, it should use the same database as the one used by
 * {@link @veramo/data-store#KeyStore | KeyStore}.
 *
 * @public
 */
export class DIDStore extends AbstractDIDStore {
  constructor(private dbConnection: OrPromise<DataSource>) {
    super()
  }

  async getDID({
    did,
    alias,
    provider,
  }: {
    did: string
    alias: string
    provider: string
  }): Promise<IIdentifier> {
    let where: { did?: string; alias?: string; provider?: string } = {}
    if (did !== undefined && alias === undefined) {
      where = { did }
    } else if (did === undefined && alias !== undefined) {
      where = { alias }
    } else {
      throw Error('[veramo:data-store:identifier-store] Get requires did or (alias and provider)')
    }

    const identifier = await (await getConnectedDb(this.dbConnection)).getRepository(Identifier).findOne({
      where,
      relations: ['keys', 'services'],
    })

    if (!identifier) throw Error('Identifier not found')
    const result: IIdentifier = {
      did: identifier.did,
      controllerKeyId: identifier.controllerKeyId,
      provider: identifier.provider!!,
      services: identifier.services.map((service) => {
        let endpoint = service.serviceEndpoint.toString()
        try {
          endpoint = JSON.parse(service.serviceEndpoint)
        } catch {}
        return {
          id: service.id,
          type: service.type,
          serviceEndpoint: endpoint,
          description: service.description,
        }
      }),
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

  async deleteDID({ did }: { did: string }) {
    const identifier = await (await getConnectedDb(this.dbConnection)).getRepository(Identifier).findOne({
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
    await (await getConnectedDb(this.dbConnection)).getRepository(Key).save(existingKeys)

    if (identifier.issuedCredentials || typeof identifier.issuedCredentials !== 'undefined') {
      await (await getConnectedDb(this.dbConnection)).getRepository(Credential).remove(identifier.issuedCredentials)
    }

    if (identifier.issuedPresentations || typeof identifier.issuedPresentations !== 'undefined') {
      await (await getConnectedDb(this.dbConnection)).getRepository(Presentation).remove(identifier.issuedPresentations)
    }

    //delete existing services that are no longer tied to this identifier
    let oldServices = identifier.services
    const srvRepo = await (await getConnectedDb(this.dbConnection)).getRepository(Service).remove(oldServices)

    if (!identifier) throw Error('Identifier not found')
    debug('Deleting', did)
    await (await getConnectedDb(this.dbConnection)).getRepository(Identifier).remove(identifier)

    return true
  }

  async importDID(args: IIdentifier) {
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
      service.serviceEndpoint = (typeof argsService.serviceEndpoint === 'string') ? argsService.serviceEndpoint : JSON.stringify(argsService.serviceEndpoint)
      service.description = argsService.description
      identifier.services.push(service)
    }

    await (await getConnectedDb(this.dbConnection)).getRepository(Identifier).save(identifier)

    debug('Saving', args.did)
    return true
  }

  async listDIDs(args: { alias?: string; provider?: string }): Promise<IIdentifier[]> {
    const where: any = { provider: args?.provider || Not(IsNull()) }
    if (args?.alias) {
      where['alias'] = args.alias
    }
    const identifiers = await (await getConnectedDb(this.dbConnection)).getRepository(Identifier).find({
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
