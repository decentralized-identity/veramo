import { AbstractIdentity, Credential } from 'daf-core'
import { ActionSignW3cVc, ActionTypes as W3cActionTypes } from 'daf-w3c'
import { Verified, ActionTypes as CredentialStatusActions } from './status-action-handler'
import { ActionTypes as RevokerActions, ActionEthrRevoke } from './ethr-revoker-action-handler'

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
      type: ['VerifiableCredential', 'Revocable'],
      credentialSubject: {
        id: 'did:web:uport.me',
        you: 'Rock',
      },
      credentialStatus: {
        type: 'EthrStatusRegistry2019',
        id: 'rinkeby:0x97fd27892cdcD035dAe1fe71235c636044B59348',
      },
    },
  } as ActionSignW3cVc)

  // console.log('\n\n\n', credential)

  const verification: Verified = await agent.handleAction({
    type: CredentialStatusActions.checkCredentialStatus,
    data: credential,
  })
  console.log('\n\n\n Verification of a fresh credential:\n\n', verification)

  //---

  const revocationTx: string = await agent.handleAction({
    type: RevokerActions.revokeCredential,
    data: credential,
    waitForTx: true,
  } as ActionEthrRevoke)

  console.log(`credential revoked with transaction: ${revocationTx}`)

  //TODO: re-verify credential to show it was revoked
}

main().catch(console.log)
