import { AbstractIdentity, Credential } from 'daf-core'
import { ActionSignW3cVc, ActionTypes as W3cActionTypes } from 'daf-w3c'
import { agent } from './setup'
import { Verified, ActionTypes as CredentialStatusActions } from './status-action-handler'

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

  // // Sign verifiable credential
  // const credential: Credential = await agent.handleAction({
  //   type: W3cActionTypes.signCredentialJwt,
  //   data: {
  //     issuer: identity.did,
  //     '@context': ['https://www.w3.org/2018/credentials/v1'],
  //     type: ['VerifiableCredential', 'Revocable'],
  //     credentialSubject: {
  //       id: 'did:web:uport.me',
  //       you: 'Rock',
  //     },
  //     // credentialStatus: {
  //     //   type: 'EthrStatusRegistry2019',
  //     //   id: 'rinkeby:0x97fd27892cdcD035dAe1fe71235c636044B59348'
  //     // },
  //   },
  // } as ActionSignW3cVc)

  console.log('\n\n\n', credential)

  const verification: Verified = await agent.handleAction({
    type: CredentialStatusActions.checkCredentialStatus,
    data: credential,
  })

  console.log('\n\n\n', verification)

  // const status = new Status({
  //   ...new EthrStatusRegistry({ infuraProjectId: '6b734e0b04454df8a6ce234023c04f26' }).asStatusMethod,
  // })

  // const didDoc = await agent.didResolver.resolve(credential.issuer.did)

  // const result = await status.checkStatus(credential.raw, didDoc)

  // console.log('revocation-status', result)

  //   Send verifiable credential using DIDComm
  //   const message = await agent.handleAction({
  //     type: ActionTypes.sendMessageDIDCommAlpha1,
  //     data: {
  //       from: identity.did,
  //       to: 'did:web:uport.me',
  //       type: 'jwt',
  //       body: credential.raw,
  //     },
  //   } as ActionSendDIDComm)
  //   console.log({ message })
}

// // This is triggered when DAF successfully saves a new message
// // which can arrive from external services, or by sending it using `action.sendJwt`
// agent.on(EventTypes.savedMessage, async (message: Message) => {
//   console.log('\n\nSuccessfully sent message:', message)
// })

main().catch(console.log)
