import { agent } from './setup'

async function main() {
  // Getting existing identity or creating a new one
  let identity = await agent.identityManagerGetOrCreateIdentity({ alias: 'default' })
  const key = await agent.keyManagerCreateKey({type: 'Ed25519', 'kms': 'local'})
  const result = await agent.identityManagerAddKey({ did: identity.did, key })
  console.log(result)
}

main().catch(console.log)
