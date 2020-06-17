import 'cross-fetch/polyfill'
import { Agent } from 'daf-core'
// import { GraphQLAgentPlugin } from '../lib/daf-graphql'
import { AgentRestClient } from 'daf-rest'
// import { DafGrpc } from '../lib/daf-grpc'
import { IAgentBase, IAgentIdentityManager, IAgentResolve } from 'daf-core'

export type ConfiguredAgent = IAgentBase & IAgentIdentityManager & IAgentResolve

const agent: ConfiguredAgent = new Agent({
  plugins: [
    new AgentRestClient({
      url: 'http://localhost:3002/agent',
      methods: [
        'resolveDid',
        'identityManagerGetProviders',
        'identityManagerGetIdentities',
        'identityManagerGetIdentity',
        'identityManagerCreateIdentity',
      ],
    }),
    // new DafGrpc({
    //   url: 'http://localhost:3001',
    //   methods: [
    //     // 'signCredentialJwt',
    //   ],
    // }),
    // new RESTAgentPlugin({
    //   url: 'http://localhost:3002/agent',
    //   methods: ['resolve'],
    // }),
  ],
})

async function main() {
  const providers = await agent.identityManagerGetProviders()
  console.log({ providers })

  // const newIdentity = await agent.createIdentity({ identityProviderType: 'rinkeby-ethr-did' })
  // console.log({ newIdentity })

  // const identities = await agent.getIdentities()
  // console.log({ identities })

  // const identity = await agent.getIdentity({ did: identities[0].did })
  // console.log({ identity })

  const doc = await agent.resolveDid({
    didUrl: 'did:ethr:rinkeby:0x79292ba5a516f04c3de11e8f06642c7bec16c490',
  })
  console.log(doc)
}

main().catch(console.log)
