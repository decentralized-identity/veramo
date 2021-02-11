import express from 'express'
var cors = require('cors')
import program, { addOption } from 'commander'
import ngrok from 'ngrok'
import parse from 'url-parse'
import { AgentRouter, ApiSchemaRouter, WebDidDocRouter, didDocEndpoint } from '@veramo/remote-server'
import swaggerUi from 'swagger-ui-express'
import { getAgent, getConfig } from './setup'
import { createObjects } from './lib/objectCreator'
import passport from 'passport'
import Bearer from 'passport-http-bearer'
import { IIdentifier } from '@veramo/core'
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

    let server: any

    try {
      const config = createObjects(getConfig(program.opts().config), { server: '/server' })

      server = config.server
    } catch (e) {
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
