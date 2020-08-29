import 'cross-fetch/polyfill'
import { createAgent, TAgent, IIdentityManager, IResolver, IMessageHandler, IDataStore } from 'daf-core'
import { IDataStoreORM } from 'daf-typeorm'
import { ICredentialIssuer } from 'daf-w3c'
import { ISdr } from 'daf-selective-disclosure'
import { AgentGraphQLClient } from 'daf-graphql'
import { AgentRestClient } from 'daf-rest'

const agent = createAgent<
  Pick<
    IIdentityManager,
    | 'identityManagerGetProviders'
    | 'identityManagerGetIdentities'
    | 'identityManagerGetIdentity'
    | 'identityManagerCreateIdentity'
  > &
    IResolver &
    IMessageHandler &
    IDataStoreORM &
    IDataStore &
    ICredentialIssuer &
    ISdr
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
        'handleMessage',
        'dataStoreORMGetMessages',
        'dataStoreSaveMessage',
        'createVerifiableCredential',
        'createVerifiablePresentation',
        'createSelectiveDisclosureRequest',
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

  const credential = await agent.createVerifiableCredential({
    credential: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'PublicProfile'],
      issuer: { id: identities[0].did },
      issuanceDate: new Date().toISOString(),
      id: 'vc1',
      credentialSubject: {
        id: identities[0].did,
        name: 'Alice',
        profilePicture: 'https://example.com/a.png',
        address: {
          street: 'Some str.',
          house: 1,
        },
      },
    },
    proofFormat: 'jwt',
  })

  console.log(credential)

  const sdr = await agent.createSelectiveDisclosureRequest({
    data: {
      issuer: identities[0].did,
      claims: [
        {
          claimType: 'name',
        },
      ],
    },
  })

  console.log(sdr)

  const message = await agent.handleMessage({
    raw: sdr,
    save: false,
  })

  console.log(message)
  const result = await agent.dataStoreSaveMessage(message)
  console.log(result)

  const messages = await agent.dataStoreORMGetMessages()
  console.log(messages)
}

main().catch(console.log)
