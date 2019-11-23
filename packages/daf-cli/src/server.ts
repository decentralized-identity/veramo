import { core, dataStore, apolloServer } from './server/apollo'
import * as ngrok from 'ngrok'
import express from 'express'
import program from 'commander'
import Debug from 'debug'

const debug = Debug('server')
Debug.enable('*')

program
  .command('server')
  .description('GraphQL server to explore data store and daf tooling')
  .option('-p, --port', 'Set port to listen on. Default -> 8099')
  .action(async cmd => {
    async function main() {
      // Default port
      let port = 8099

      if (cmd.port) {
        port = cmd.port
      }

      const app = express()
      apolloServer.applyMiddleware({ app })
      await dataStore.initialize()

      app.listen(port, async () => {
        debug(`Listening on port ${port}!`)
        const url = await ngrok.connect({
          addr: port,
        })
        debug(`URL: ${url}`)
        debug(`GraphQL: ${url}/graphql`)
        await core.startServices()
      })
    }

    main().catch(debug)
  })
