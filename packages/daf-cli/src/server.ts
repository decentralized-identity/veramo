import express from 'express'
import program from 'commander'
import { AgentRouter } from 'daf-express'
import { getAgent } from './setup'

program
  .command('server')
  .description('Launch OpenAPI server')
  .option('--port <port>', 'Port', '3332')
  .option('--hostname <string>', 'Server hostname', 'localhost')
  .option('--https <boolean>', 'Use https instead of http', true)
  .option('--createDefaultIdentity <boolean>', 'Should the agent create default web did', true)
  .option('--messagingServiceEndpoint <path>', 'Path of the messaging service endpoint', '/messaging')
  .option(
    '--exposedMethods <string>',
    'Comma separated list of exposed agent methods (example: "resolveDid,handleMessage")',
  )
  .action(async (options) => {
    const app = express()
    const agent = getAgent(program.config)

    const exposedMethods = options.exposedMethods
      ? options.exposedMethods.split(',')
      : agent.availableMethods()

    const agentRouter = AgentRouter({
      getAgentForRequest: async (req) => agent,
      exposedMethods,
      serveSchema: true,
    })

    app.use('/', agentRouter)

    if (options.createDefaultIdentity) {
      let serverIdentity = await agent.identityManagerGetOrCreateIdentity({
        provider: 'did:web',
        alias: options.hostname,
      })
      console.log('Created:', serverIdentity.did)

      if (options.messagingServiceEndpoint) {
        const serviceEndpoint =
          (options.https ? 'https://' : 'http://') + options.hostname + options.messagingServiceEndpoint

        await agent.identityManagerAddService({
          did: serverIdentity.did,
          service: {
            id: 'msg',
            type: 'Messaging',
            serviceEndpoint,
          },
        })
        console.log('Added endpoint', serviceEndpoint)

        app.post(serviceEndpoint, express.text({ type: '*/*' }), async (req, res) => {
          try {
            const message = await agent.handleMessage({ raw: req.body, save: true })
            res.json({ id: message.id })
          } catch (e) {
            console.log(e)
            res.send(e.message)
          }
        })
      }

      app.get('/.well-known/did.json', async (req, res) => {
        serverIdentity = await agent.identityManagerGetOrCreateIdentity({
          provider: 'did:web',
          alias: options.hostname,
        })

        const didDoc = {
          '@context': 'https://w3id.org/did/v1',
          id: serverIdentity.did,
          publicKey: serverIdentity.keys.map((key) => ({
            id: serverIdentity.did + '#' + key.kid,
            type: key.type === 'Secp256k1' ? 'Secp256k1VerificationKey2018' : 'Ed25519VerificationKey2018',
            owner: serverIdentity.did,
            publicKeyHex: key.publicKeyHex,
          })),
          authentication: serverIdentity.keys.map((key) => ({
            type:
              key.type === 'Secp256k1'
                ? 'Secp256k1SignatureAuthentication2018'
                : 'Ed25519SignatureAuthentication2018',
            publicKey: serverIdentity.did + '#' + key.kid,
          })),
          service: serverIdentity.services,
        }

        res.json(didDoc)
      })
    }

    app.listen(options.port, () => {
      console.log(`🚀  Server ready at http://${options.hostname}:${options.port}`)
      console.log('Enabled agent methods', JSON.stringify(agent.availableMethods()))
      console.log('Exposed methods', JSON.stringify(exposedMethods))
    })
  })
