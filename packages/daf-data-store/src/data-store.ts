import { Types } from 'daf-core'
import { DbDriver } from './types'
import { runMigrations } from './migrations'
import sql from 'sql-bricks-sqlite'
import blake from 'blakejs'

export class DataStore {
  private db: DbDriver

  constructor(dbDriver: DbDriver) {
    this.db = dbDriver
  }

  initialize() {
    return runMigrations(this.db)
  }

  async findCredentials({ iss, sub }: { iss?: string; sub?: string }) {
    let where = {}

    if (iss && sub) {
      where = sql.or(where, { iss, sub })
    } else {
      if (iss) where = sql.and(where, { iss })
      if (sub) where = sql.and(where, { sub })
    }

    const query = sql
      .select('rowid', '*')
      .from('verifiable_credentials')
      .where(where)
      .orderBy('nbf desc')
      .toParams()

    const rows = await this.db.rows(query.text, query.values)

    return rows.map((row: any) => ({
      rowId: `${row.rowid}`,
      hash: row.hash,
      parentHash: row.parent_hash,
      iss: { did: row.iss },
      sub: { did: row.sub },
      jwt: row.jwt,
      nbf: row.nbf,
    }))
  }

  async credentialsForMessageHash(hash: string) {
    const query = sql
      .select('rowid', '*')
      .from('verifiable_credentials')
      .where({ parent_hash: hash })
      .toParams()

    const rows = await this.db.rows(query.text, query.values)

    return rows.map((row: any) => ({
      rowId: `${row.rowid}`,
      hash: row.hash,
      parentHash: row.parent_hash,
      iss: { did: row.iss },
      sub: { did: row.sub },
      jwt: row.jwt,
      nbf: row.nbf,
      exp: row.exp,
    }))
  }

  async credentialsFieldsForClaimHash(hash: string) {
    const query = sql
      .select('rowid', '*')
      .from('verifiable_credentials_fields')
      .where({ parent_hash: hash })
      .toParams()

    const rows = await this.db.rows(query.text, query.values)

    return rows.map((row: any) => ({
      rowId: `${row.rowid}`,
      hash: row.hash,
      parentHash: row.parent_hash,
      iss: { did: row.iss },
      sub: { did: row.sub },
      type: row.claim_type,
      value: row.claim_value,
      isObj: row.is_obj === 1,
    }))
  }

  async findMessages({
    iss,
    sub,
    tag,
    limit,
  }: {
    iss?: string
    sub?: string
    tag?: string
    limit?: number
  }) {
    let where = {}

    if (iss && sub) {
      where = sql.or(where, { iss, sub })
    } else {
      if (iss) where = sql.and(where, { iss })
      if (sub) where = sql.and(where, { sub })
    }
    if (tag) where = sql.and(where, { tag })

    let query = sql
      .select('rowid', '*')
      .from('messages')
      .where(where)
      .orderBy('nbf desc')

    if (limit) {
      query = query.limit(limit)
    }

    query = query.toParams()

    const rows = await this.db.rows(query.text, query.values)
    return rows.map((row: any) => ({
      rowId: `${row.rowid}`,
      hash: row.hash,
      iss: { did: row.iss },
      sub: { did: row.sub },
      type: row.type,
      data: row.data,
      jwt: row.jwt,
      nbf: row.nbf,
      iat: row.iat,
    }))
  }

  async findMessage(hash: string) {
    const query = sql
      .select('rowid', '*')
      .from('messages')
      .where({ hash })
      .toParams()

    const rows = await this.db.rows(query.text, query.values)

    const mapped = rows.map((row: any) => ({
      rowId: `${row.rowid}`,
      hash: row.hash,
      iss: { did: row.iss },
      sub: { did: row.sub },
      type: row.type,
      jwt: row.jwt,
      data: row.data,
      nbf: row.nbf,
    }))

    return mapped[0]
  }

  async allIdentities() {
    const vcSubjects = await this.db.rows(
      'select distinct sub as did from verifiable_credentials',
      null,
    )
    const vcIssuers = await this.db.rows(
      'select distinct iss as did from verifiable_credentials',
      null,
    )
    const messageSubjects = await this.db.rows(
      'select distinct sub as did from messages where sub is not null',
      null,
    )
    const messageIssuers = await this.db.rows(
      'select distinct iss as did from messages',
      null,
    )
    const uniqueDids = [
      ...new Set([
        ...messageSubjects.map((item: any) => item.did),
        ...messageIssuers.map((item: any) => item.did),
        ...vcIssuers.map((item: any) => item.did),
        ...vcSubjects.map((item: any) => item.did),
      ]),
    ].map(did => ({ did }))

    return uniqueDids
  }

  async findIdentityByDid(did: string) {
    return { did }
  }

  async popularClaimForDid(did: string, claimType: string) {
    const rows = await this.db.rows(
      `select * from (
      select sub, claim_value from "verifiable_credentials_fields"  where claim_type=? group by sub, claim_type, claim_value
      order by count(claim_value) asc ) where sub=? group by sub;`,
      [claimType, did],
    )
    return rows[0] && rows[0].claim_value
  }

  async interactionCount(did1: string, did2: string) {
    let query = sql
      .select('count(*) as count')
      .from('messages')
      .where(
        sql.or(
          sql.and({ iss: did1 }, { sub: did2 }),
          sql.and({ iss: did2 }, { sub: did1 }),
        ),
      )
      .toParams()
    const rows = await this.db.rows(query.text, query.values)

    return rows[0] && rows[0].count
  }

  async latestMessageTimestamps() {
    let query =
      'SELECT * from (select sub as did, nbf as timestamp, source_type as sourceType FROM messages ORDER BY nbf desc) GROUP BY did, sourceType'

    return await this.db.rows(query, [])
  }

  async shortId(did: string) {
    const name = await this.popularClaimForDid(did, 'name')
    if (name) {
      return name
    }
    const firstName = await this.popularClaimForDid(did, 'firstName')
    const lastName = await this.popularClaimForDid(did, 'lastName')
    let shortId = firstName
    shortId = lastName ? `${firstName && firstName + ' '}${lastName}` : shortId
    shortId = !shortId ? `${did.slice(0, 15)}...${did.slice(-4)}` : shortId
    return shortId
  }

  async saveMessage(message: Types.ValidatedMessage) {
    const source_type = message.meta && message.meta[0].sourceType
    const source_id = message.meta && message.meta[0].sourceId
    const query = sql
      .insert('messages', {
        hash: message.hash,
        iss: message.issuer,
        sub: message.subject,
        nbf: message.time,
        type: message.type,
        jwt: message.raw,
        meta: message.meta && JSON.stringify(message.meta),
        source_type,
        source_id,
      })
      .toParams()

    await this.db.run(query.text, query.values)

    if (message.type == 'w3c.vp' || message.type == 'w3c.vc') {
      for (const vc of message.custom.vc) {
        await this.saveVerifiableCredential(vc, message.hash)
      }
    }

    return { hash: message.hash, iss: { did: message.issuer } }
  }

  async saveVerifiableCredential(vc: any, messageHash: string) {
    const verifiableCredential = vc.payload as any

    const vcHash = blake.blake2bHex(vc.jwt)

    const query = sql
      .insert('verifiable_credentials', {
        hash: vcHash,
        parent_hash: messageHash,
        iss: verifiableCredential.iss,
        sub: verifiableCredential.sub,
        nbf: verifiableCredential.nbf,
        iat: verifiableCredential.iat,
        jwt: vc.jwt,
      })
      .toParams()

    await this.db.run(query.text, query.values)

    const claim = verifiableCredential.vc.credentialSubject

    for (const type in claim) {
      if (claim.hasOwnProperty(type)) {
        const value = claim[type]
        const isObj =
          typeof value === 'function' || (typeof value === 'object' && !!value)

        const fieldsQuery = sql
          .insert('verifiable_credentials_fields', {
            parent_hash: vcHash,
            iss: verifiableCredential.iss,
            sub: verifiableCredential.sub,
            nbf: verifiableCredential.nbf,
            iat: verifiableCredential.iat,
            claim_type: type,
            claim_value: isObj ? JSON.stringify(value) : value,
            is_obj: isObj ? 1 : 0,
          })
          .toParams()

        await this.db.run(fieldsQuery.text, fieldsQuery.values)
      }
    }

    return vcHash
  }

  deleteMessage(hash: string) {
    return this.db.run('DELETE FROM messages where hash=?', [hash])
  }
}
