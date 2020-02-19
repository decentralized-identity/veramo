import { Core } from 'daf-core'
import { ActionHandler, MessageValidator } from 'daf-debug'
import { IdentityProvider } from 'daf-ethr-did'
import { IdentityStore, KeyStore } from 'daf-react-native-async-storage'
import { KeyManagementSystem } from 'daf-react-native-libsodium'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'

const web = webDidResolver()
const didResolver = new Resolver({
  ...ethrDidResolver({
    networks: [
      {
        name: 'mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
      },
      {
        name: 'rinkeby',
        rpcUrl: 'https://rinkeby.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
      },
    ],
  }),
  ...web,
  https: web.web,
})

export const core = new Core({
  identityProviders: [
    new IdentityProvider({
      kms: new KeyManagementSystem(new KeyStore('rinkeby-keystore')),
      identityStore: new IdentityStore('rinkeby-identitystore'),
      network: 'rinkeby',
      rpcUrl: 'https://rinkeby.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
      resolver: didResolver,
    }),
  ],
  serviceControllers: [],
  actionHandler: new ActionHandler(),
  messageValidator: new MessageValidator(),
  didResolver,
})
