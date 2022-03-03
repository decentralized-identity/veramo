import { VerifiableCredential, VerifiablePresentation } from './vc-data-model'
import { IIdentifier } from './IIdentifier'
import { IAgentContext, IPluginMethodMap } from './IAgent'
import { IMessage } from './IMessage'

export interface Order<TColumns> {
  column: TColumns
  direction: 'ASC' | 'DESC'
}

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

export interface FindArgs<TColumns> {
  where?: Where<TColumns>[]
  order?: Order<TColumns>[]
  take?: number
  skip?: number
}

export type TIdentifiersColumns = 'did' | 'alias' | 'provider'

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
export type TCredentialColumns =
  | 'context'
  | 'type'
  | 'id'
  | 'issuer'
  | 'subject'
  | 'expirationDate'
  | 'issuanceDate'
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
 */
export interface AuthorizedDIDContext extends IAgentContext<{}> {
  authorizedDID?: string
}

export interface UniqueVerifiableCredential {
  hash: string
  verifiableCredential: VerifiableCredential
}

export interface UniqueVerifiablePresentation {
  hash: string
  verifiablePresentation: VerifiablePresentation
}

export type FindIdentifiersArgs = FindArgs<TIdentifiersColumns>
export type FindMessagesArgs = FindArgs<TMessageColumns>
export type FindClaimsArgs = FindArgs<TClaimsColumns>
export type FindCredentialsArgs = FindArgs<TCredentialColumns>
export type FindPresentationsArgs = FindArgs<TPresentationColumns>
export type PartialIdentifier = Partial<IIdentifier>

export interface IDataStoreORM extends IPluginMethodMap {
  dataStoreORMGetIdentifiers(
    args: FindIdentifiersArgs,
    context: AuthorizedDIDContext,
  ): Promise<Array<PartialIdentifier>>
  dataStoreORMGetIdentifiersCount(args: FindIdentifiersArgs, context: AuthorizedDIDContext): Promise<number>
  dataStoreORMGetMessages(args: FindMessagesArgs, context: AuthorizedDIDContext): Promise<Array<IMessage>>
  dataStoreORMGetMessagesCount(args: FindMessagesArgs, context: AuthorizedDIDContext): Promise<number>
  dataStoreORMGetVerifiableCredentialsByClaims(
    args: FindClaimsArgs,
    context: AuthorizedDIDContext,
  ): Promise<Array<UniqueVerifiableCredential>>
  dataStoreORMGetVerifiableCredentialsByClaimsCount(
    args: FindClaimsArgs,
    context: AuthorizedDIDContext,
  ): Promise<number>
  dataStoreORMGetVerifiableCredentials(
    args: FindCredentialsArgs,
    context: AuthorizedDIDContext,
  ): Promise<Array<UniqueVerifiableCredential>>
  dataStoreORMGetVerifiableCredentialsCount(
    args: FindCredentialsArgs,
    context: AuthorizedDIDContext,
  ): Promise<number>
  dataStoreORMGetVerifiablePresentations(
    args: FindPresentationsArgs,
    context: AuthorizedDIDContext,
  ): Promise<Array<UniqueVerifiablePresentation>>
  dataStoreORMGetVerifiablePresentationsCount(
    args: FindPresentationsArgs,
    context: AuthorizedDIDContext,
  ): Promise<number>
}
