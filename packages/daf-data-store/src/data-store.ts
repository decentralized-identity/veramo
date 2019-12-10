import { Message } from 'daf-core'
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
      iss: { did: row.iss },
      sub: { did: row.sub },
      jwt: row.jwt,
      nbf: row.nbf,
      iat: row.iat,
    }))
  }

  async credentialsForMessageId(id: string) {
    const query = sql
      .select('md.rowid', 'vc.*')
      .from('verifiable_credentials_meta_data as md')
      .leftJoin('verifiable_credentials as vc', { 'md.hash': 'vc.hash' })
      .where({ 'md.message_id': id })
      .toParams()

    const rows = await this.db.rows(query.text, query.values)

    return rows.map((row: any) => ({
      rowId: `${row.rowid}`,
      hash: row.hash,
      iss: { did: row.iss },
      sub: { did: row.sub },
      jwt: row.jwt,
      nbf: row.nbf,
      iat: row.iat,
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

  async findCredentialsByFields({
    iss,
    sub,
    claim_type,
  }: {
    iss?: string[]
    sub?: string[]
    claim_type: string
  }) {
    let where = {}

    if (iss) where = sql.and(where, sql.in('iss', iss))
    if (sub) where = sql.and(where, sql.in('sub', sub))
    if (claim_type) where = sql.and(where, { claim_type })

    const query = sql
      .select('rowid', '*')
      .from('verifiable_credentials_fields')
      .where(where)
      .toParams()

    const rows = await this.db.rows(query.text, query.values)

    const hashes = rows.map((row: any) => row.parent_hash)

    const query2 = sql
      .select('rowid', '*')
      .from('verifiable_credentials')
      .where(sql.in('hash', hashes))
      .toParams()

    const rows2 = await this.db.rows(query2.text, query2.values)

    return rows2.map((row: any) => ({
      rowId: `${row.rowid}`,
      hash: row.hash,
      iss: { did: row.iss },
      sub: { did: row.sub },
      jwt: row.jwt,
      nbf: row.nbf,
      iat: row.iat,
      exp: row.exp,
    }))
  }

  async findMessages({
    sender,
    receiver,
    threadId,
    limit,
  }: {
    sender?: string
    receiver?: string
    threadId?: string
    limit?: number
  }) {
    let where = {}

    if (sender && receiver) {
      where = sql.or(where, { sender, receiver })
    } else {
      if (sender) where = sql.and(where, { sender })
      if (receiver) where = sql.and(where, { receiver })
    }
    if (sender || receiver) {
      where = sql.or(where, { receiver: null })
    }
    if (threadId) where = sql.and(where, { thread_id: threadId })

    let query = sql
      .select('rowid', '*')
      .from('messages')
      .where(where)
      .orderBy('timestamp desc')

    if (limit) {
      query = query.limit(limit)
    }

    query = query.toParams()

    const rows = await this.db.rows(query.text, query.values)
    return rows.map((row: any) => ({
      rowId: `${row.rowid}`,
      id: row.id,
      sender: row.sender ? { did: row.sender } : null,
      receiver: row.receiver ? { did: row.receiver } : null,
      type: row.type,
      threadId: row.thread_id,
      data: row.data,
      raw: row.raw,
      timestamp: row.timestamp,
    }))
  }

  async findMessage(id: string) {
    const query = sql
      .select('rowid', '*')
      .from('messages')
      .where({ id })
      .toParams()

    const rows = await this.db.rows(query.text, query.values)

    const mapped = rows.map((row: any) => ({
      rowId: `${row.rowid}`,
      id: row.id,
      sender: row.sender ? { did: row.sender } : null,
      receiver: row.receiver ? { did: row.receiver } : null,
      type: row.type,
      threadId: row.thread_id,
      data: row.data,
      raw: row.raw,
      timestamp: row.timestamp,
    }))

    return mapped[0]
  }

  async allIdentities() {
    const vcSubjects = await this.db.rows('select distinct sub as did from verifiable_credentials', null)
    const vcIssuers = await this.db.rows('select distinct iss as did from verifiable_credentials', null)
    const messageReceivers = await this.db.rows(
      'select distinct receiver as did from messages where receiver is not null',
      null,
    )
    const messageSenders = await this.db.rows(
      'select distinct sender as did from messages where sender is not null',
      null,
    )
    const uniqueDids = [
      ...new Set([
        ...messageReceivers.map((item: any) => item.did),
        ...messageSenders.map((item: any) => item.did),
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
        sql.or(sql.and({ sender: did1 }, { receiver: did2 }), sql.and({ sender: did2 }, { receiver: did1 })),
      )
      .toParams()
    const rows = await this.db.rows(query.text, query.values)

    return rows[0] && rows[0].count
  }

  async latestMessageTimestamps() {
    let query = `SELECT * FROM ( SELECT m.id, m."timestamp", m.receiver AS did, md. "type" AS sourceType, md.id AS sourceId FROM messages AS m
      LEFT JOIN messages_meta_data AS md ON m.id = md.message_id order by m.timestamp desc) GROUP BY did, sourceType`

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

  async saveMessage(message: Message) {
    const messageId = message.id

    // Check if the message is already saved
    const searchQuery = sql
      .select('id')
      .from('messages')
      .where({ id: messageId })
      .toParams()
    const searchResult = await this.db.rows(searchQuery.text, searchQuery.values)
    if (searchResult.length > 0) {
      this.updateMetaData(message)
    } else {
      const query = sql
        .insert('messages', {
          id: messageId,
          sender: message.sender,
          receiver: message.receiver,
          timestamp: message.timestamp,
          type: message.type,
          thread_id: message.threadId,
          raw: message.raw,
          data: message.data && JSON.stringify(message.data),
        })
        .toParams()

      await this.db.run(query.text, query.values)

      await this.saveMetaData(message)
      await this.saveVerifiableCredentials(message)
    }

    return { hash: message.id, iss: { did: message.sender } }
  }

  private async updateMetaData(message: Message) {
    const { id, allMeta } = message
    for (const metaData of allMeta) {
      const query = sql
        .select('type, id, data')
        .from('messages_meta_data')
        .where({
          message_id: id,
          type: metaData.type,
          id: metaData.id,
        })
        .toParams()
      const rows = await this.db.rows(query.text, query.values)
      if (rows.length === 0) {
        const insertQuery = sql
          .insert('messages_meta_data', {
            message_id: id,
            type: metaData.type,
            id: metaData.id,
            data: metaData.data && JSON.stringify(metaData.data),
          })
          .toParams()
        await this.db.run(insertQuery.text, insertQuery.values)
      }
    }
  }

  private async saveMetaData(message: Message) {
    const messageId = message.id

    for (const metaData of message.allMeta) {
      const query = sql
        .insert('messages_meta_data', {
          message_id: messageId,
          type: metaData.type,
          id: metaData.id,
          data: metaData.data && JSON.stringify(metaData.data),
        })
        .toParams()
      await this.db.run(query.text, query.values)
    }
  }

  async saveVerifiableCredentials(message: Message) {
    const messageId = message.id

    if (message.type == 'w3c.vp' || message.type == 'w3c.vc') {
      for (const vc of message.vc) {
        await this.saveVerifiableCredential(vc, messageId)
      }
    }
  }

  async saveVerifiableCredential(vc: any, messageId: string) {
    const verifiableCredential = vc.payload as any

    const vcHash = blake.blake2bHex(vc.jwt)

    const metaData = sql
      .insert('verifiable_credentials_meta_data', {
        message_id: messageId,
        hash: vcHash,
      })
      .toParams()

    await this.db.run(metaData.text, metaData.values)

    // Check if
    const searchQuery = sql
      .select('hash')
      .from('verifiable_credentials')
      .where({ hash: vcHash })
      .toParams()
    const searchResult = await this.db.rows(searchQuery.text, searchQuery.values)
    if (searchResult.length > 0) {
      return vcHash
    }

    const query = sql
      .insert('verifiable_credentials', {
        hash: vcHash,
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
        const isObj = typeof value === 'function' || (typeof value === 'object' && !!value)

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

  async findMessagesByVC(hash: string) {
    let query = sql
      .select('md.rowid', 'm.*')
      .from('verifiable_credentials_meta_data as md')
      .leftJoin('messages as m', { 'md.message_id': 'm.id' })
      .where({ 'md.hash': hash })

    query = query.toParams()

    const rows = await this.db.rows(query.text, query.values)
    return rows.map((row: any) => ({
      rowId: `${row.rowid}`,
      id: row.id,
      sender: row.sender ? { did: row.sender } : null,
      receiver: row.receiver ? { did: row.receiver } : null,
      type: row.type,
      threadId: row.thread_id,
      data: row.data,
      raw: row.raw,
      timestamp: row.timestamp,
    }))
  }

  async messageMetaData(id: string) {
    let query = sql
      .select('rowid', '*')
      .from('messages_meta_data')
      .where({ message_id: id })

    query = query.toParams()

    const rows = await this.db.rows(query.text, query.values)
    return rows.map((row: any) => ({
      rowId: `${row.rowid}`,
      type: row.type,
      id: row.id,
      data: row.data,
    }))
  }

  deleteMessage(hash: string) {
    return this.db.run('DELETE FROM messages where hash=?', [hash])
  }
}
