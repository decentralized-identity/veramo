import express from 'express'
import program from 'commander'
import ngrok from 'ngrok'
import parse from 'url-parse'
import { AgentRouter, ApiSchemaRouter, WebDidDocRouter, didDocEndpoint } from 'daf-express'
import swaggerUi from 'swagger-ui-express'
import { getAgent, getConfig } from './setup'
import { createObjects } from './lib/objectCreator'
import passport from 'passport'
import Bearer from 'passport-http-bearer'
import { IIdentity } from 'daf-core'
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

    /**
     * Ngrok configuration
     */
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

    /**
     *  Authentication setup
     */
    let authMiddleware = (req: any, res: any, next: any) => {
      next()
    }
    let securityScheme
    if (options.apiKey) {
      console.log('🔐 Secured by API Key')
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

    /**
     * Exposing agent methods
     */
    const exposedMethods = options.exposedMethods ? options.exposedMethods : agent.availableMethods()
    const getAgentForRequest = async (req: express.Request) => agent

    console.log('🗺  API base path', baseUrl + options.apiBasePath)
    app.use(
      options.apiBasePath,
      authMiddleware,
      AgentRouter({
        getAgentForRequest,
        exposedMethods,
      }),
    )

    /**
     * Exposing OpenAPI schema
     */
    console.log('🗺  OpenAPI schema', baseUrl + options.schemaPath)
    app.use(
      options.schemaPath,
      ApiSchemaRouter({
        basePath: options.apiBasePath,
        getAgentForRequest,
        exposedMethods,
        securityScheme,
      }),
    )

    console.log('📖 API Documentation', baseUrl + options.apiDocsPath)
    app.use(
      options.apiDocsPath,
      swaggerUi.serve,
      swaggerUi.setup(undefined, {
        swaggerOptions: {
          url: baseUrl + options.schemaPath,
        },
      }),
    )

    console.log('🧩 Available methods', agent.availableMethods().length)
    console.log('🛠  Exposed methods', exposedMethods.length)


    /**
     * Creating server identity and configuring messaging service endpoint
     */
    let serverIdentity: IIdentity
    if (options.defaultIdentity.create) {
      serverIdentity = await agent.identityManagerGetOrCreateIdentity({
        provider: 'did:web',
        alias: hostname,
      })
      console.log('🆔', serverIdentity.did)

      const messagingServiceEndpoint = baseUrl + options.defaultIdentity.messagingServiceEndpoint

      console.log('📨 Messaging endpoint', messagingServiceEndpoint)
      await agent.identityManagerAddService({
        did: serverIdentity.did,
        service: {
          id: serverIdentity.did + '#msg',
          type: 'Messaging',
          description: 'Handles incoming POST messages',
          serviceEndpoint: messagingServiceEndpoint,
        },
      })

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
    }

    /**
     * Handling 'did:web' requests ('/.well-known/did.json' and '/^\/(.+)\/did.json$/')
     * warning: 'did:web' method requires HTTPS (that is one of the reasons to use ngrok for development)
     */
    console.log('📋 DID Document ' + baseUrl + didDocEndpoint)
    console.log('📋 DID Documents ' + baseUrl + '/(.+)/did.json')
    app.use(WebDidDocRouter({ getAgentForRequest }))

    /**
     * Serving homepage
     */
    app.get('/', async (req, res) => {
      const links = [
        { label: 'API Docs', url: options.apiDocsPath },
        { label: 'API Schema', url: options.schemaPath },
        { label: 'DID Document', url: didDocEndpoint },
      ]

      const template = options.homePageTemplate || __dirname + '/../views/home.html'
      const rendered = await hbs.render(template, { links })
      res.send(rendered)
    })

    app.listen(cmd.port || options.port, async () => {
      console.log(`🚀 Cloud Agent ready at ${baseUrl}`)
    })
  })
