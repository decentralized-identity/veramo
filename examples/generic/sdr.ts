import { IIdentity } from 'daf-core'
import { agent } from './setup'

async function main() {
  // Getting existing identity or creating a new one
  let identity: IIdentity
  const identities = await agent.identityManagerGetIdentities()
  if (identities.length > 0) {
    identity = identities[0]
  } else {
    identity = await agent.identityManagerCreateIdentity({ kms: 'local' })
  }

  const sdr = await agent.createSelectiveDisclosureRequest({
    data: {
      issuer: identity.did,
      claims: [
        {
          claimType: 'name',
        },
      ],
    },
  })

  console.log(sdr)
  const msg = await agent.handleMessage({ raw: sdr })
  console.log(msg)
}

main().catch(console.log)
