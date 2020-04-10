import { AbstractIdentity, EventTypes, Message, Credential } from 'daf-core'
import { ActionSendDIDComm, ActionTypes } from 'daf-did-comm'
import { ActionSignW3cVc, ActionTypes as W3cActionTypes } from 'daf-w3c'
import { agent } from './setup'

async function main() {
  // Getting existing identity or creating a new one
  let identity: AbstractIdentity
  const identities = await agent.identityManager.getIdentities()
  if (identities.length > 0) {
    identity = identities[0]
  } else {
    identity = await agent.identityManager.createIdentity()
  }

  // Sign verifiable credential
  const credential: Credential = await agent.handleAction({
    type: W3cActionTypes.signCredentialJwt,
    data: {
      issuer: identity.did,
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        id: 'did:web:uport.me',
        you: 'Rock',
      },
    },
  } as ActionSignW3cVc)

  // Send verifiable credential using DIDComm
  const message = await agent.handleAction({
    type: ActionTypes.sendMessageDIDCommAlpha1,
    data: {
      from: identity.did,
      to: 'did:web:uport.me',
      type: 'jwt',
      body: credential.raw,
    },
  } as ActionSendDIDComm)
  console.log({ message })
}

// This is triggered when DAF successfully saves a new message
// which can arrive from external services, or by sending it using `action.sendJwt`
agent.on(EventTypes.savedMessage, async (message: Message) => {
  console.log('\n\nSuccessfully sent message:', message)
})

main().catch(console.log)
