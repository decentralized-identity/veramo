import 'cross-fetch/polyfill'
import { IContext, TMethodMap, IAgent, IAgentPlugin } from 'daf-core'
import { DIDDocument } from 'did-resolver'
export { DIDDocument }
import Debug from 'debug'
const debug = Debug('daf:resolver-universal')

interface Options {
  url: string
}

interface IArgs {
  did: string
}

export interface IAgentResolve extends IAgent {
  resolve?: (args: IArgs) => Promise<DIDDocument>
}

export class DafUniversalResolver implements IAgentPlugin {
  public methods: TMethodMap
  private url: string

  constructor(options: Options) {
    if (!options.url) throw Error('[daf-resolver-universal] url required')
    debug(options.url)
    this.url = options.url

    this.resolve = this.resolve.bind(this)

    this.methods = {
      resolve: this.resolve,
    }
  }

  async resolve(args: IArgs, context: IContext): Promise<DIDDocument> {
    debug('Resolving %s', args.did)
    try {
      const result = await fetch(this.url + args.did)
      const ddo = await result.json()
      return ddo.didDocument
    } catch (e) {
      return Promise.reject(e.message)
    }
  }
}
