import express from 'express'
import program from 'commander'
import ngrok from 'ngrok'
import parse from 'url-parse'
import { AgentRouter, AgentApiSchemaRouter, AgentDidDocRouter, didDocEndpoint } from 'daf-express'
import swaggerUi from 'swagger-ui-express'
import { getAgent, getConfig } from './setup'
import { createObjects } from './lib/objectCreator'
import passport from 'passport'
import Bearer from 'passport-http-bearer'
const exphbs = require('express-handlebars')
const hbs = exphbs.create({
  helpers: {
    toJSON: function (obj: object) {
      return JSON.stringify(obj, null, 2)
    },
  },
})

program
  .command('server')
  .description('Launch OpenAPI server')
  .option('-p, --port <number>', 'Optionally set port to override config')
  .action(async (cmd) => {
    const app = express()
    const agent = getAgent(program.config)
    const { server: options } = createObjects(getConfig(program.config), { server: '/server' })

    const exposedMethods = options.exposedMethods ? options.exposedMethods : agent.availableMethods()

    let authMiddleware = (req: any, res: any, next: any) => {
      next()
    }
    let securityScheme
    if (options.apiKey) {
      passport.use(
        new Bearer.Strategy((token, done) => {
          if (!options.apiKey || options.apiKey === token) {
            done(null, {}, { scope: 'all' })
          } else {
            done(null, false)
          }
        }),
      )

      authMiddleware = passport.authenticate('bearer', { session: false })
      securityScheme = 'bearer'
    }

    const getAgentForRequest = async (req: express.Request) => agent

    app.use(
      options.apiBasePath,
      authMiddleware,
      AgentRouter({
        getAgentForRequest,
        exposedMethods,
      }),
    )

    app.use(
      options.schemaPath,
      AgentApiSchemaRouter({
        basePath: options.apiBasePath,
        getAgentForRequest,
        exposedMethods,
        securityScheme,
      }),
    )

    app.use(AgentDidDocRouter({ getAgentForRequest }))

    app.listen(cmd.port || options.port, async () => {
      console.log(`🚀 Agent server ready at http://localhost:${cmd.port || options.port}`)
      console.log('🧩 Available methods', agent.availableMethods().length)
      console.log('🛠  Exposed methods', exposedMethods.length)

      let baseUrl = options.baseUrl

      if (options.ngrok?.connect) {
        baseUrl = await ngrok.connect({
          addr: cmd.port || options.port,
          subdomain: options.ngrok.subdomain,
          region: options.ngrok.region,
          authtoken: options.ngrok.authtoken,
        })
        app.set('trust proxy', 'loopback')
      }
      const hostname = parse(baseUrl).hostname

      app.use(
        options.apiDocsPath,
        swaggerUi.serve,
        swaggerUi.setup(undefined, {
          swaggerOptions: {
            url: baseUrl + options.schemaPath,
          },
        }),
      )
      console.log('📖 API Documentation', baseUrl + options.apiDocsPath)
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

        app.post(
          options.defaultIdentity.messagingServiceEndpoint,
          express.text({ type: '*/*' }),
          async (req, res) => {
            try {
              const message = await agent.handleMessage({ raw: req.body, save: true })
              console.log('Received message', message.type, message.id)
              res.json({ id: message.id })
            } catch (e) {
              console.log(e)
              res.send(e.message)
            }
          },
        )

        console.log('📋 DID Document ' + baseUrl + didDocEndpoint)

        app.get('/', async (req, res) => {
          const links = [
            { label: 'API Docs', url: options.apiDocsPath },
            { label: 'API Schema', url: options.schemaPath },
            { label: 'DID Document', url: didDocEndpoint },
          ]

          const presentations = await agent.dataStoreORMGetVerifiablePresentations({
            where: [
              { column: 'holder', value: [serverIdentity.did] },
              { column: 'verifier', value: [baseUrl] },
            ],
          })

          const verifiablePresentation =
            presentations.length > 0 ? presentations[presentations.length - 1].verifiablePresentation : null
          const template = options.homePageTemplate || __dirname + '/../views/home.html'
          const rendered = await hbs.render(template, { verifiablePresentation, links })
          res.send(rendered)
        })
      }
    })
  })
