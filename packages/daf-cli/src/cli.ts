import program from 'commander'
import './identity-manager'
import './did-resolver'
import './credential'
import './services'
import './data-explorer'
import './graphql'
import './sdr'

program.parse(process.argv)
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
