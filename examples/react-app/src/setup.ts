import * as Daf from 'daf-core'
import * as W3c from 'daf-w3c'
import * as TG from 'daf-trust-graph'
import * as DBG from 'daf-debug'
import * as DidJwt from 'daf-did-jwt'
import { DafUniversalResolver } from 'daf-resolver-universal'
import { EthrDidLocalStorageController } from 'daf-ethr-did-local-storage'

import Debug from 'debug'
Debug.enable('*')

const messageValidator = new DBG.MessageValidator()
messageValidator.setNext(new DidJwt.MessageValidator()).setNext(new W3c.MessageValidator())

const actionHandler = new DBG.ActionHandler()
actionHandler.setNext(new TG.ActionHandler()).setNext(new W3c.ActionHandler())

export const core = new Daf.Core({
  identityControllers: [new EthrDidLocalStorageController()],
  serviceControllers: [],
  didResolver: new DafUniversalResolver({ url: 'https://uniresolver.io/1.0/identifiers/' }),
  messageValidator,
  actionHandler,
})

async function main() {
  // Get or create new issuer
  let issuer: Daf.Issuer
  const issuers = await core.identityManager.listIssuers()
  if (issuers.length > 0) {
    issuer = issuers[0]
  } else {
    const types = core.identityManager.listTypes()
    const did = await core.identityManager.create(types[0])
    issuer = await core.identityManager.issuer(did)
  }

  // Sign credential
  const credential = await core.handleAction({
    type: W3c.ActionTypes.signVc,
    did: issuer.did,
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
  } as W3c.ActionSignW3cVc)

  console.log(credential)

  // Send credential using TrustGraph
  await core.handleAction({
    type: TG.ActionTypes.sendJwt,
    data: {
      from: issuer.did,
      to: 'did:web:uport.me',
      jwt: credential,
    },
  } as TG.ActionSendJWT)
}

main().catch(console.log)
