import {
  IAgentPlugin,
  IDataStore,
  IDataStoreGetMessageArgs,
  IDataStoreGetVerifiableCredentialArgs,
  IDataStoreGetVerifiablePresentationArgs,
  IDataStoreSaveMessageArgs,
  IDataStoreSaveVerifiableCredentialArgs,
  IDataStoreSaveVerifiablePresentationArgs,
  IMessage,
  VerifiableCredential,
  VerifiablePresentation,
  schema,
  IDataStoreDeleteVerifiableCredentialArgs,
  IIdentifier,
  IKey,
  CredentialSubject,
} from '@veramo/core'
import { asArray, computeEntryHash, extractIssuer } from '@veramo/utils'
import structuredClone from '@ungap/structured-clone'
import { DefaultRecords, DiffCallback } from './types'
import { normalizeCredential } from 'did-jwt-vc'
import {
  FindArgs,
  TClaimsColumns,
  TCredentialColumns,
  TIdentifiersColumns,
  TMessageColumns,
  TPresentationColumns,
  UniqueVerifiableCredential,
  UniqueVerifiablePresentation,
} from '@veramo/data-store'

interface IContext {
  authenticatedDid?: string
}

export class DataStoreJson implements IAgentPlugin {
  readonly methods: IDataStore
  readonly schema = schema.IDataStore

  private readonly cacheTree: DefaultRecords
  private readonly updateCallback: DiffCallback
  private readonly useDirectReferences: boolean

  constructor(
    initialState: DefaultRecords,
    updateCallback?: DiffCallback | null,
    useDirectReferences: boolean = true,
  ) {
    this.cacheTree = useDirectReferences ? initialState : structuredClone(initialState)
    this.updateCallback = updateCallback instanceof Function ? updateCallback : () => Promise.resolve()
    this.useDirectReferences = useDirectReferences

    this.methods = {
      // IDataStore methods
      dataStoreSaveMessage: this.dataStoreSaveMessage.bind(this),
      dataStoreGetMessage: this.dataStoreGetMessage.bind(this),
      //dataStoreDeleteMessage: this.dataStoreDeleteMessage.bind(this),
      dataStoreSaveVerifiableCredential: this.dataStoreSaveVerifiableCredential.bind(this),
      dataStoreGetVerifiableCredential: this.dataStoreGetVerifiableCredential.bind(this),
      dataStoreDeleteVerifiableCredential: this.dataStoreDeleteVerifiableCredential.bind(this),
      dataStoreSaveVerifiablePresentation: this.dataStoreSaveVerifiablePresentation.bind(this),
      dataStoreGetVerifiablePresentation: this.dataStoreGetVerifiablePresentation.bind(this),
      //dataStoreDeleteVerifiablePresentation: this.dataStoreDeleteVerifiablePresentation.bind(this),

      // IDataStoreORM methods
      dataStoreORMGetIdentifiers: this.dataStoreORMGetIdentifiers.bind(this),
      dataStoreORMGetIdentifiersCount: this.dataStoreORMGetIdentifiersCount.bind(this),
      dataStoreORMGetMessages: this.dataStoreORMGetMessages.bind(this),
      dataStoreORMGetMessagesCount: this.dataStoreORMGetMessagesCount.bind(this),
      dataStoreORMGetVerifiableCredentialsByClaims:
        this.dataStoreORMGetVerifiableCredentialsByClaims.bind(this),
      dataStoreORMGetVerifiableCredentialsByClaimsCount:
        this.dataStoreORMGetVerifiableCredentialsByClaimsCount.bind(this),
      dataStoreORMGetVerifiableCredentials: this.dataStoreORMGetVerifiableCredentials.bind(this),
      dataStoreORMGetVerifiableCredentialsCount: this.dataStoreORMGetVerifiableCredentialsCount.bind(this),
      dataStoreORMGetVerifiablePresentations: this.dataStoreORMGetVerifiablePresentations.bind(this),
      dataStoreORMGetVerifiablePresentationsCount:
        this.dataStoreORMGetVerifiablePresentationsCount.bind(this),
    }
  }

  async dataStoreSaveMessage(args: IDataStoreSaveMessageArgs): Promise<string> {
    const id = args.message?.id || computeEntryHash(args.message)
    const message = { ...args.message, id }
    const oldTree = structuredClone(this.cacheTree)
    this.cacheTree.messages[id] = message
    // TODO: deprecate automatic credential and presentation saving
    asArray(message.credentials).forEach((verifiableCredential) =>
      this._dataStoreSaveVerifiableCredential({ verifiableCredential }, false),
    )
    asArray(message.presentations).forEach((verifiablePresentation) =>
      this._dataStoreSaveVerifiablePresentation({ verifiablePresentation }, false),
    )
    const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
    await this.updateCallback(oldTree, newTree)
    return message.id
  }

  async dataStoreGetMessage(args: IDataStoreGetMessageArgs): Promise<IMessage> {
    const message = this.cacheTree.messages[args.id]
    // FIXME: fix relations with credentials and presentations?
    if (message) {
      return message
    } else {
      throw Error('Message not found')
    }
  }

  private async _dataStoreSaveVerifiableCredential(
    args: IDataStoreSaveVerifiableCredentialArgs,
    postUpdates: boolean = true,
  ): Promise<string> {
    const _veramo_raw_credential =
      args?.verifiableCredential?.proof?.type === 'JwtProof2020' &&
      typeof args?.verifiableCredential?.proof?.jwt === 'string'
        ? args?.verifiableCredential?.proof?.jwt
        : args.verifiableCredential
    const _veramo_credential_hash = computeEntryHash(_veramo_raw_credential)
    const credential = { ...args.verifiableCredential, _veramo_raw_credential, _veramo_credential_hash }
    let oldTree: DefaultRecords
    if (postUpdates) {
      oldTree = structuredClone(this.cacheTree)
    }
    this.cacheTree.credentials[_veramo_credential_hash] = credential
    if (postUpdates) {
      const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
      await this.updateCallback(oldTree!!, newTree)
    }
    return credential._veramo_credential_hash
  }

  async dataStoreSaveVerifiableCredential(args: IDataStoreSaveVerifiableCredentialArgs): Promise<string> {
    return this._dataStoreSaveVerifiableCredential(args)
  }

  async dataStoreDeleteVerifiableCredential(
    args: IDataStoreDeleteVerifiableCredentialArgs,
  ): Promise<boolean> {
    const credential = this.cacheTree.credentials[args.hash]
    const oldTree = structuredClone(this.cacheTree)
    delete this.cacheTree.credentials[args.hash]
    const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
    await this.updateCallback(oldTree, newTree)
    return !!credential
  }

  async dataStoreGetVerifiableCredential(
    args: IDataStoreGetVerifiableCredentialArgs,
  ): Promise<VerifiableCredential> {
    const credentialEntity = this.cacheTree.credentials[args.hash]
    if (credentialEntity) {
      const { _veramo_raw_credential, _veramo_credential_hash, ...credential } =
        structuredClone(credentialEntity)
      // FIXME: do we return the RAW credential here?
      return credential
    } else {
      throw Error('Verifiable credential not found')
    }
  }

  private async _dataStoreSaveVerifiablePresentation(
    args: IDataStoreSaveVerifiablePresentationArgs,
    postUpdates: boolean = true,
  ): Promise<string> {
    const _veramo_raw_presentation =
      args?.verifiablePresentation?.proof?.type === 'JwtProof2020' &&
      typeof args?.verifiablePresentation?.proof?.jwt === 'string'
        ? args?.verifiablePresentation?.proof?.jwt
        : args.verifiablePresentation
    const _veramo_presentation_hash = computeEntryHash(_veramo_raw_presentation)
    const presentation = {
      ...args.verifiablePresentation,
      _veramo_presentation_hash,
      _veramo_raw_presentation,
    }
    let oldTree: DefaultRecords
    if (postUpdates) {
      oldTree = structuredClone(this.cacheTree)
    }
    this.cacheTree.presentations[_veramo_presentation_hash] = presentation

    asArray(presentation.verifiableCredential)
      .map((cred) => {
        if (typeof cred === 'string') {
          return normalizeCredential(cred)
        } else {
          return <VerifiableCredential>cred
        }
      })
      .forEach((verifiableCredential) => {
        this._dataStoreSaveVerifiableCredential({ verifiableCredential }, false)
      })

    if (postUpdates) {
      const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
      await this.updateCallback(oldTree!!, newTree)
    }
    return _veramo_presentation_hash
  }

  async dataStoreSaveVerifiablePresentation(args: IDataStoreSaveVerifiablePresentationArgs): Promise<string> {
    return this._dataStoreSaveVerifiablePresentation(args)
  }

  async dataStoreGetVerifiablePresentation(
    args: IDataStoreGetVerifiablePresentationArgs,
  ): Promise<VerifiablePresentation> {
    const presentationEntry = this.cacheTree.presentations[args.hash]
    if (presentationEntry) {
      const { _veramo_raw_presentation, _veramo_presentation_hash, ...presentation } = presentationEntry
      return presentation
    } else {
      throw Error('Verifiable presentation not found')
    }
  }

  // Identifiers

  // private async identifiersQuery(
  //   args: FindArgs<TIdentifiersColumns>,
  //   context: IContext,
  // ): Promise<SelectQueryBuilder<Identifier>> {
  //   const where = createWhereObject(args)
  //   let qb = (await this.dbConnection)
  //     .getRepository(Identifier)
  //     .createQueryBuilder('identifier')
  //     .leftJoinAndSelect('identifier.keys', 'keys')
  //     .leftJoinAndSelect('identifier.services', 'services')
  //     .where(where)
  //   qb = decorateQB(qb, 'message', args)
  //   return qb
  // }

  async dataStoreORMGetIdentifiers(
    args: FindArgs<TIdentifiersColumns>,
    context: IContext,
  ): Promise<IIdentifier[]> {
    let identifiers = Object.values(this.cacheTree.dids).filter((iid) => buildFilter(iid, args))
    if (args.skip) {
      identifiers = identifiers.slice(args.skip)
    }
    if (args.take) {
      identifiers = identifiers.slice(0, args.take)
    }
    // FIXME: collect corresponding keys from `this.cacheTree.keys`?
    return structuredClone(identifiers)
  }

  async dataStoreORMGetIdentifiersCount(
    args: FindArgs<TIdentifiersColumns>,
    context: IContext,
  ): Promise<number> {
    return (await this.dataStoreORMGetIdentifiers(args, context)).length
  }

  // Messages

  // private async messagesQuery(
  //   args: FindArgs<TMessageColumns>,
  //   context: IContext,
  // ): Promise<SelectQueryBuilder<Message>> {
  //   const where = createWhereObject(args)
  //   let qb = (await this.dbConnection)
  //     .getRepository(Message)
  //     .createQueryBuilder('message')
  //     .leftJoinAndSelect('message.from', 'from')
  //     .leftJoinAndSelect('message.to', 'to')
  //     .leftJoinAndSelect('message.credentials', 'credentials')
  //     .leftJoinAndSelect('message.presentations', 'presentations')
  //     .where(where)
  //   qb = decorateQB(qb, 'message', args)
  //   if (context.authenticatedDid) {
  //     qb = qb.andWhere(
  //       new Brackets((qb) => {
  //         qb.where('message.to = :ident', { ident: context.authenticatedDid }).orWhere(
  //           'message.from = :ident',
  //           {
  //             ident: context.authenticatedDid,
  //           },
  //         )
  //       }),
  //     )
  //   }
  //   return qb
  // }

  async dataStoreORMGetMessages(args: FindArgs<TMessageColumns>, context: IContext): Promise<IMessage[]> {
    let messages = Object.values(this.cacheTree.messages)
      .filter((msg) => buildFilter(msg, args))
      .filter(
        (msg) =>
          !context.authenticatedDid ||
          (context.authenticatedDid &&
            [...asArray(msg.to), ...asArray(msg.from)].includes(context.authenticatedDid)),
      )
    if (args.skip) {
      messages = messages.slice(args.skip)
    }
    if (args.take) {
      messages = messages.slice(0, args.take)
    }
    return structuredClone(messages)
  }

  async dataStoreORMGetMessagesCount(args: FindArgs<TMessageColumns>, context: IContext): Promise<number> {
    return (await this.dataStoreORMGetMessages(args, context)).length
  }

  // Claims

  // private async claimsQuery(
  //   args: FindArgs<TClaimsColumns>,
  //   context: IContext,
  // ): Promise<SelectQueryBuilder<Claim>> {
  //   const where = createWhereObject(args)
  //   let qb = (await this.dbConnection)
  //     .getRepository(Claim)
  //     .createQueryBuilder('claim')
  //     .leftJoinAndSelect('claim.issuer', 'issuer')
  //     .leftJoinAndSelect('claim.subject', 'subject')
  //     .where(where)
  //   qb = decorateQB(qb, 'claim', args)
  //   qb = qb.leftJoinAndSelect('claim.credential', 'credential')
  //   if (context.authenticatedDid) {
  //     qb = qb.andWhere(
  //       new Brackets((qb) => {
  //         qb.where('claim.subject = :ident', { ident: context.authenticatedDid }).orWhere(
  //           'claim.issuer = :ident',
  //           {
  //             ident: context.authenticatedDid,
  //           },
  //         )
  //       }),
  //     )
  //   }
  //   return qb
  // }

  async dataStoreORMGetVerifiableCredentialsByClaims(
    args: FindArgs<TClaimsColumns>,
    context: IContext,
  ): Promise<Array<UniqueVerifiableCredential>> {
    let filteredClaims = Object.values(this.cacheTree.credentials)
      .map((cred: VerifiableCredential) => {
        const issuer = extractIssuer(cred)
        const subject = cred.credentialSubject.id
        const _veramo_credential_hash = (cred as any)._veramo_credential_hash
        const credentialType = asArray(cred?.type).join(',')
        const context = asArray(cred?.['@context']).join(',')

        // build arrays of claims to mimic the SQL claims table
        return Object.entries(cred.credentialSubject).map(([type, value]) => ({
          type,
          value,
          issuer,
          subject,
          _veramo_credential_hash,
          credentialType,
          context,
        }))
      })
      .reduce((allClaims, claims) => [...allClaims, ...claims])
      .filter((claim) => buildFilter(claim, args))
      .filter(
        (claim) =>
          !context.authenticatedDid ||
          (context.authenticatedDid &&
            [...asArray(claim.issuer), ...asArray(claim.subject)].includes(context.authenticatedDid)),
      )

    if (args.skip) {
      filteredClaims = filteredClaims.slice(args.skip)
    }
    if (args.take) {
      filteredClaims = filteredClaims.slice(0, args.take)
    }

    let filteredCredentials = new Set<VerifiableCredential>()
    filteredClaims.forEach((claim) => {
      filteredCredentials.add(this.cacheTree.credentials[claim._veramo_credential_hash])
    })

    return structuredClone(
      Array.from(filteredCredentials).map((cred) => {
        const { _veramo_raw_credential, _veramo_credential_hash, ...credential } = cred
        return {
          hash: _veramo_credential_hash,
          verifiableCredential: credential,
        }
      }),
    )
  }

  async dataStoreORMGetVerifiableCredentialsByClaimsCount(
    args: FindArgs<TClaimsColumns>,
    context: IContext,
  ): Promise<number> {
    return (await this.dataStoreORMGetVerifiableCredentialsByClaims(args, context)).length
  }

  // Credentials

  // private async credentialsQuery(
  //   args: FindArgs<TCredentialColumns>,
  //   context: IContext,
  // ): Promise<SelectQueryBuilder<Credential>> {
  //   const where = createWhereObject(args)
  //   let qb = (await this.dbConnection)
  //     .getRepository(Credential)
  //     .createQueryBuilder('credential')
  //     .leftJoinAndSelect('credential.issuer', 'issuer')
  //     .leftJoinAndSelect('credential.subject', 'subject')
  //     .where(where)
  //   qb = decorateQB(qb, 'credential', args)
  //   if (context.authenticatedDid) {
  //     qb = qb.andWhere(
  //       new Brackets((qb) => {
  //         qb.where('credential.subject = :ident', { ident: context.authenticatedDid }).orWhere(
  //           'credential.issuer = :ident',
  //           {
  //             ident: context.authenticatedDid,
  //           },
  //         )
  //       }),
  //     )
  //   }
  //   return qb
  // }

  async dataStoreORMGetVerifiableCredentials(
    args: FindArgs<TCredentialColumns>,
    context: IContext,
  ): Promise<Array<UniqueVerifiableCredential>> {
    let credentials = Object.values(this.cacheTree.credentials)
      .map((cred) => ({
        ...cred,
        issuer: extractIssuer(cred),
        subject: cred.credentialSubject.id,
        context: asArray(cred['@context']).join(','),
        type: asArray(cred.type).join(','),
      }))
      .filter((cred) => buildFilter(cred, args))
      .filter(
        (cred) =>
          !context.authenticatedDid ||
          (context.authenticatedDid && [cred.issuer, cred.subject].includes(context.authenticatedDid)),
      )

    if (args.skip) {
      credentials = credentials.slice(args.skip)
    }
    if (args.take) {
      credentials = credentials.slice(0, args.take)
    }

    return structuredClone(
      credentials.map((cred: any) => {
        const { _veramo_raw_credential, _veramo_credential_hash, ...credential } = cred
        return {
          hash: _veramo_credential_hash,
          verifiableCredential: credential,
        }
      }),
    )
  }

  async dataStoreORMGetVerifiableCredentialsCount(
    args: FindArgs<TCredentialColumns>,
    context: IContext,
  ): Promise<number> {
    return (await this.dataStoreORMGetVerifiableCredentials(args, context)).length
  }

  // Presentations
  //
  // private async presentationsQuery(
  //   args: FindArgs<TPresentationColumns>,
  //   context: IContext,
  // ): Promise<SelectQueryBuilder<Presentation>> {
  //   const where = createWhereObject(args)
  //   let qb = (await this.dbConnection)
  //     .getRepository(Presentation)
  //     .createQueryBuilder('presentation')
  //     .leftJoinAndSelect('presentation.holder', 'holder')
  //     .leftJoinAndSelect('presentation.verifier', 'verifier')
  //     .where(where)
  //   qb = decorateQB(qb, 'presentation', args)
  //   qb = addVerifierQuery(args, qb)
  //   if (context.authenticatedDid) {
  //     qb = qb.andWhere(
  //       new Brackets((qb) => {
  //         qb.where('verifier.did = :ident', {
  //           ident: context.authenticatedDid,
  //         }).orWhere('presentation.holder = :ident', { ident: context.authenticatedDid })
  //       }),
  //     )
  //   }
  //   return qb
  // }

  async dataStoreORMGetVerifiablePresentations(
    args: FindArgs<TPresentationColumns>,
    context: IContext,
  ): Promise<Array<UniqueVerifiablePresentation>> {
    let presentations = Object.values(this.cacheTree.presentations)
      .map((pres) => ({
        context: asArray(pres['@context']).join(','),
        type: asArray(pres.type).join(','),
        ...pres,
      }))
      .filter((pres) => buildFilter(pres, args))
      .filter(
        (pres) =>
          !context.authenticatedDid ||
          (context.authenticatedDid &&
            [pres.holder, ...asArray(pres.verifier)].includes(context.authenticatedDid)),
      )
    if (args.skip) {
      presentations = presentations.slice(args.skip)
    }
    if (args.take) {
      presentations = presentations.slice(0, args.take)
    }
    // // FIXME: filter for authenticated DID
    // if (context.authenticatedDid) {
    //   presentations = presentations.filter(pres => pres.holder === context.authenticatedDid ||
    // pres.verifier?.includes(context?.authenticatedDid || '')) }
    return structuredClone(
      presentations.map((pres: any) => {
        const { _veramo_raw_presentation, _veramo_presentation_hash, ...presentation } = pres
        return {
          hash: _veramo_presentation_hash,
          verifiablePresentation: presentation,
        }
      }),
    )
  }

  async dataStoreORMGetVerifiablePresentationsCount(
    args: FindArgs<TPresentationColumns>,
    context: IContext,
  ): Promise<number> {
    return (await this.dataStoreORMGetVerifiablePresentations(args, context)).length
  }
}

// function opToSQL(item: Where<any>): any[] {
//   switch (item.op) {
//     case 'IsNull':
//       return ['IS NULL', '']
//     case 'Like':
//       if (item.value?.length != 1) throw Error('Operation Equal requires one value')
//       return ['LIKE :value', item.value[0]]
//     case 'Equal':
//       if (item.value?.length != 1) throw Error('Operation Equal requires one value')
//       return ['= :value', item.value[0]]
//     case 'Any':
//     case 'Between':
//     case 'LessThan':
//     case 'LessThanOrEqual':
//     case 'MoreThan':
//     case 'MoreThanOrEqual':
//       throw new Error(`${item.op} not compatible with DID argument`)
//     case 'In':
//     default:
//       return ['IN (:...value)', item.value]
//   }
// }
//
// function addVerifierQuery(input: FindArgs<any>, qb: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
//   if (!input) {
//     return qb
//   }
//   if (!Array.isArray(input.where)) {
//     return qb
//   }
//   const verifierWhere = input.where.find((item) => item.column === 'verifier')
//   if (!verifierWhere) {
//     return qb
//   }
//   const [op, value] = opToSQL(verifierWhere)
//   return qb.andWhere(`verifier.did ${op}`, { value })
// }
//
// function createWhereObject(
//   input: FindArgs<
//     TMessageColumns | TClaimsColumns | TCredentialColumns | TPresentationColumns | TIdentifiersColumns
//   >,
// ): any {
//   const where: Record<string, any> = {}
//   if (input?.where) {
//     for (const item of input.where) {
//       if (item.column === 'verifier') {
//         continue
//       }
//       switch (item.op) {
//         case 'Any':
//           if (!Array.isArray(item.value)) throw Error('Operator Any requires value to be an array')
//           where[item.column] = Any(item.value)
//           break
//         case 'Between':
//           if (item.value?.length != 2) throw Error('Operation Between requires two values')
//           where[item.column] = Between(item.value[0], item.value[1])
//           break
//         case 'Equal':
//           if (item.value?.length != 1) throw Error('Operation Equal requires one value')
//           where[item.column] = Equal(item.value[0])
//           break
//         case 'IsNull':
//           where[item.column] = IsNull()
//           break
//         case 'LessThan':
//           if (item.value?.length != 1) throw Error('Operation LessThan requires one value')
//           where[item.column] = LessThan(item.value[0])
//           break
//         case 'LessThanOrEqual':
//           if (item.value?.length != 1) throw Error('Operation LessThanOrEqual requires one value')
//           where[item.column] = LessThanOrEqual(item.value[0])
//           break
//         case 'Like':
//           if (item.value?.length != 1) throw Error('Operation Like requires one value')
//           where[item.column] = Like(item.value[0])
//           break
//         case 'MoreThan':
//           if (item.value?.length != 1) throw Error('Operation MoreThan requires one value')
//           where[item.column] = MoreThan(item.value[0])
//           break
//         case 'MoreThanOrEqual':
//           if (item.value?.length != 1) throw Error('Operation MoreThanOrEqual requires one value')
//           where[item.column] = MoreThanOrEqual(item.value[0])
//           break
//         case 'In':
//         default:
//           if (!Array.isArray(item.value)) throw Error('Operator IN requires value to be an array')
//           where[item.column] = In(item.value)
//       }
//       if (item.not === true) {
//         where[item.column] = Not(where[item.column])
//       }
//     }
//   }
//   return where
// }
//
// function decorateQB(
//   qb: SelectQueryBuilder<any>,
//   tableName: string,
//   input: FindArgs<any>,
// ): SelectQueryBuilder<any> {
//   if (input?.skip) qb = qb.skip(input.skip)
//   if (input?.take) qb = qb.take(input.take)
//
//   if (input?.order) {
//     for (const item of input.order) {
//       qb = qb.orderBy(
//         qb.connection.driver.escape(tableName) + '.' + qb.connection.driver.escape(item.column),
//         item.direction,
//       )
//     }
//   }
//   return qb
// }

function buildFilter(
  target: IKey | IIdentifier | IMessage | VerifiableCredential | VerifiablePresentation | CredentialSubject,
  input: FindArgs<
    TMessageColumns | TClaimsColumns | TCredentialColumns | TPresentationColumns | TIdentifiersColumns
  >,
): any {
  let condition = true
  if (input?.where) {
    for (const item of input.where) {
      let newCondition: boolean
      switch (item.op) {
        case 'Between':
          if (item.value?.length != 2) throw Error('Operation Between requires two values')
          newCondition =
            item.value[0] <= (target as any)[item.column] && (target as any)[item.column] <= item.value[1]
          break
        case 'Equal':
          if (item.value?.length != 1) throw Error('Operation Equal requires one value')
          newCondition = item.value[0] === (target as any)[item.column]
          break
        case 'IsNull':
          newCondition =
            (target as any)[item.column] === null || typeof (target as any)[item.column] === 'undefined'
          break
        case 'LessThan':
          if (item.value?.length != 1) throw Error('Operation LessThan requires one value')
          newCondition = (target as any)[item.column] < item.value
          break
        case 'LessThanOrEqual':
          if (item.value?.length != 1) throw Error('Operation LessThanOrEqual requires one value')
          newCondition = (target as any)[item.column] <= item.value
          break
        case 'Like':
          if (item.value?.length != 1) throw Error('Operation Like requires one value')
          // FIXME: add support for escaping
          const likeExpression = `^${(item.value?.[0] || '').replace(/_/g, '.').replace(/%/g, '.*')}$`
          newCondition = new RegExp(likeExpression).test((target as any)[item.column])
          break
        case 'MoreThan':
          if (item.value?.length != 1) throw Error('Operation MoreThan requires one value')
          newCondition = (target as any)[item.column] > item.value
          break
        case 'MoreThanOrEqual':
          if (item.value?.length != 1) throw Error('Operation MoreThanOrEqual requires one value')
          newCondition = (target as any)[item.column] >= item.value
          break
        case 'Any':
        case 'In':
        default:
          if (!Array.isArray(item.value)) throw Error('Operator Any requires value to be an array')
          const targetValue = (target as any)[item.column]
          if (Array.isArray(targetValue)) {
            newCondition = item.value.find((val) => targetValue.includes(val)) !== undefined
          } else {
            newCondition = item.value.includes(targetValue)
          }
          break
      }
      if (item.not === true) {
        newCondition = !newCondition
      }
      condition &&= newCondition
    }
  }
  return condition
}
