import { core, dataStore } from './setup'
import inquirer from 'inquirer'
import program from 'commander'
import { printTable } from 'console-table-printer'


program
  .command('identity-manager')
  .description('Manage identities')
  .option('-l, --list', 'List managed identities')
  .option('-t, --types', 'List available identity controller types')
  .option('-c, --create', 'Create identity')
  .option('-d, --delete', 'Delete identity')
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
        const types = await core.identityManager.listTypes()

        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'type',
            choices: types,
            message: 'Select identity controller'
          },
        ])
        const did = await core.identityManager.create(answers.type)
        printTable([{ type: cmd.create, did }])

      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.delete) {
      try {
        const myDids = await core.identityManager.listDids()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: myDids,
            message: 'Delete DID'
          },
        ])

        const issuers = await core.identityManager.listIssuers()
        const issuer = issuers.find(item => item.did === answers.did)
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
