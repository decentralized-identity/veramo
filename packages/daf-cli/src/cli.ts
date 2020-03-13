import program from 'commander'
import './identity-manager'
import './did-resolver'
import './credential'
import './services'
import './data-explorer'
import './graphql'
import './sdr'
import './msg'
import { initializeDb } from './setup'

const main = async () => {
  await initializeDb()
  program.parse(process.argv)
}

if (!process.argv.slice(2).length) {
  program.outputHelp()
} else {
  main().catch(e => console.log(e.message))
}
