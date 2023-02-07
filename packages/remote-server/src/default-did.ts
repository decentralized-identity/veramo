import parse from 'url-parse'

import { IDIDManager, TAgent, TKeyType } from '@veramo/core-types'

interface CreateDefaultDidOptions {
  agent: TAgent<IDIDManager>
  baseUrl: string
  messagingServiceEndpoint?: string
}

/**
 * This can be used to automatically create a did:web with signing and encryption keys and listing messaging and
 * DIDComm service endpoints.
 *
 * @param options - The options guiding the creation of the default DID
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export async function createDefaultDid(options: CreateDefaultDidOptions) {
  if (!options.agent) throw Error('[createDefaultDid] Agent is required')
  if (!options.baseUrl) throw Error('[createDefaultDid] baseUrl is required')

  const hostname = parse(options.baseUrl).hostname

  const serverIdentifier = await options?.agent?.didManagerGetOrCreate({
    provider: 'did:web',
    alias: hostname,
    options: {
      keyType: <TKeyType>'Ed25519',
    },
  })
  console.log('🆔', serverIdentifier?.did)

  if (serverIdentifier && options.messagingServiceEndpoint) {
    const messagingServiceEndpoint = options.baseUrl + options.messagingServiceEndpoint

    console.log('📨 Messaging endpoint', messagingServiceEndpoint)
    await options?.agent?.didManagerAddService({
      did: serverIdentifier.did,
      service: {
        id: serverIdentifier.did + '#msg',
        type: 'Messaging',
        description: 'Handles incoming POST messages',
        serviceEndpoint: messagingServiceEndpoint,
      },
    })
    // list DIDCommMessaging service at the same endpoint
    await options?.agent?.didManagerAddService({
      did: serverIdentifier.did,
      service: {
        id: serverIdentifier.did + '#msg-didcomm',
        type: 'DIDCommMessaging',
        description: 'Handles incoming DIDComm messages',
        serviceEndpoint: messagingServiceEndpoint,
      },
    })
  }
}
