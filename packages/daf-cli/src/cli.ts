import program from 'commander'
import './identity-manager'
import './did-resolver'
import './credential'
import './services'

program.parse(process.argv)
if (!process.argv.slice(2).length) {
  program.outputHelp()
}