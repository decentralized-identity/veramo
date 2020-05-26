import program from 'commander'
import './identity-manager'
import './did-resolver'
import './credential'
import './services'
import './data-explorer'
import './graphql'
import './sdr'
import './msg'
import './version'
import './crypto'

if (!process.argv.slice(2).length) {
  program.outputHelp()
} else {
  program.parse(process.argv)
}
