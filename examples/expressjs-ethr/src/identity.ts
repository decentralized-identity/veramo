import * as Daf from 'daf-core'
import { agent } from './framework'

export const getIdentity = async () => {
  // Get of create new identity
  let identity: Daf.AbstractIdentity
  const identities = await agent.identityManager.getIdentities()
  if (identities.length > 0) {
    identity = identities[0]
  } else {
    identity = await agent.identityManager.createIdentity()
  }

  return identity
}

export const setServiceEndpoint = async (identity: Daf.AbstractIdentity, serviceEndpoint: string) => {
  // Check if DID Document contains current serviceEndpoint
  const didDoc = await agent.didResolver.resolve(identity.did)
  const exists = didDoc?.service?.find(item => item.serviceEndpoint === serviceEndpoint)
  if (!exists) {
    try {
      const txHash = await identity.identityController.addService({
        id: 'any',
        type: 'Messaging',
        serviceEndpoint,
      })
      if (txHash) {
        console.log('New service endpoint published. Tx Hash:', txHash)
        return true
      }
    } catch (e) {
      console.log(e)
    }
    return false
  }
  return true
}
