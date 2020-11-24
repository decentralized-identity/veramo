import { IAgentPlugin, IResolver, schema } from 'daf-core'
import { Resolver, DIDDocument } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { resolver as naclDidResolver } from 'nacl-did'
import { getResolver as webDidResolver } from 'web-did-resolver'
export { DIDDocument }
import Debug from 'debug'

const debug = Debug('daf:resolver')

interface NetworkConfig {
  name: string
  rpcUrl: string
  registry?: string
}

interface Options {
  infuraProjectId?: string
  networks?: NetworkConfig[]
}

export class DafResolver implements IAgentPlugin {
  readonly methods: IResolver
  readonly schema = schema.IResolver
  private didResolver: Resolver
  private networks: NetworkConfig[]

  constructor(options: Options) {
    let networks: NetworkConfig[]
    if (!options.networks && options.infuraProjectId) {
      networks = [
        { name: 'mainnet', rpcUrl: 'https://mainnet.infura.io/v3/' + options.infuraProjectId },
        { name: 'rinkeby', rpcUrl: 'https://rinkeby.infura.io/v3/' + options.infuraProjectId },
        { name: 'ropsten', rpcUrl: 'https://ropsten.infura.io/v3/' + options.infuraProjectId },
        { name: 'kovan', rpcUrl: 'https://kovan.infura.io/v3/' + options.infuraProjectId },
        { name: 'goerli', rpcUrl: 'https://goerli.infura.io/v3/' + options.infuraProjectId },
      ]
    } else if (!options.infuraProjectId && options.networks) {
      networks = options.networks
    } else {
      throw Error('[daf-resolver] infuraProjectId or networks config required')
    }
    this.networks = networks
    this.didResolver = new Resolver({
      ...ethrDidResolver({ networks }),
      ...webDidResolver(),
      nacl: naclDidResolver,
    })

    this.resolveDid = this.resolveDid.bind(this)

    this.methods = {
      resolveDid: this.resolveDid,
    }
  }

  async resolveDid({ didUrl }: { didUrl: string }): Promise<DIDDocument> {
    debug('Networks config %o', this.networks)
    debug('Resolving %s', didUrl)
    return this.didResolver.resolve(didUrl)
  }
}
