import program from 'commander'
import './identity-manager'
import './did-resolver'
import './credential'
import './services'
import './data-explorer'

program.parse(process.argv)
if (!process.argv.slice(2).length) {
  program.outputHelp()
}
