import { IIdentity } from 'daf-core'
import { agent } from './setup'

async function main() {
  // Getting existing identity or creating a new one
  let identity = await agent.identityManagerGetOrCreateIdentity({ alias: 'default' })

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
