import {
  AuthorizedDIDContext,
  FindArgs,
  IAgentPlugin,
  IDataStore,
  IDataStoreDeleteVerifiableCredentialArgs,
  IDataStoreGetMessageArgs,
  IDataStoreGetVerifiableCredentialArgs,
  IDataStoreGetVerifiablePresentationArgs,
  IDataStoreORM,
  IDataStoreSaveMessageArgs,
  IDataStoreSaveVerifiableCredentialArgs,
  IDataStoreSaveVerifiablePresentationArgs,
  IIdentifier,
  IMessage,
  schema,
  TClaimsColumns,
  TCredentialColumns,
  TIdentifiersColumns,
  TMessageColumns,
  TPresentationColumns,
  UniqueVerifiableCredential,
  UniqueVerifiablePresentation,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core'
import { asArray, computeEntryHash, extractIssuer } from '@veramo/utils'
import { serialize, deserialize } from '@ungap/structured-clone'
import {
  ClaimTableEntry,
  CredentialTableEntry,
  DiffCallback,
  PresentationTableEntry,
  VeramoJsonCache,
  VeramoJsonStore,
} from './types'
import { normalizeCredential } from 'did-jwt-vc'

type LocalRecords = Required<
  Pick<VeramoJsonCache, 'dids' | 'credentials' | 'presentations' | 'claims' | 'messages'>
>

/**
 * A storage plugin that implements the {@link IDataStore} and {@link IDataStoreORM} methods using a JSON object as a
 * backend.
 *
 * Each update operation triggers a callback that can be used to either save the latest state of the agent data or
 * compute a diff and log only the changes.
 *
 * This plugin must be initialized with a {@link VeramoJsonStore}, which serves as the JSON object storing data in
 * memory as well as providing an update notification callback to persist this data.
 * The JSON object can be pre-populated with data from previous sessions.
 *
 * @beta This API is likely to change without a BREAKING CHANGE notice.
 */
export class DataStoreJson implements IAgentPlugin {
  readonly methods: IDataStore & IDataStoreORM
  readonly schema = { ...schema.IDataStore, ...schema.IDataStoreORM }

  private readonly cacheTree: LocalRecords
  private readonly notifyUpdate: DiffCallback

  /**
   * @param jsonStore a reference to the JSON object that holds the data in memory and implements an update callback.
   *   This object can be pre-populated with data from previous sessions, and will be used by reference.
   */
  constructor(jsonStore: VeramoJsonStore) {
    this.notifyUpdate = jsonStore.notifyUpdate
    this.cacheTree = jsonStore as LocalRecords
    const tables = ['dids', 'credentials', 'presentations', 'claims', 'messages'] as (keyof LocalRecords)[]
    for (const table of tables) {
      if (!this.cacheTree[table]) {
        this.cacheTree[table] = {}
      }
    }

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
    const oldTree = deserialize(serialize(this.cacheTree, { lossy: true }))
    this.cacheTree.messages[id] = message
    // TODO: deprecate automatic credential and presentation saving
    const credentials = asArray(message.credentials)
    const presentations = asArray(message.presentations)
    for (const verifiableCredential of credentials) {
      await this._dataStoreSaveVerifiableCredential({ verifiableCredential }, false)
    }
    for (const verifiablePresentation of presentations) {
      await this._dataStoreSaveVerifiablePresentation({ verifiablePresentation }, false)
    }
    // adding dummy DIDs is required to make `dataStoreORMGetIdentifiers` work
    if (message?.from && !this.cacheTree.dids[message.from]) {
      this.cacheTree.dids[message.from] = { did: message.from, provider: '', keys: [], services: [] }
    }
    asArray(message.to).forEach((did) => {
      if (!this.cacheTree.dids[did]) {
        this.cacheTree.dids[did] = { did, provider: '', keys: [], services: [] }
      }
    })
    await this.notifyUpdate(oldTree, this.cacheTree)
    return message.id
  }

  async dataStoreGetMessage(args: IDataStoreGetMessageArgs): Promise<IMessage> {
    const message = this.cacheTree.messages[args.id]
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
    const canonicalCredential =
      args?.verifiableCredential?.proof?.type === 'JwtProof2020' &&
      typeof args?.verifiableCredential?.proof?.jwt === 'string'
        ? args?.verifiableCredential?.proof?.jwt
        : args.verifiableCredential
    const vc = args.verifiableCredential
    const id = vc.id
    const hash = computeEntryHash(canonicalCredential)
    const issuer = extractIssuer(vc)
    const subject = vc.credentialSubject.id
    const context = asArray(vc['@context'])
    const type = asArray(vc.type)
    let issuanceDate: Date | undefined = undefined
    let expirationDate: Date | undefined = undefined

    if (vc.issuanceDate) {
      issuanceDate = new Date(vc.issuanceDate)
    }
    if (vc.expirationDate) {
      expirationDate = new Date(vc.expirationDate)
    }

    const credential: CredentialTableEntry = {
      hash,
      id,
      parsedCredential: vc,
      canonicalCredential,
      issuer,
      subject,
      issuanceDate,
      expirationDate,
      context,
      type,
    }

    const claims: ClaimTableEntry[] = []

    for (const claimType in vc.credentialSubject) {
      if (vc.credentialSubject.hasOwnProperty(claimType)) {
        const value = vc.credentialSubject[claimType]
        if (claimType !== 'id') {
          const claim = {
            hash: computeEntryHash(hash + claimType),
            type: claimType,
            value,
            issuer,
            subject,
            issuanceDate,
            expirationDate,
            context: context,
            credentialType: type,
            credentialHash: hash,
          }
          claims.push(claim)
        }
      }
    }

    let oldTree: VeramoJsonCache
    if (postUpdates) {
      oldTree = deserialize(serialize(this.cacheTree, { lossy: true }))
    }
    this.cacheTree.credentials[hash] = credential
    for (const claim of claims) {
      this.cacheTree.claims[claim.hash] = claim
    }
    // adding dummy DIDs is required to make `dataStoreORMGetIdentifiers` work
    if (issuer && !this.cacheTree.dids[issuer]) {
      this.cacheTree.dids[issuer] = { did: issuer, provider: '', keys: [], services: [] }
    }
    if (subject && !this.cacheTree.dids[subject]) {
      this.cacheTree.dids[subject] = { did: subject, provider: '', keys: [], services: [] }
    }
    if (postUpdates) {
      await this.notifyUpdate(oldTree!!, this.cacheTree)
    }
    return credential.hash
  }

  async dataStoreSaveVerifiableCredential(args: IDataStoreSaveVerifiableCredentialArgs): Promise<string> {
    return this._dataStoreSaveVerifiableCredential(args)
  }

  async dataStoreDeleteVerifiableCredential(
    args: IDataStoreDeleteVerifiableCredentialArgs,
  ): Promise<boolean> {
    const credential = this.cacheTree.credentials[args.hash]
    if (credential) {
      const claims = Object.values(this.cacheTree.claims)
        .filter((claim) => claim.credentialHash === credential.hash)
        .map((claim) => claim.hash)
      const oldTree = deserialize(serialize(this.cacheTree, { lossy: true }))
      delete this.cacheTree.credentials[args.hash]
      for (const claimHash of claims) {
        delete this.cacheTree.claims[claimHash]
      }
      await this.notifyUpdate(oldTree, this.cacheTree)
      return true
    }
    return false
  }

  async dataStoreGetVerifiableCredential(
    args: IDataStoreGetVerifiableCredentialArgs,
  ): Promise<VerifiableCredential> {
    const credentialEntity = this.cacheTree.credentials[args.hash]
    if (credentialEntity) {
      const { parsedCredential } = credentialEntity
      return deserialize(serialize(parsedCredential))
    } else {
      throw Error('Verifiable credential not found')
    }
  }

  private async _dataStoreSaveVerifiablePresentation(
    args: IDataStoreSaveVerifiablePresentationArgs,
    postUpdates: boolean = true,
  ): Promise<string> {
    const vp = args.verifiablePresentation
    const canonicalPresentation =
      vp?.proof?.type === 'JwtProof2020' && typeof vp?.proof?.jwt === 'string' ? vp?.proof?.jwt : vp

    const id = vp.id
    const hash = computeEntryHash(canonicalPresentation)
    const holder = extractIssuer(vp)
    const verifier = asArray(vp.verifier)
    const context = asArray(vp['@context'])
    const type = asArray(vp.type)
    let issuanceDate: Date | undefined = undefined
    let expirationDate: Date | undefined = undefined

    if (vp.issuanceDate) {
      issuanceDate = new Date(vp.issuanceDate)
    }
    if (vp.expirationDate) {
      expirationDate = new Date(vp.expirationDate)
    }

    const credentials: VerifiableCredential[] = asArray(vp.verifiableCredential).map((cred) => {
      if (typeof cred === 'string') {
        return normalizeCredential(cred)
      } else {
        return <VerifiableCredential>cred
      }
    })

    const presentation: PresentationTableEntry = {
      hash,
      id,
      parsedPresentation: vp,
      canonicalPresentation,
      holder,
      verifier,
      issuanceDate,
      expirationDate,
      context,
      type,
      credentials,
    }

    let oldTree: VeramoJsonCache
    if (postUpdates) {
      oldTree = deserialize(serialize(this.cacheTree, { lossy: true }))
    }

    this.cacheTree.presentations[hash] = presentation
    for (const verifiableCredential of credentials) {
      await this._dataStoreSaveVerifiableCredential({ verifiableCredential }, false)
    }
    // adding dummy DIDs is required to make `dataStoreORMGetIdentifiers` work
    if (holder && !this.cacheTree.dids[holder]) {
      this.cacheTree.dids[holder] = { did: holder, provider: '', keys: [], services: [] }
    }
    asArray(verifier).forEach((did) => {
      if (!this.cacheTree.dids[did]) {
        this.cacheTree.dids[did] = { did, provider: '', keys: [], services: [] }
      }
    })
    if (postUpdates) {
      await this.notifyUpdate(oldTree!!, this.cacheTree)
    }
    return hash
  }

  async dataStoreSaveVerifiablePresentation(args: IDataStoreSaveVerifiablePresentationArgs): Promise<string> {
    return this._dataStoreSaveVerifiablePresentation(args)
  }

  async dataStoreGetVerifiablePresentation(
    args: IDataStoreGetVerifiablePresentationArgs,
  ): Promise<VerifiablePresentation> {
    const presentationEntry = this.cacheTree.presentations[args.hash]
    if (presentationEntry) {
      const { parsedPresentation } = presentationEntry
      return parsedPresentation
    } else {
      throw Error('Verifiable presentation not found')
    }
  }

  async dataStoreORMGetIdentifiers(
    args: FindArgs<TIdentifiersColumns>,
    context: AuthorizedDIDContext,
  ): Promise<IIdentifier[]> {
    const identifiers = buildQuery(Object.values(this.cacheTree.dids), args, ['did'], context.authorizedDID)
    // FIXME: collect corresponding keys from `this.cacheTree.keys`?
    return deserialize(serialize(identifiers))
  }

  async dataStoreORMGetIdentifiersCount(
    args: FindArgs<TIdentifiersColumns>,
    context: AuthorizedDIDContext,
  ): Promise<number> {
    return (await this.dataStoreORMGetIdentifiers(args, context)).length
  }

  async dataStoreORMGetMessages(
    args: FindArgs<TMessageColumns>,
    context: AuthorizedDIDContext,
  ): Promise<IMessage[]> {
    const messages = buildQuery(
      Object.values(this.cacheTree.messages),
      args,
      ['to', 'from'],
      context.authorizedDID,
    )
    return deserialize(serialize(messages))
  }

  async dataStoreORMGetMessagesCount(
    args: FindArgs<TMessageColumns>,
    context: AuthorizedDIDContext,
  ): Promise<number> {
    return (await this.dataStoreORMGetMessages(args, context)).length
  }

  async dataStoreORMGetVerifiableCredentialsByClaims(
    args: FindArgs<TClaimsColumns>,
    context: AuthorizedDIDContext,
  ): Promise<Array<UniqueVerifiableCredential>> {
    const filteredClaims = buildQuery(
      Object.values(this.cacheTree.claims),
      args,
      ['issuer', 'subject'],
      context.authorizedDID,
    )

    let filteredCredentials = new Set<CredentialTableEntry>()
    filteredClaims.forEach((claim) => {
      filteredCredentials.add(this.cacheTree.credentials[claim.credentialHash])
    })

    return deserialize(serialize(
      Array.from(filteredCredentials).map((cred) => {
        const { hash, parsedCredential } = cred
        return {
          hash,
          verifiableCredential: parsedCredential,
        }
      }),
    ))
  }

  async dataStoreORMGetVerifiableCredentialsByClaimsCount(
    args: FindArgs<TClaimsColumns>,
    context: AuthorizedDIDContext,
  ): Promise<number> {
    return (await this.dataStoreORMGetVerifiableCredentialsByClaims(args, context)).length
  }

  async dataStoreORMGetVerifiableCredentials(
    args: FindArgs<TCredentialColumns>,
    context: AuthorizedDIDContext,
  ): Promise<Array<UniqueVerifiableCredential>> {
    const credentials = buildQuery(
      Object.values(this.cacheTree.credentials),
      args,
      ['issuer', 'subject'],
      context.authorizedDID,
    )

    return deserialize(serialize(
      credentials.map((cred: any) => {
        const { hash, parsedCredential } = cred
        return {
          hash,
          verifiableCredential: parsedCredential,
        }
      }),
    ))
  }

  async dataStoreORMGetVerifiableCredentialsCount(
    args: FindArgs<TCredentialColumns>,
    context: AuthorizedDIDContext,
  ): Promise<number> {
    return (await this.dataStoreORMGetVerifiableCredentials(args, context)).length
  }

  async dataStoreORMGetVerifiablePresentations(
    args: FindArgs<TPresentationColumns>,
    context: AuthorizedDIDContext,
  ): Promise<Array<UniqueVerifiablePresentation>> {
    const presentations = buildQuery(
      Object.values(this.cacheTree.presentations),
      args,
      ['holder', 'verifier'],
      context.authorizedDID,
    )

    return deserialize(serialize(
      presentations.map((pres: any) => {
        const { hash, parsedPresentation } = pres
        return {
          hash,
          verifiablePresentation: parsedPresentation,
        }
      }),
    ))
  }

  async dataStoreORMGetVerifiablePresentationsCount(
    args: FindArgs<TPresentationColumns>,
    context: AuthorizedDIDContext,
  ): Promise<number> {
    return (await this.dataStoreORMGetVerifiablePresentations(args, context)).length
  }
}

function buildFilter<T extends Partial<Record<PossibleColumns, any>>>(
  target: T,
  input: FindArgs<PossibleColumns>,
): boolean {
  let condition = true
  if (input?.where) {
    for (const item of input.where) {
      let newCondition: boolean
      const targetValue = (target as any)[item.column]
      switch (item.op) {
        case 'Between':
          if (item.value?.length != 2) throw Error('Operation Between requires two values')
          newCondition = item.value[0] <= targetValue && targetValue <= item.value[1]
          break
        case 'Equal':
          if (item.value?.length != 1) throw Error('Operation Equal requires one value')
          newCondition = item.value[0] === targetValue
          if (Array.isArray(targetValue)) {
            // mimicking legacy SQL data-store behavior where array values are stored as joined strings
            newCondition ||= targetValue.join(',').includes(item.value[0])
          }
          break
        case 'IsNull':
          newCondition = targetValue === null || typeof targetValue === 'undefined'
          break
        case 'LessThan':
          if (item.value?.length != 1) throw Error('Operation LessThan requires one value')
          newCondition = targetValue < item.value
          break
        case 'LessThanOrEqual':
          if (item.value?.length != 1) throw Error('Operation LessThanOrEqual requires one value')
          newCondition = targetValue <= item.value
          break
        case 'Like':
          if (item.value?.length != 1) throw Error('Operation Like requires one value')
          // FIXME: add support for escaping
          const likeExpression = `^${(item.value?.[0] || '').replace(/_/g, '.').replace(/%/g, '.*')}$`
          newCondition = new RegExp(likeExpression).test(targetValue)
          break
        case 'MoreThan':
          if (item.value?.length != 1) throw Error('Operation MoreThan requires one value')
          newCondition = targetValue > item.value
          break
        case 'MoreThanOrEqual':
          if (item.value?.length != 1) throw Error('Operation MoreThanOrEqual requires one value')
          newCondition = targetValue >= item.value
          break
        case 'Any':
        case 'In':
        default:
          if (!Array.isArray(item.value)) throw Error('Operator Any requires value to be an array')

          if (Array.isArray(targetValue)) {
            newCondition = item.value.find((val) => targetValue.includes(val)) !== undefined
            // mimicking legacy SQL data-store behavior where array values are stored as joined strings
            newCondition ||= targetValue.join(',').includes(item.value.join(','))
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

type PossibleColumns =
  | TMessageColumns
  | TClaimsColumns
  | TCredentialColumns
  | TPresentationColumns
  | TIdentifiersColumns

function buildQuery<T extends Partial<Record<PossibleColumns, any>>>(
  targetCollection: T[],
  input: FindArgs<PossibleColumns>,
  authFilterColumns: string[],
  authFilterValue?: string,
): T[] {
  let filteredCollection = targetCollection.filter((target) => buildFilter(target, input))
  if (authFilterValue) {
    filteredCollection = filteredCollection.filter((target) => {
      let columnValues: string[] = []
      for (const column of authFilterColumns) {
        columnValues = [...columnValues, ...asArray((target as any)[column])]
      }
      return columnValues.includes(authFilterValue)
    })
  }
  if (input.skip) {
    filteredCollection = filteredCollection.slice(input.skip)
  }
  if (input.take) {
    filteredCollection = filteredCollection.slice(0, input.take)
  }
  if (input.order && input.order.length > 0) {
    filteredCollection.sort((a: T, b: T) => {
      let result = 0
      let orderIndex = 0
      while (result == 0 && input.order?.[orderIndex]) {
        const direction = input.order?.[orderIndex].direction === 'DESC' ? -1 : 1
        const col: PossibleColumns = input.order?.[orderIndex]?.column
        if (!col) {
          break
        }
        const colA = a[col]
        const colB = b[col]
        if (typeof colA?.localeCompare === 'function') {
          result = direction * colA.localeCompare(colB)
        } else {
          result = direction * (colA - colB || 0)
        }
        orderIndex++
      }
      return result
    })
  }
  return filteredCollection
}
