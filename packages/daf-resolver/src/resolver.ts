import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { resolver as naclDidResolver } from 'nacl-did'
import { getResolver as webDidResolver } from 'web-did-resolver'
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

export class DafResolver {
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
  }

  async resolve(did: string) {
    debug('Networks config %o', this.networks)
    debug('Resolving %s', did)
    return this.didResolver.resolve(did)
  }
}
