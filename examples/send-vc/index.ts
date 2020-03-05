import { AbstractIdentity, EventTypes, Message, Key, Identity } from 'daf-core'
import { ActionSendJWT } from 'daf-did-comm'
import { ActionSignW3cVc } from 'daf-w3c'
import { core } from './setup'
import { createConnection } from 'typeorm'

async function main() {
  await createConnection({
    // "type": "sqlite",
    // "database": "database.sqlite",
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'simonas',
    password: '',
    database: 'simonas',
    synchronize: true,
    logging: true,
    entities: [Key, Identity],
  })

  // Getting existing identity or creating a new one
  let identity: AbstractIdentity
  const identities = await core.identityManager.getIdentities()
  if (identities.length > 0) {
    identity = identities[0]
  } else {
    const identityProviders = await core.identityManager.getIdentityProviderTypes()
    identity = await core.identityManager.createIdentity(identityProviders[0].type)
  }

  console.log(identity.did)

  // Sign verifiable credential
  const vcJwt = await core.handleAction({
    type: 'action.sign.w3c.vc',
    did: identity.did,
    data: {
      sub: 'did:web:uport.me',
      vc: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        credentialSubject: {
          you: 'Rock',
        },
      },
    },
  } as ActionSignW3cVc)

  // Send verifiable credential using DIDComm or TrustGraph
  await core.handleAction({
    type: 'action.sendJwt',
    data: {
      from: identity.did,
      to: 'did:web:uport.me',
      jwt: vcJwt,
    },
  } as ActionSendJWT)
}

// This is triggered when DAF successfully validates a new message
// which can arrive from external services, or by sending it using `action.sendJwt`
core.on(EventTypes.validatedMessage, async (message: Message) => {
  console.log('\n\nSuccessfully sent message:', {
    id: message.id,
    type: message.type,
    sender: message.sender,
    receiver: message.receiver,
    timestamp: message.timestamp,
    data: message.data,
    metadata: message.allMeta,
    raw: message.raw,
  })
})

main().catch(console.log)
