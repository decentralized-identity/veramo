import * as ngrok from 'ngrok'
import express from 'express'
import * as Daf from 'daf-core'
import { core, dataStore, apolloServer } from './server/apollo'
import { webDidDocFromEthrDid } from './server/web-did-doc'
import program from 'commander'
import Debug from 'debug'

const debug = Debug('server')
Debug.enable('*')
const bodyParser = require('body-parser')

program
  .command('server')
  .description('A local graphQL server to interact with your data')
  .option('-p, --port', 'Set port to listen on, default to 8099')
  .option('-tg, --tguri', 'Set trust graph server URI')
  .option('-ws, --tgws', 'Set trust graph websocket URI')
  .action(async cmd => {
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
        debug('Getting Messages...')
      })

      app.get('/.well-known/did.json', (req, res) =>
        res.send(webDidDocFromEthrDid(issuer.did, hostname, keyPair)),
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

      let port = 8099

      if (cmd.port) {
        port = cmd.port
      }

      app.listen(port, async () => {
        debug(`Listening on port ${port}!`)
        const url = await ngrok.connect({
          addr: port,
          // subdomain: 'custom',
          // region: 'eu',
        })
        debug(`URL: ${url}`)
        debug(`DID Doc: ${url}/.well-known/did.json`)
        debug(`GraphQL: ${url}/graphql`)
        hostname = url.slice(8)
        debug(`did:web:${hostname}`)

        await core.startServices()
      })
    }

    main().catch(debug)
  })
