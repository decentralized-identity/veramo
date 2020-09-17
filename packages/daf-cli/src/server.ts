import express from 'express'
import program from 'commander'
import ngrok from 'ngrok'
import parse from 'url-parse'
import { AgentRouter } from 'daf-express'
import { getAgent } from './setup'

program
  .command('server')
  .description('Launch OpenAPI server')
  .option('--port <port>', 'Port', '3332')
  .option('--hostname <string>', 'Server hostname', 'localhost')
  .option('--ngrok', 'Open ngrok tunnel')
  .option('--ngrokSubdomain <string>', 'ngrok subdomain')
  .option('--ngrokRegion <string>', 'ngrok region')
  .option('--createDefaultIdentity <boolean>', 'Should the agent create default web did', true)
  .option('--messagingServiceEndpoint <path>', 'Path of the messaging service endpoint', '/messaging')
  .option(
    '--publicProfileServiceEndpoint <path>',
    'Path of the public profile service endpoint',
    '/public-profile',
  )
  .option('--publicName <string>', 'Public name', 'Service')
  .option('--publicPicture <string>', 'Public picture', 'https://picsum.photos/200')
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

    app.listen(options.port, async () => {
      console.log(`🚀 Agent server ready at http://localhost:${options.port}`)
      console.log('🧩 Available methods', JSON.stringify(agent.availableMethods()))
      console.log('🛠  Exposed methods', JSON.stringify(exposedMethods))

      let hostname = options.hostname

      let baseUrl = 'http://' + hostname + ':' + options.port

      if (options.ngrok) {
        baseUrl = await ngrok.connect({
          addr: options.port,
          subdomain: options.ngrokSubdomain,
          region: options.ngrokRegion,
        })
        hostname = parse(baseUrl).hostname
      }

      if (options.createDefaultIdentity) {
        let serverIdentity = await agent.identityManagerGetOrCreateIdentity({
          provider: 'did:web',
          alias: hostname,
        })
        console.log('🆔', serverIdentity.did)

        const messagingServiceEndpoint = 'https://' + hostname + options.messagingServiceEndpoint

        await agent.identityManagerAddService({
          did: serverIdentity.did,
          service: {
            id: serverIdentity.did + '#msg',
            type: 'Messaging',
            description: 'Handles incoming POST messages',
            serviceEndpoint: messagingServiceEndpoint,
          },
        })
        console.log('📨 Messaging endpoint', messagingServiceEndpoint)

        app.post(options.messagingServiceEndpoint, express.text({ type: '*/*' }), async (req, res) => {
          try {
            const message = await agent.handleMessage({ raw: req.body, save: true })
            console.log('Received message', message.type, message.id)
            res.json({ id: message.id })
          } catch (e) {
            console.log(e)
            res.send(e.message)
          }
        })

        const publicProfileServiceEndpoint = 'https://' + hostname + options.publicProfileServiceEndpoint

        await agent.identityManagerAddService({
          did: serverIdentity.did,
          service: {
            id: serverIdentity.did + '#pub',
            type: 'PublicProfile',
            description: 'Public profile verifiable presentation',
            serviceEndpoint: publicProfileServiceEndpoint,
          },
        })
        console.log('🌍 Public Profile', publicProfileServiceEndpoint)

        app.get(options.publicProfileServiceEndpoint, async (req, res) => {
          try {
            const nameCredential = await agent.createVerifiableCredential({
              credential: {
                issuer: { id: serverIdentity.did },
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiableCredential'],
                issuanceDate: new Date().toISOString(),
                credentialSubject: {
                  id: serverIdentity.did,
                  name: options.publicName,
                },
              },
              proofFormat: 'jwt',
            })

            const pictureCredential = await agent.createVerifiableCredential({
              credential: {
                issuer: { id: serverIdentity.did },
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiableCredential'],
                issuanceDate: new Date().toISOString(),
                credentialSubject: {
                  id: serverIdentity.did,
                  picture: options.publicPicture,
                },
              },
              proofFormat: 'jwt',
            })

            const publicProfile = await agent.createVerifiablePresentation({
              presentation: {
                verifier: [],
                holder: serverIdentity.did,
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiablePresentation', 'PublicProfile'],
                issuanceDate: new Date().toISOString(),
                verifiableCredential: [nameCredential, pictureCredential],
              },
              proofFormat: 'jwt',
            })

            res.json(publicProfile)
          } catch (e) {
            console.log(e)
            res.send(e.message)
          }
        })

        const didDocEndpoint = '/.well-known/did.json'
        app.get(didDocEndpoint, async (req, res) => {
          serverIdentity = await agent.identityManagerGetOrCreateIdentity({
            provider: 'did:web',
            alias: hostname,
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
        console.log('📋 DID Document ' + baseUrl + didDocEndpoint)
      }
    })
  })
