import 'cross-fetch/polyfill'
import { createAgent, TAgent, IIdentityManager, IResolveDid } from 'daf-core'
import { AgentGraphQLClient } from 'daf-graphql'
import { AgentRestClient } from 'daf-rest'

const agent = createAgent<
  TAgent<
    Pick<
      IIdentityManager,
      | 'identityManagerGetProviders'
      | 'identityManagerGetIdentities'
      | 'identityManagerGetIdentity'
      | 'identityManagerCreateIdentity'
    > &
      IResolveDid
  >
>({
  plugins: [
    new AgentRestClient({
      url: 'http://localhost:3002/agent',
      enabledMethods: [
        'resolveDid',
        'identityManagerGetProviders',
        'identityManagerGetIdentities',
        'identityManagerGetIdentity',
        'identityManagerCreateIdentity',
      ],
    }),
    // new AgentGraphQLClient({
    //   url: 'http://localhost:3001',
    //   enabledMethods: [
    //     'identityManagerGetProviders',
    //     'identityManagerGetIdentities',
    //     'identityManagerGetIdentity',
    //     'identityManagerCreateIdentity',
    //   ],
    // }),
  ],
})

async function main() {
  const providers = await agent.identityManagerGetProviders()
  console.log({ providers })

  const newIdentity = await agent.identityManagerCreateIdentity({ provider: 'did:ethr:rinkeby' })
  console.log({ newIdentity })

  const identities = await agent.identityManagerGetIdentities()
  console.log({ identities })

  const identity = await agent.identityManagerGetIdentity({ did: identities[0].did })
  console.log({ identity })

  const doc = await agent.resolveDid({
    didUrl: 'did:ethr:rinkeby:0x79292ba5a516f04c3de11e8f06642c7bec16c490',
  })
  console.log(doc)
}

main().catch(console.log)
