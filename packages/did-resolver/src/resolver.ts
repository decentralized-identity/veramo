import { IAgentPlugin, IResolver, schema } from '@veramo/core'
import { Resolver, DIDDocument } from 'did-resolver'
export { DIDDocument }
import Debug from 'debug'
const debug = Debug('veramo:resolver')

interface Options {
  resolver: Resolver
}

export class DIDResolverPlugin implements IAgentPlugin {
  readonly methods: IResolver
  readonly schema = schema.IResolver
  private didResolver: Resolver

  constructor(options: Options) {
    if (!options.resolver) throw Error('Missing resolver')
    this.didResolver = options.resolver

    this.resolveDid = this.resolveDid.bind(this)

    this.methods = {
      resolveDid: this.resolveDid,
    }
  }

  async resolveDid({ didUrl }: { didUrl: string }): Promise<DIDDocument> {
    debug('Resolving %s', didUrl)
    return this.didResolver.resolve(didUrl)
  }
}
