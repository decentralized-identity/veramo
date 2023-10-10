import { VerifiableCredential, VerifiablePresentation } from './vc-data-model.js'
import { IIdentifier } from './IIdentifier.js'
import { IAgentContext, IPluginMethodMap } from './IAgent.js'
import { IMessage } from './IMessage.js'

/**
 * Represents the sort order of results from a {@link FindArgs} query.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface Order<TColumns> {
  column: TColumns
  direction: 'ASC' | 'DESC'
}

/**
 * Represents a WHERE predicate for a {@link FindArgs} query.
 * In situations where multiple WHERE predicates are present, they are combined with AND.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface Where<TColumns> {
  column: TColumns
  value?: string[]
  not?: boolean
  op?:
    | 'LessThan'
    | 'LessThanOrEqual'
    | 'MoreThan'
    | 'MoreThanOrEqual'
    | 'Equal'
    | 'Like'
    | 'Between'
    | 'In'
    | 'Any'
    | 'IsNull'
}

/**
 * Represents an {@link IDataStoreORM} Query.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface FindArgs<TColumns> {
  /**
   * Imposes constraints on the values of the given columns.
   * WHERE clauses are combined using AND.
   */
  where?: Where<TColumns>[]

  /**
   * Sorts the results according to the given array of column priorities.
   */
  order?: Order<TColumns>[]

  /**
   * Ignores the first number of entries in a {@link IDataStoreORM} query result.
   */
  skip?: number

  /**
   * Returns at most this number of results from a {@link IDataStoreORM} query.
   */
  take?: number
}

/**
 * The columns that can be queried for an {@link IIdentifier}
 *
 * @deprecated This type will be removed in future versions of this plugin interface.
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type TIdentifiersColumns = 'did' | 'alias' | 'provider'

/**
 * The columns that can be queried for an {@link IMessage}
 *
 * See {@link IDataStoreORM.dataStoreORMGetMessagesCount}
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type TMessageColumns =
  | 'from'
  | 'to'
  | 'id'
  | 'createdAt'
  | 'expiresAt'
  | 'threadId'
  | 'type'
  | 'raw'
  | 'replyTo'
  | 'replyUrl'

/**
 * The columns that can be searched for a {@link VerifiableCredential}
 *
 * See {@link IDataStoreORM.dataStoreORMGetVerifiableCredentials}
 * See {@link IDataStoreORM.dataStoreORMGetVerifiableCredentialsCount}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type TCredentialColumns =
  | 'context'
  | 'type'
  | 'id'
  | 'issuer'
  | 'subject'
  | 'expirationDate'
  | 'issuanceDate'
  | 'hash'

/**
 * The columns that can be searched for the claims of a {@link VerifiableCredential}
 *
 * See {@link IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaims}
 * See {@link IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaimsCount}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type TClaimsColumns =
  | 'context'
  | 'credentialType'
  | 'type'
  | 'value'
  | 'isObj'
  | 'id'
  | 'issuer'
  | 'subject'
  | 'expirationDate'
  | 'issuanceDate'

/**
 * The columns that can be searched for a {@link VerifiablePresentation}
 *
 * See {@link IDataStoreORM.dataStoreORMGetVerifiablePresentations}
 * See {@link IDataStoreORM.dataStoreORMGetVerifiablePresentationsCount}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type TPresentationColumns =
  | 'context'
  | 'type'
  | 'id'
  | 'holder'
  | 'verifier'
  | 'expirationDate'
  | 'issuanceDate'

/**
 * This context can be used for Veramo Agents that are created behind an authorization mechanism, that attaches a DID
 * as the authorized executor of certain actions. This authorized DID is used to further filter the data that is
 * available for querying.
 *
 * This does not constitute an authorization mechanism, but relies on an authorization mechanism existing before the
 * Veramo Agent is created.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface AuthorizedDIDContext extends IAgentContext<{}> {
  authorizedDID?: string
}

/**
 * Represents the result of a Query for {@link VerifiableCredential}s
 *
 * See {@link IDataStoreORM.dataStoreORMGetVerifiableCredentials}
 * See {@link IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaims}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface UniqueVerifiableCredential {
  hash: string
  verifiableCredential: VerifiableCredential
}

/**
 * Represents the result of a Query for {@link VerifiablePresentation}s
 *
 * See {@link IDataStoreORM.dataStoreORMGetVerifiablePresentations}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface UniqueVerifiablePresentation {
  hash: string
  verifiablePresentation: VerifiablePresentation
}

/**
 * The filter that can be used to find {@link IIdentifier}s in the data store.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type FindIdentifiersArgs = FindArgs<TIdentifiersColumns>

/**
 * The filter that can be used to find {@link IMessage}s in the data store.
 * See {@link IDataStoreORM.dataStoreORMGetMessages}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type FindMessagesArgs = FindArgs<TMessageColumns>

/**
 * The filter that can be used to find {@link VerifiableCredential}s in the data store, based on the types and values
 * of their claims.
 *
 * See {@link IDataStoreORM.dataStoreORMGetVerifiableCredentialsByClaims}
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type FindClaimsArgs = FindArgs<TClaimsColumns>

/**
 * The filter that can be used to find {@link VerifiableCredential}s in the data store.
 * See {@link IDataStoreORM.dataStoreORMGetVerifiableCredentials}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type FindCredentialsArgs = FindArgs<TCredentialColumns>

/**
 * The filter that can be used to find {@link VerifiablePresentation}s in the data store.
 * See {@link IDataStoreORM.dataStoreORMGetVerifiablePresentations}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type FindPresentationsArgs = FindArgs<TPresentationColumns>

/**
 * The result of a {@link IDataStoreORM.dataStoreORMGetIdentifiers} query.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type PartialIdentifier = Partial<IIdentifier>

/**
 * This is the default query interface for the credential data stored by a Veramo agent.
 *
 * Plugins implementing this interface are expected to implement this simple query functionality to filter the data
 * that was saved using {@link IDataStore}.
 *
 * If this interface is implemented by a different plugin than {@link IDataStore}, then both plugins MUST use the same
 * media for data storage.
 *
 * @see {@link @veramo/data-store#DataStoreORM} for an implementation using a TypeORM backend
 * @see {@link @veramo/data-store-json#DataStoreJson} for an implementation using a JSON object that can also be
 *   persisted.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IDataStoreORM extends IPluginMethodMap {
  /**
   * Tries to obtain a list of {@link IIdentifier | IIdentifiers} that match the given filter.
   * The origin of these identifiers is from any credential / presentation or message that was successfully processed
   * by this agent.
   *
   * If the same database is used for implementations of {@link @veramo/did-manager#AbstractDIDStore |
   * AbstractDIDStore}, then these identifiers can also come from {@link IDIDManager.didManagerCreate |
   * didManagerCreate} or {@link IDIDManager.didManagerImport | didManagerImport} operations.
   *
   * @param args - The filter to apply when querying
   * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
   *   will cause the result to only contain data that this DID should be able to access.
   *
   * @deprecated This will be removed in future versions of this plugin interface.
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  dataStoreORMGetIdentifiers(
    args: FindIdentifiersArgs,
    context: AuthorizedDIDContext,
  ): Promise<Array<PartialIdentifier>>

  /**
   * Tries to obtain a count of {@link IIdentifier | IIdentifiers} that match the given filter.
   * The origin of these identifiers is from any credential / presentation or message that was successfully processed
   * by this agent.
   *
   * If the same database is used for implementations of {@link @veramo/did-manager#AbstractDIDStore |
   * AbstractDIDStore}, then these identifiers can also come from {@link IDIDManager.didManagerCreate |
   * didManagerCreate} or {@link IDIDManager.didManagerImport | didManagerImport} operations.
   *
   * @param args - The filter to apply when querying
   * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
   *   will cause the result to only contain data that this DID should be able to access.
   *
   * @deprecated This will be removed in future versions of this plugin interface.
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  dataStoreORMGetIdentifiersCount(args: FindIdentifiersArgs, context: AuthorizedDIDContext): Promise<number>

  /**
   * Returns a list of {@link IMessage}s that match the given filter.
   * These are messages that were stored using {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}.
   *
   * @param args - The filter to apply when querying
   * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
   *   will cause the result to only contain data that this DID should be able to access.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  dataStoreORMGetMessages(args: FindMessagesArgs, context: AuthorizedDIDContext): Promise<Array<IMessage>>

  /**
   * Returns a count of {@link IMessage}s that match the given filter.
   * These are messages that were stored using {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}.
   *
   * @param args - The filter to apply when querying.
   * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
   *   will cause the result to only contain data that this DID should be able to access.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  dataStoreORMGetMessagesCount(args: FindMessagesArgs, context: AuthorizedDIDContext): Promise<number>

  /**
   * Returns a list of {@link UniqueVerifiableCredential}s that match the given filter based on the claims they
   * contain.
   *
   * These are VerifiableCredentials that were stored using
   * {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}.
   *
   * @param args - The filter to apply when querying
   * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
   *   will cause the result to only contain data that this DID should be able to access.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  dataStoreORMGetVerifiableCredentialsByClaims(
    args: FindClaimsArgs,
    context: AuthorizedDIDContext,
  ): Promise<Array<UniqueVerifiableCredential>>

  /**
   * Returns a count of {@link UniqueVerifiableCredential}s that match the given filter based on the claims they
   * contain.
   *
   * These are VerifiableCredentials that were stored using
   * {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}.
   *
   * @param args - The filter to apply when querying
   * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
   *   will cause the result to only contain data that this DID should be able to access.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  dataStoreORMGetVerifiableCredentialsByClaimsCount(
    args: FindClaimsArgs,
    context: AuthorizedDIDContext,
  ): Promise<number>

  /**
   * Returns a list of {@link UniqueVerifiableCredential}s that match the given filter based on the top level
   * properties of a credential.
   *
   * These are VerifiableCredentials that were stored using
   * {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}.
   *
   * @param args - The filter to apply when querying
   * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
   *   will cause the result to only contain data that this DID should be able to access.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  dataStoreORMGetVerifiableCredentials(
    args: FindCredentialsArgs,
    context: AuthorizedDIDContext,
  ): Promise<Array<UniqueVerifiableCredential>>

  /**
   * Returns a count of {@link UniqueVerifiableCredential}s that match the given filter based on the top level
   * properties of a credential.
   *
   * These are VerifiableCredentials that were stored using
   * {@link IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential}.
   *
   * @param args - The filter to apply when querying
   * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
   *   will cause the result to only contain data that this DID should be able to access.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  dataStoreORMGetVerifiableCredentialsCount(
    args: FindCredentialsArgs,
    context: AuthorizedDIDContext,
  ): Promise<number>

  /**
   * Returns a list of {@link UniqueVerifiablePresentation}s that match the given filter based on the top level
   * properties of a presentation.
   *
   * These are {@link VerifiablePresentation}s that were stored using
   * {@link IDataStore.dataStoreSaveVerifiablePresentation | dataStoreSaveVerifiablePresentation}.
   *
   * @param args - The filter to apply when querying
   * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
   *   will cause the result to only contain data that this DID should be able to access.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  dataStoreORMGetVerifiablePresentations(
    args: FindPresentationsArgs,
    context: AuthorizedDIDContext,
  ): Promise<Array<UniqueVerifiablePresentation>>

  /**
   * Returns a count of {@link UniqueVerifiablePresentation}s that match the given filter based on the top level
   * properties of a presentation.
   *
   * These are {@link VerifiablePresentation}s that were stored using
   * {@link IDataStore.dataStoreSaveVerifiablePresentation | dataStoreSaveVerifiablePresentation}.
   *
   * @param args - The filter to apply when querying
   * @param context - Can be used to signal that only a particular DID is authorized to perform this operation. This
   *   will cause the result to only contain data that this DID should be able to access.
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  dataStoreORMGetVerifiablePresentationsCount(
    args: FindPresentationsArgs,
    context: AuthorizedDIDContext,
  ): Promise<number>
}
