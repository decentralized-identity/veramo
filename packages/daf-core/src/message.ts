import { blake2bHex } from 'blakejs'
import Debug from 'Debug'
const debug = Debug('daf:message')

export interface MetaData {
  type?: string
  id?: string
  data?: any
}

interface Transformation {
  raw: string
  data?: any
  meta: MetaData
}

export class Message {
  private _id: string | null = null
  public type: string | null = null
  public threadId: string | null = null
  public from: string | null = null
  public to: string | null = null
  public timestamp: number | null = null
  public vc?: any

  private transformations: Transformation[]

  constructor({ raw, meta }: { raw: string; meta: MetaData }) {
    this.transformations = [{ raw, meta }]
  }

  transform(transformation: { raw: string; data?: any; meta: MetaData }) {
    if (!transformation.raw || transformation.raw === '') {
      throw Error('Transformation raw is empty')
    }
    if (!transformation.meta || !transformation.meta.type || transformation.meta.type === '') {
      throw Error('Transformation meta is empty')
    }
    this.transformations.push(transformation)
  }

  get raw() {
    const lastTransformation = this.transformations[this.transformations.length - 1]
    return lastTransformation?.raw
  }

  get meta() {
    const lastTransformation = this.transformations[this.transformations.length - 1]
    return lastTransformation?.meta
  }

  get data() {
    const lastTransformation = this.transformations[this.transformations.length - 1]
    return lastTransformation?.data
  }

  get allMeta() {
    return this.transformations.map(item => item.meta)
  }

  set id(id) {
    this._id = id
  }

  get id() {
    if (this._id !== null) {
      return this._id
    } else {
      return blake2bHex(this.raw)
    }
  }

  isValid() {
    if (this.from === null) {
      return false
    }
    if (this.type === null || this.type === '') {
      debug('Missing `type` in %o', this)
      return false
    }
    if (this.from === null || this.from === '') {
      debug('Missing `from` in %o', this)
      return false
    }
    if (!this.raw || this.raw === null || this.raw === '') {
      debug('Missing `raw` in %o', this)
      return false
    }
    return true
  }
}
