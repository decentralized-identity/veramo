import express from 'express'
import program from 'commander'
import ngrok from 'ngrok'
import parse from 'url-parse'
import { AgentRouter } from 'daf-express'
import { getOpenApiSchema } from 'daf-rest'
import swaggerUi from "swagger-ui-express";
import { getAgent, getConfig } from './setup'

program
  .command('server')
  .description('Launch OpenAPI server')
  .action(async () => {
    const app = express()
    const agent = getAgent(program.config)
    const { server: options } = getConfig(program.config)

    const exposedMethods = options.exposedMethods
      ? options.exposedMethods
      : agent.availableMethods()

    const apiBasePath = options.apiBasePath

    const agentRouter = AgentRouter({
      basePath: apiBasePath,
      getAgentForRequest: async (req) => agent,
      exposedMethods,
      serveSchema: true,
    })

    app.use(apiBasePath, agentRouter)



    app.listen(options.port, async () => {
      console.log(`🚀 Agent server ready at http://localhost:${options.port}`)
      console.log('🧩 Available methods', JSON.stringify(agent.availableMethods()))
      console.log('🛠  Exposed methods', JSON.stringify(exposedMethods))

      let hostname = options.hostname

      let baseUrl = 'http://' + hostname + ':' + options.port

      if (options.ngrok?.connect) {
        baseUrl = await ngrok.connect({
          addr: options.port,
          subdomain: options.ngrok.subdomain,
          region: options.ngrok.region,
        })
        hostname = parse(baseUrl).hostname
      }

      const openApiSchema = getOpenApiSchema(agent, apiBasePath, exposedMethods)
      openApiSchema.servers = [
        { url: baseUrl }
      ]

      app.use(
        options.apiDocsPath,
        swaggerUi.serve,
        swaggerUi.setup(openApiSchema)
      )
      console.log('📖 API Documentation', baseUrl + options.apiDocsPath)
  
      app.get(options.schemaPath, (req, res) => { res.json(openApiSchema) })
  

      console.log('🗺  OpenAPI schema', baseUrl + options.schemaPath)

      if (options.defaultIdentity.create) {
        let serverIdentity = await agent.identityManagerGetOrCreateIdentity({
          provider: 'did:web',
          alias: hostname,
        })
        console.log('🆔', serverIdentity.did)

        const messagingServiceEndpoint = baseUrl + options.defaultIdentity.messagingServiceEndpoint

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

        app.post(options.defaultIdentity.messagingServiceEndpoint, express.text({ type: '*/*' }), async (req, res) => {
          try {
            const message = await agent.handleMessage({ raw: req.body, save: true })
            console.log('Received message', message.type, message.id)
            res.json({ id: message.id })
          } catch (e) {
            console.log(e)
            res.send(e.message)
          }
        })

        const publicProfileServiceEndpoint = baseUrl + options.defaultIdentity.publicProfileServiceEndpoint

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

        app.get(options.defaultIdentity.publicProfileServiceEndpoint, async (req, res) => {
          try {
            const nameCredential = await agent.createVerifiableCredential({
              credential: {
                issuer: { id: serverIdentity.did },
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiableCredential'],
                issuanceDate: new Date().toISOString(),
                credentialSubject: {
                  id: serverIdentity.did,
                  name: options.defaultIdentity.publicName,
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
                  picture: options.defaultIdentity.publicPicture,
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
              controller: serverIdentity.did,
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

        app.get('/', (req, res) => {
          const links = [
            { label: "API Docs", url: options.apiDocsPath},
            { label: "API Schema", url: options.apiBasePath},
          ]
            
          const html = `<html><head><title>DID Agent</title></head><body>${links.map(l=>`<a href="${l.url}">${l.label}</a>`).join('<br/>')}</body></html>`
          res.send(html)
        })
      }
    })
  })
