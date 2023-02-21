import {
  IMessage,
  IMetaData,
  IMessageAttachment,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core-types'

/**
 * A class implementing {@link @veramo/core-types#IMessage | IMessage}.
 *
 * This is used by {@link @veramo/message-handler#MessageHandler | MessageHandler}.
 *
 * @public
 */
export class Message implements IMessage {
  constructor(data?: { raw: string; metaData?: IMetaData[] }) {
    if (data?.raw) {
      this.raw = data.raw
    }
    if (data?.metaData) {
      this.metaData = data.metaData
    }
  }

  // @ts-ignore
  id: string

  createdAt?: string

  expiresAt?: string

  threadId?: string

  // @ts-ignore
  type: string

  raw?: string

  data?: any

  replyTo?: string[]

  replyUrl?: string

  from?: string

  to?: string

  returnRoute?: string

  metaData?: IMetaData[]

  presentations?: VerifiablePresentation[]
  credentials?: VerifiableCredential[]
  attachments?: IMessageAttachment[]

  addMetaData(meta: IMetaData) {
    if (this.metaData) {
      this.metaData.push(meta)
    } else {
      this.metaData = [meta]
    }
  }

  getLastMetaData(): IMetaData | null {
    if (this.metaData !== undefined && this.metaData.length > 0) {
      return this.metaData[this.metaData.length - 1]
    } else {
      return null
    }
  }

  isValid() {
    if (this.type === null || this.type === '') {
      return false
    }
    if (!this.raw || this.raw === null || this.raw === '') {
      return false
    }
    return true
  }
}
