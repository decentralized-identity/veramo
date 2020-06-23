import 'cross-fetch/polyfill'
import { IAgentPlugin, IResolveDid } from 'daf-core'
import { DIDDocument } from 'did-resolver'
export { DIDDocument }
import Debug from 'debug'
const debug = Debug('daf:resolver-universal')

interface Options {
  url: string
}

export class DafUniversalResolver implements IAgentPlugin {
  public methods: IResolveDid
  private url: string

  constructor(options: Options) {
    if (!options.url) throw Error('[daf-resolver-universal] url required')
    debug(options.url)
    this.url = options.url

    this.resolveDid = this.resolveDid.bind(this)

    this.methods = {
      resolveDid: this.resolveDid,
    }
  }

  async resolveDid({ didUrl }: { didUrl: string }): Promise<DIDDocument> {
    debug('Resolving %s', didUrl)
    try {
      const result = await fetch(this.url + didUrl)
      const ddo = await result.json()
      return ddo.didDocument
    } catch (e) {
      return Promise.reject(e.message)
    }
  }
}
