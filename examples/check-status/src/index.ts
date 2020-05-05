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

  console.log('\n\n\n', credential)

  const verification: Verified = await agent.handleAction({
    type: CredentialStatusActions.checkCredentialStatus,
    data: credential,
  })
  console.log('\n\n\n Verification of a fresh credential:\n\n', verification)

  const revokedCredential =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpYXQiOjE1ODg2NjkwODMsInN1YiI6ImRpZDp3ZWI6dXBvcnQubWUiLCJub25jZSI6IjM4NzE4Njc0NTMiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQXdlc29tZW5lc3NDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7Iml0IjoicmVhbGx5IHdoaXBzIHRoZSBsbGFtbWEncyBhc3MhIn19LCJjcmVkZW50aWFsU3RhdHVzIjp7InR5cGUiOiJFdGhyU3RhdHVzUmVnaXN0cnkyMDE5IiwiaWQiOiJyaW5rZWJ5OjB4OTdmZDI3ODkyY2RjRDAzNWRBZTFmZTcxMjM1YzYzNjA0NEI1OTM0OCJ9LCJpc3MiOiJkaWQ6ZXRocjoweDU0ZDU5ZTNmZmQ3NjkxN2Y2MmRiNzAyYWMzNTRiMTdmMzg0Mjk1NWUifQ.39eegtmP3oyudaWXTXVgA7wIY610Gz0Hio4ivuFxhHwFnUdXkqiNHcf32Gwnoo05IiKeIjTl_3vYxdttm38pqA'

  const verification2: Verified = await agent.handleAction({
    type: CredentialStatusActions.checkCredentialStatus,
    data: revokedCredential,
  })

  console.log('\n\n\n Verification of a revoked credential:\n\n', verification2)
}

main().catch(console.log)
