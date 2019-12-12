import 'cross-fetch/polyfill'
import Debug from 'debug'

const debug = Debug('daf:resolver-universal')

interface Options {
  url: string
}

export class DafUniversalResolver {
  private url: string

  constructor(options: Options) {
    this.url = options.url
  }

  async resolve(did: string) {
    debug('Resolving %s', did)
    try {
      const result = await fetch(this.url + did)
      const ddo = await result.json()
      return ddo.didDocument
    } catch (e) {
      return Promise.reject(e.message)
    }
  }
}
