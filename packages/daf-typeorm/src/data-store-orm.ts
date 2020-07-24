import {
  IAgentPlugin,
  IMessage,
  VerifiableCredential,
  VerifiablePresentation,
  IPluginMethodMap,
  IIdentity,
} from 'daf-core'
import { Message, createMessage } from './entities/message'
import { Claim } from './entities/claim'
import { Credential } from './entities/credential'
import { Presentation } from './entities/presentation'
import { Identity } from './entities/identity'
import {
  Connection,
  Not,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Equal,
  Like,
  Between,
  In,
  Any,
  IsNull,
  SelectQueryBuilder,
  Brackets,
} from 'typeorm'
import {
  Where,
  TClaimsColumns,
  TCredentialColumns,
  TMessageColumns,
  TPresentationColumns,
  TIdentitiesColumns,
  FindArgs,
} from './types'

interface IContext {
  authenticatedDid?: string
}

export type FindIdentitiesArgs = FindArgs<TIdentitiesColumns>
export type FindMessagesArgs = FindArgs<TMessageColumns>
export type FindClaimsArgs = FindArgs<TClaimsColumns>
export type FindCredentialsArgs = FindArgs<TCredentialColumns>
export type FindPresentationsArgs = FindArgs<TPresentationColumns>

export interface IDataStoreORM extends IPluginMethodMap {
  dataStoreORMGetIdentities(args: FindIdentitiesArgs, context: IContext): Promise<Array<IIdentity>>
  dataStoreORMGetIdentitiesCount(args: FindIdentitiesArgs, context: IContext): Promise<number>
  dataStoreORMGetMessages(args: FindMessagesArgs, context: IContext): Promise<Array<IMessage>>
  dataStoreORMGetMessagesCount(args: FindMessagesArgs, context: IContext): Promise<number>
  dataStoreORMGetVerifiableCredentialsByClaims(
    args: FindClaimsArgs,
    context: IContext,
  ): Promise<Array<VerifiableCredential>>
  dataStoreORMGetVerifiableCredentialsByClaimsCount(args: FindClaimsArgs, context: IContext): Promise<number>
  dataStoreORMGetVerifiableCredentials(
    args: FindCredentialsArgs,
    context: IContext,
  ): Promise<Array<VerifiableCredential>>
  dataStoreORMGetVerifiableCredentialsCount(args: FindCredentialsArgs, context: IContext): Promise<number>
  dataStoreORMGetVerifiablePresentations(
    args: FindPresentationsArgs,
    context: IContext,
  ): Promise<Array<VerifiablePresentation>>
  dataStoreORMGetVerifiablePresentationsCount(args: FindPresentationsArgs, context: IContext): Promise<number>
}

export class DataStoreORM implements IAgentPlugin {
  readonly methods: IDataStoreORM
  private dbConnection: Promise<Connection>

  constructor(dbConnection: Promise<Connection>) {
    this.dbConnection = dbConnection

    this.methods = {
      dataStoreORMGetIdentities: this.dataStoreORMGetIdentities.bind(this),
      dataStoreORMGetIdentitiesCount: this.dataStoreORMGetIdentitiesCount.bind(this),
      dataStoreORMGetMessages: this.dataStoreORMGetMessages.bind(this),
      dataStoreORMGetMessagesCount: this.dataStoreORMGetMessagesCount.bind(this),
      dataStoreORMGetVerifiableCredentialsByClaims: this.dataStoreORMGetVerifiableCredentialsByClaims.bind(
        this,
      ),
      dataStoreORMGetVerifiableCredentialsByClaimsCount: this.dataStoreORMGetVerifiableCredentialsByClaimsCount.bind(
        this,
      ),
      dataStoreORMGetVerifiableCredentials: this.dataStoreORMGetVerifiableCredentials.bind(this),
      dataStoreORMGetVerifiableCredentialsCount: this.dataStoreORMGetVerifiableCredentialsCount.bind(this),
      dataStoreORMGetVerifiablePresentations: this.dataStoreORMGetVerifiablePresentations.bind(this),
      dataStoreORMGetVerifiablePresentationsCount: this.dataStoreORMGetVerifiablePresentationsCount.bind(
        this,
      ),
    }
  }

  // Identities

  private async identitiesQuery(
    args: FindArgs<TIdentitiesColumns>,
    context: IContext,
  ): Promise<SelectQueryBuilder<Identity>> {
    const where = createWhereObject(args)
    let qb = (await this.dbConnection)
      .getRepository(Identity)
      .createQueryBuilder('identity')
      .leftJoinAndSelect('identity.keys', 'keys')
      .leftJoinAndSelect('identity.services', 'services')
      .where(where)
    qb = decorateQB(qb, 'message', args)
    return qb
  }

  async dataStoreORMGetIdentities(
    args: FindArgs<TIdentitiesColumns>,
    context: IContext,
  ): Promise<IIdentity[]> {
    const identities = await (await this.identitiesQuery(args, context)).getMany()
    return identities
  }

  async dataStoreORMGetIdentitiesCount(
    args: FindArgs<TIdentitiesColumns>,
    context: IContext,
  ): Promise<number> {
    return await (await this.identitiesQuery(args, context)).getCount()
  }

  // Messages

  private async messagesQuery(
    args: FindArgs<TMessageColumns>,
    context: IContext,
  ): Promise<SelectQueryBuilder<Message>> {
    const where = createWhereObject(args)
    let qb = (await this.dbConnection)
      .getRepository(Message)
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.from', 'from')
      .leftJoinAndSelect('message.to', 'to')
      .where(where)
    qb = decorateQB(qb, 'message', args)
    if (context.authenticatedDid) {
      qb = qb.andWhere(
        new Brackets(qb => {
          qb.where('message.to = :ident', { ident: context.authenticatedDid }).orWhere(
            'message.from = :ident',
            {
              ident: context.authenticatedDid,
            },
          )
        }),
      )
    }
    return qb
  }

  async dataStoreORMGetMessages(args: FindArgs<TMessageColumns>, context: IContext): Promise<IMessage[]> {
    const messages = await (await this.messagesQuery(args, context)).getMany()
    return messages.map(createMessage)
  }

  async dataStoreORMGetMessagesCount(args: FindArgs<TMessageColumns>, context: IContext): Promise<number> {
    return (await this.messagesQuery(args, context)).getCount()
  }

  // Claims

  private async claimsQuery(
    args: FindArgs<TClaimsColumns>,
    context: IContext,
  ): Promise<SelectQueryBuilder<Claim>> {
    const where = createWhereObject(args)
    let qb = (await this.dbConnection)
      .getRepository(Claim)
      .createQueryBuilder('claim')
      .leftJoinAndSelect('claim.issuer', 'issuer')
      .leftJoinAndSelect('claim.subject', 'subject')
      .where(where)
    qb = decorateQB(qb, 'claim', args)
    qb = qb.leftJoinAndSelect('claim.credential', 'credential')
    if (context.authenticatedDid) {
      qb = qb.andWhere(
        new Brackets(qb => {
          qb.where('claim.subject = :ident', { ident: context.authenticatedDid }).orWhere(
            'claim.issuer = :ident',
            {
              ident: context.authenticatedDid,
            },
          )
        }),
      )
    }
    return qb
  }

  async dataStoreORMGetVerifiableCredentialsByClaims(
    args: FindArgs<TClaimsColumns>,
    context: IContext,
  ): Promise<VerifiableCredential[]> {
    const claims = await (await this.claimsQuery(args, context)).getMany()
    return claims.map(claim => claim.credential.raw)
  }

  async dataStoreORMGetVerifiableCredentialsByClaimsCount(
    args: FindArgs<TClaimsColumns>,
    context: IContext,
  ): Promise<number> {
    return (await this.claimsQuery(args, context)).getCount()
  }

  // Credentials

  private async credentialsQuery(
    args: FindArgs<TCredentialColumns>,
    context: IContext,
  ): Promise<SelectQueryBuilder<Credential>> {
    const where = createWhereObject(args)
    let qb = (await this.dbConnection)
      .getRepository(Credential)
      .createQueryBuilder('credential')
      .leftJoinAndSelect('credential.issuer', 'issuer')
      .leftJoinAndSelect('credential.subject', 'subject')
      .where(where)
    qb = decorateQB(qb, 'credential', args)
    if (context.authenticatedDid) {
      qb = qb.andWhere(
        new Brackets(qb => {
          qb.where('credential.subject = :ident', { ident: context.authenticatedDid }).orWhere(
            'credential.issuer = :ident',
            {
              ident: context.authenticatedDid,
            },
          )
        }),
      )
    }
    return qb
  }

  async dataStoreORMGetVerifiableCredentials(
    args: FindArgs<TCredentialColumns>,
    context: IContext,
  ): Promise<VerifiableCredential[]> {
    const credentials = await (await this.credentialsQuery(args, context)).getMany()
    return credentials.map(vc => vc.raw)
  }

  async dataStoreORMGetVerifiableCredentialsCount(
    args: FindArgs<TCredentialColumns>,
    context: IContext,
  ): Promise<number> {
    return (await this.credentialsQuery(args, context)).getCount()
  }

  // Presentations

  private async presentationsQuery(
    args: FindArgs<TPresentationColumns>,
    context: IContext,
  ): Promise<SelectQueryBuilder<Presentation>> {
    const where = createWhereObject(args)
    let qb = (await this.dbConnection)
      .getRepository(Presentation)
      .createQueryBuilder('presentation')
      .leftJoinAndSelect('presentation.holder', 'holder')
      .leftJoinAndSelect('presentation.verifier', 'verifier')
      .where(where)
    qb = decorateQB(qb, 'presentation', args)
    qb = addVerifierQuery(args, qb)
    if (context.authenticatedDid) {
      qb = qb.andWhere(
        new Brackets(qb => {
          qb.where('verifier.did = :ident', {
            ident: context.authenticatedDid,
          }).orWhere('presentation.holder = :ident', { ident: context.authenticatedDid })
        }),
      )
    }
    return qb
  }

  async dataStoreORMGetVerifiablePresentations(
    args: FindArgs<TPresentationColumns>,
    context: IContext,
  ): Promise<VerifiablePresentation[]> {
    const presentations = await (await this.presentationsQuery(args, context)).getMany()
    return presentations.map(vp => vp.raw)
  }

  async dataStoreORMGetVerifiablePresentationsCount(
    args: FindArgs<TPresentationColumns>,
    context: IContext,
  ): Promise<number> {
    return (await this.presentationsQuery(args, context)).getCount()
  }
}

function opToSQL(item: Where<any>): any[] {
  switch (item.op) {
    case 'IsNull':
      return ['IS NULL', '']
    case 'Like':
      if (item.value?.length != 1) throw Error('Operation Equal requires one value')
      return ['LIKE :value', item.value[0]]
    case 'Equal':
      if (item.value?.length != 1) throw Error('Operation Equal requires one value')
      return ['= :value', item.value[0]]
    case 'Any':
    case 'Between':
    case 'LessThan':
    case 'LessThanOrEqual':
    case 'MoreThan':
    case 'MoreThanOrEqual':
      throw new Error(`${item.op} not compatible with DID argument`)
    case 'In':
    default:
      return ['IN (:...value)', item.value]
  }
}

function addVerifierQuery(input: FindArgs<any>, qb: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
  if (!Array.isArray(input.where)) {
    return qb
  }
  const verifierWhere = input.where.find(item => item.column === 'verifier')
  if (!verifierWhere) {
    return qb
  }
  const [op, value] = opToSQL(verifierWhere)
  return qb.andWhere(`verifier.did ${op}`, { value })
}

function createWhereObject(
  input: FindArgs<
    TMessageColumns | TClaimsColumns | TCredentialColumns | TPresentationColumns | TIdentitiesColumns
  >,
): any {
  if (input?.where) {
    const where: Record<string, any> = {}
    for (const item of input.where) {
      if (item.column === 'verifier') {
        continue
      }
      switch (item.op) {
        case 'Any':
          if (!Array.isArray(item.value)) throw Error('Operator Any requires value to be an array')
          where[item.column] = Any(item.value)
          break
        case 'Between':
          if (item.value?.length != 2) throw Error('Operation Between requires two values')
          where[item.column] = Between(item.value[0], item.value[1])
          break
        case 'Equal':
          if (item.value?.length != 1) throw Error('Operation Equal requires one value')
          where[item.column] = Equal(item.value[0])
          break
        case 'IsNull':
          where[item.column] = IsNull()
          break
        case 'LessThan':
          if (item.value?.length != 1) throw Error('Operation LessThan requires one value')
          where[item.column] = LessThan(item.value[0])
          break
        case 'LessThanOrEqual':
          if (item.value?.length != 1) throw Error('Operation LessThanOrEqual requires one value')
          where[item.column] = LessThanOrEqual(item.value[0])
          break
        case 'Like':
          if (item.value?.length != 1) throw Error('Operation Like requires one value')
          where[item.column] = Like(item.value[0])
          break
        case 'MoreThan':
          if (item.value?.length != 1) throw Error('Operation MoreThan requires one value')
          where[item.column] = MoreThan(item.value[0])
          break
        case 'MoreThanOrEqual':
          if (item.value?.length != 1) throw Error('Operation MoreThanOrEqual requires one value')
          where[item.column] = MoreThanOrEqual(item.value[0])
          break
        case 'In':
        default:
          if (!Array.isArray(item.value)) throw Error('Operator IN requires value to be an array')
          where[item.column] = In(item.value)
      }
      if (item.not === true) {
        where[item.column] = Not(where[item.column])
      }
    }
    return where
  }
}

function decorateQB(
  qb: SelectQueryBuilder<any>,
  tableName: string,
  input: FindArgs<any>,
): SelectQueryBuilder<any> {
  if (input?.skip) qb = qb.skip(input.skip)
  if (input?.take) qb = qb.take(input.take)

  if (input?.order) {
    for (const item of input.order) {
      qb = qb.orderBy(
        qb.connection.driver.escape(tableName) + '.' + qb.connection.driver.escape(item.column),
        item.direction,
      )
    }
  }
  return qb
}
