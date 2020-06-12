import { IIdentity } from 'daf-core'
import { agent } from './setup'

async function main() {
  // Getting existing identity or creating a new one
  let identity: IIdentity
  const identities = await agent.identityManagerGetIdentities()
  if (identities.length > 0) {
    identity = identities[0]
  } else {
    identity = await agent.identityManagerCreateIdentity({kms: 'local'})
  }

  const key = await agent.keyManagerCreateKey({type: 'Ed25519', 'kms': 'local'})
  const result = await agent.identityManagerAddKey({ did: identity.did, key })
  console.log(result)
}

main().catch(console.log)
