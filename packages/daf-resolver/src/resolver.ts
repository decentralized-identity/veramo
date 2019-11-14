import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { resolver as naclDidResolver } from 'nacl-did'
import { getResolver as webDidResolver} from 'web-did-resolver'
import Debug from 'debug'

const debug = Debug('resolver')

interface Options {
  infuraProjectId: string
}

export class DafResolver {
  private didResolver: Resolver

  constructor(options: Options) {
    this.didResolver = new Resolver({
      ...ethrDidResolver({
        rpcUrl: 'https://mainnet.infura.io/v3/' + options.infuraProjectId,
      }),
      ...webDidResolver(),
      nacl: naclDidResolver
    })
  }

  async resolve(did: string) {
    debug('Resolving %s', did)
    return this.didResolver.resolve(did)
  }
}
