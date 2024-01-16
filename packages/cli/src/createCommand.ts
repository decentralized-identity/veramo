import { Command } from 'commander'
import module from 'module'

import { config } from './config.js'
import { credential } from './credential.js'
import { dev } from './dev.js'
import { did } from './did.js'
import { discover } from './discover.js'
import { execute } from './execute.js'
import { message } from './message.js'
import { presentation } from './presentation.js'
import { explore } from './explore/index.js'
import { sdr } from './sdr.js'
import { server } from './server.js'
import { mediate } from './mediate.js'

const requireCjs = module.createRequire(import.meta.url)
const { version } = requireCjs('../package.json')

const veramo = new Command('veramo')
  .version(version, '-v, --version')
  .option('--config <string>', 'Configuration file', './agent.yml')
  .addCommand(config)
  .addCommand(credential)
  .addCommand(dev)
  .addCommand(did)
  .addCommand(discover)
  .addCommand(execute)
  .addCommand(explore)
  .addCommand(message)
  .addCommand(presentation)
  .addCommand(sdr)
  .addCommand(server)
  .addCommand(mediate)

export { veramo }
