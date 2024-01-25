import { Command } from 'commander'
import module from 'module'

import { config } from './config'
import { credential } from './credential'
import { dev } from './dev'
import { did } from './did'
import { discover } from './discover'
import { execute } from './execute'
import { message } from './message'
import { presentation } from './presentation'
import { explore } from './explore/index'
import { sdr } from './sdr'
import { server } from './server'
import { mediate } from './mediate'

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
