import * as Daf from 'daf-core'
import * as Ethr from 'daf-ethr-did-fs'
import * as W3c from 'daf-w3c'
import * as TG from 'daf-trust-graph'
import * as DBG from 'daf-debug'
import * as DidJwt from 'daf-did-jwt'
import { DafUniversalResolver } from 'daf-resolver-universal'

import Debug from 'debug'
Debug.enable('*')

const messageValidator = new DBG.MessageValidator()
messageValidator.setNext(new DidJwt.MessageValidator()).setNext(new W3c.MessageValidator())

const actionHandler = new DBG.ActionHandler()
actionHandler.setNext(new TG.ActionHandler()).setNext(new W3c.ActionHandler())

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

const didResolver = new DafUniversalResolver({ url: 'https://uniresolver.io/1.0/identifiers/' })

export const core = new Daf.Core({
  identityProviders: [
    new Ethr.IdentityProvider({
      fileName: './identity-store.json',
      network: 'rinkeby',
      rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
      resolver: didResolver,
    }),
  ],
  serviceControllers: [],
  didResolver,
  messageValidator,
  actionHandler,
})

async function main() {
  // Get or create new issuer
  let identity: Daf.AbstractIdentity
  const identities = await core.identityManager.getIdentities()
  if (identities.length > 0) {
    identity = identities[0]
  } else {
    const identityProviders = core.identityManager.getIdentityProviderTypes()
    identity = await core.identityManager.createIdentity(identityProviders[0].type)
  }

  // Sign credential
  const credential = await core.handleAction({
    type: W3c.ActionTypes.signVc,
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
  } as W3c.ActionSignW3cVc)

  // Send credential using TrustGraph
  await core.handleAction({
    type: TG.ActionTypes.sendJwt,
    data: {
      from: identity.did,
      to: 'did:web:uport.me',
      jwt: credential,
    },
  } as TG.ActionSendJWT)
}

main().catch(console.log)
