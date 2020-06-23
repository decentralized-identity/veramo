import {
  IAgentPlugin,
  IMessage,
  IVerifiableCredential,
  IVerifiablePresentation,
  IPluginMethodMap,
} from 'daf-core'
import { Message, createMessage } from './entities/message'
import { Claim } from './entities/claim'
import { Credential } from './entities/credential'
import { Presentation } from './entities/presentation'
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
  FindArgs,
} from './types'

interface IContext {
  authenticatedDid?: string
}

export interface IDataStoreORM extends IPluginMethodMap {
  dataStoreORMGetMessages: (args: FindArgs<TMessageColumns>, context: IContext) => Promise<IMessage[]>
  dataStoreORMGetMessagesCount: (args: FindArgs<TMessageColumns>, context: IContext) => Promise<number>
  dataStoreORMGetVerifiableCredentialsByClaims: (
    args: FindArgs<TClaimsColumns>,
    context: IContext,
  ) => Promise<IVerifiableCredential[]>
  dataStoreORMGetVerifiableCredentialsByClaimsCount: (
    args: FindArgs<TClaimsColumns>,
    context: IContext,
  ) => Promise<number>
  dataStoreORMGetVerifiableCredentials: (
    args: FindArgs<TCredentialColumns>,
    context: IContext,
  ) => Promise<IVerifiableCredential[]>
  dataStoreORMGetVerifiableCredentialsCount: (
    args: FindArgs<TCredentialColumns>,
    context: IContext,
  ) => Promise<number>
  dataStoreORMGetVerifiablePresentations: (
    args: FindArgs<TPresentationColumns>,
    context: IContext,
  ) => Promise<IVerifiablePresentation[]>
  dataStoreORMGetVerifiablePresentationsCount: (
    args: FindArgs<TPresentationColumns>,
    context: IContext,
  ) => Promise<number>
}

export class DataStoreORM implements IAgentPlugin {
  readonly methods: IDataStoreORM
  private dbConnection: Promise<Connection>

  constructor(dbConnection: Promise<Connection>) {
    this.dbConnection = dbConnection

    this.methods = {
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
  ): Promise<IVerifiableCredential[]> {
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
  ): Promise<IVerifiableCredential[]> {
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
      .leftJoinAndSelect('presentation.issuer', 'issuer')
      .leftJoinAndSelect('presentation.audience', 'audience')
      .where(where)
    qb = decorateQB(qb, 'presentation', args)
    qb = addAudienceQuery(args, qb)
    if (context.authenticatedDid) {
      qb = qb.andWhere(
        new Brackets(qb => {
          qb.where('audience.did = :ident', {
            ident: context.authenticatedDid,
          }).orWhere('presentation.issuer = :ident', { ident: context.authenticatedDid })
        }),
      )
    }
    return qb
  }

  async dataStoreORMGetVerifiablePresentations(
    args: FindArgs<TPresentationColumns>,
    context: IContext,
  ): Promise<IVerifiablePresentation[]> {
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
      throw new Error(`${item.op} not compatable with DID argument`)
    case 'In':
    default:
      return ['IN (:...value)', item.value]
  }
}

function addAudienceQuery(input: FindArgs<any>, qb: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
  if (!Array.isArray(input.where)) {
    return qb
  }
  const audienceWhere = input.where.find(item => item.column === 'audience')
  if (!audienceWhere) {
    return qb
  }
  const [op, value] = opToSQL(audienceWhere)
  return qb.andWhere(`audience.did ${op}`, { value })
}

function createWhereObject(
  input: FindArgs<TMessageColumns | TClaimsColumns | TCredentialColumns | TPresentationColumns>,
): any {
  if (input?.where) {
    const where: Record<string, any> = {}
    for (const item of input.where) {
      if (item.column === 'audience') {
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
