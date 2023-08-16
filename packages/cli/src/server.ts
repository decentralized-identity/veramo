import express from 'express'
import { Command } from 'commander'
import { getConfig } from './setup.js'
import { createObjects } from './lib/objectCreator.js'

const DEFAULT_SERVER_PORT = 3332

const server = new Command('server')
  .description('Launch OpenAPI server')
  .option('-p, --port <number>', 'Optionally set port to override config')
  .action(async (opts: { port: number }, cmd: Command) => {
    const app = express()

    let server: any

    try {
      const config = await createObjects(await getConfig(cmd.optsWithGlobals().config), { server: '/server' })
      server = config.server
    } catch (e: any) {
      console.error(e.message)
      process.exit(1)
    }

    const port = opts.port || server.port || DEFAULT_SERVER_PORT
    let baseUrl = new URL(server.baseUrl)
    if (baseUrl.hostname === 'localhost' || baseUrl.hostname === '127.0.0.1') {
      baseUrl.port = port
      server.baseUrl = baseUrl.toString()
    }

    for (let router of server.use) {
      app.use(...router)
      if (typeof router[0] === 'string') {
        console.log(`Listening to route: ${new URL(router[0], server.baseUrl).toString()}`)
      }
    }

    app.listen(port, async () => {
      console.log(`🚀 Cloud Agent ready at ${server.baseUrl}`)
    })
  })

export { server }
