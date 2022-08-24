import express from 'express'
import { Command } from 'commander';
const program = new Command();
import { getConfig } from './setup.js'
import { createObjects } from './lib/objectCreator.js'

program
  .command('server')
  .description('Launch OpenAPI server')
  .option('-p, --port <number>', 'Optionally set port to override config')
  .action(async (cmd: any) => {
    const app = express()

    let server: any

    try {
      const config = createObjects(getConfig(program.opts().config), { server: '/server' })
      server = config.server
    } catch (e: any) {
      console.log(e.message)
      process.exit(1)
    }

    for (let router of server.use) {
      app.use(...router)
    }

    app.listen(cmd.port || server.port, async () => {
      console.log(`🚀 Cloud Agent ready at ${server.baseUrl}`)
    })
  })
