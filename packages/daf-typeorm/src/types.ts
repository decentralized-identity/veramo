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
  | 'issuer'
  | 'audience'
  | 'expirationDate'
  | 'issuanceDate'
