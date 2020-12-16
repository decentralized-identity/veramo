import program from 'commander'
import inquirer from 'inquirer'

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

import './did'
import './did-resolver'
import './credential'
import './data-explorer'
import './sdr'
import './msg'
import './version'
import './crypto'
import './execute'
import './server'
import './setup'
import './schema'

if (!process.argv.slice(2).length) {
  program.outputHelp()
} else {
  program.parse(process.argv)
}
