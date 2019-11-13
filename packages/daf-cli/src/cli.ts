import Debug from 'debug'
Debug.enable('*')

import { core, dataStore } from './setup'
import inquirer from 'inquirer'
import program from 'commander'
import { printTable } from 'console-table-printer'


program
  .command('identity-manager')
  .description('Manage identities')
  .option('-l, --list', 'List managed identities')
  .option('-t, --types', 'List available identity controller types')
  .option('-c, --create <type>', 'Create identity using <type> identity controller')
  .option('-d, --delete <did>', 'Create identity using <type> identity controller')
  .action(async (cmd) => {
    if (cmd.types) {
      const list = await core.identityManager.listTypes()
      
      if (list.length > 0) {
        const types = list.map(item => ({ type: item }))
        printTable(types)
      } else {
        console.log('No controllers')
      }
    }

    if (cmd.list) {
      const list = await core.identityManager.listIssuers()
      
      if (list.length > 0) {
        const dids = list.map(item => ({type: item.type, did: item.did}))
        printTable(dids)
      } else {
        console.log('No dids')
      }
    }

    if (cmd.create) {
      try {
        const did = await core.identityManager.create(cmd.create)
        printTable([{ type: cmd.create, did }])

      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.delete) {
      try {
        const issuers = await core.identityManager.listIssuers()
        const issuer = issuers.find(item => item.did === cmd.delete)
        if (issuer) {
          const result = await core.identityManager.delete(issuer.type, issuer.did)
          console.log('Success:', result)
        } else {
          console.log('Did not found')
        }

      } catch (e) {
        console.error(e)
      }
    }


  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}