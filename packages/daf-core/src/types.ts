export interface ServiceMetaData {
  sourceType?: string
  sourceId?: string
  data?: any
}

export interface RawMessage {
  raw: string
  meta?: ServiceMetaData[]
}

export interface PreValidatedMessage {
  type: string
  issuer: string
  subject?: string
  time?: string
  raw: string
  verified?: any
  custom?: any
  meta?: ServiceMetaData[]
}

export interface ValidatedMessage extends PreValidatedMessage {
  hash: string
}

export interface Action {
  type: string
  parentMessage?: ValidatedMessage
  parentMessageHash?: string
  data: any
}
