import { program } from 'commander'
import inquirer from 'inquirer'
import inquirerAutoPrompt from 'inquirer-autocomplete-prompt'

inquirer.registerPrompt('autocomplete', inquirerAutoPrompt)

import './did.js'
import './credential.js'
import './presentation.js'
import './explore/index.js'
import './sdr.js'
import './message.js'
import './discover.js'
import './version.js'
import './execute.js'
import './server.js'
import './setup.js'
import './config.js'
import './dev.js'

if (!process.argv.slice(2).length) {
  program.outputHelp()
} else {
  program.parse(process.argv)
}
