import Debug from 'debug'
Debug.enable('*')

import program from 'commander'
import './identity-manager'
import './did-resolver'

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}