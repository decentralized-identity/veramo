import program from 'commander'
import './identity-manager'
import './did-resolver'
import './credential'
import './data-explorer'
import './graphql'
import './sdr'
import './msg'
import './version'
import './crypto'
import './execute'
import './setup'

if (!process.argv.slice(2).length) {
  program.outputHelp()
} else {
  program.parse()
}
