import * as ngrok from 'ngrok'
import express from 'express'
import * as Daf from 'daf-core'

const bodyParser = require('body-parser')
import { core, dataStore, apolloServer } from './setup'
import { webDidDocFromEthrDid } from './web-did-doc'

import Debug from 'debug'
Debug.enable('*')
const debug = Debug('main')

core.on(Daf.EventTypes.validatedMessage, async (eventType: string, message: Daf.Types.ValidatedMessage) => {
  debug('New message %s', message.hash)
  debug('Meta %O', message.meta)
  await dataStore.saveMessage(message)
})

let hostname: string

async function main() {
  // Get of create new issuer
  let issuer: Daf.Issuer
  const issuers = await core.identityManager.listIssuers()
  if (issuers.length > 0) {
    issuer = issuers[0]
  } else {
    const types = await core.identityManager.listTypes()
    const did = await core.identityManager.create(types[0])
    issuer = await core.identityManager.issuer(did)
  }

  // Get of create new encryption keyPair
  let keyPair: Daf.KeyPair
  if (core.encryptionKeyManager) {
    const existingKeyPair = await core.encryptionKeyManager.getKeyPairForDid(issuer.did)

    if (!existingKeyPair) {
      keyPair = await core.encryptionKeyManager.createKeyPairForDid(issuer.did)
    } else {
      keyPair = existingKeyPair
    }
    debug('Public Encryption key %o', keyPair.publicKeyHex)
  }

  const app = express()
  app.use(bodyParser.text())

  app.get('/', async (req, res) => {
    const messages = await dataStore.findMessages({})
    res.send('Messages:<br/>' + messages.map((message: any) => `${message.type} - ${message.hash}<br/>`))
  })

  app.get('/.well-known/did.json', (req, res) =>
    res.send(webDidDocFromEthrDid(issuer.ethereumAddress ? issuer.ethereumAddress : '', hostname, keyPair)),
  )

  app.post('/didcomm', async (req, res) => {
    core.onRawMessage({
      raw: req.body,
      meta: [
        {
          sourceType: 'httpsPost',
          sourceId: hostname + '/didcomm',
        },
      ],
    })
    res.send('OK')
  })

  apolloServer.applyMiddleware({ app })

  await dataStore.initialize()

  const port = 8099
  app.listen(port, async () => {
    debug(`Listening on port ${port}!`)
    const url = await ngrok.connect({
      addr: port,
      // subdomain: 'someservice',
      // region: 'eu',
    })
    debug(`URL: ${url}`)
    debug(`DID Doc: ${url}/.well-known/did.json`)
    debug(`GraphQL: ${url}/graphql`)
    hostname = url.slice(8)
    debug(`did:web:${hostname}`)

    await core.startServices()
    await core.syncServices(await dataStore.latestMessageTimestamps())
  })
}

main().catch(debug)
