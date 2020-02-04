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
  .action(async cmd => {
    if (cmd.types) {
      const list = await core.identityManager.getIdentityProviderTypes()

      if (list.length > 0) {
        printTable(list)
      } else {
        console.log('No controllers')
      }
    }

    if (cmd.list) {
      const list = await core.identityManager.getIdentities()

      if (list.length > 0) {
        const dids = list.map(item => ({ type: item.identityProviderType, did: item.did }))
        printTable(dids)
      } else {
        console.log('No dids')
      }
    }

    if (cmd.create) {
      try {
        const types = await core.identityManager.getIdentityProviderTypes()

        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'type',
            choices: types.map(item => ({ name: `${item.type} - ${item.description}`, value: item.type })),
            message: 'Select identity controller',
          },
        ])
        const identity = await core.identityManager.createIdentity(answers.type)
        printTable([{ type: identity.identityProviderType, did: identity.did }])
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.delete) {
      try {
        const identities = await core.identityManager.getIdentities()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: identities.map(item => item.did),
            message: 'Delete DID',
          },
        ])

        const identity = await core.identityManager.getIdentity(answers.did)

        const result = await core.identityManager.deleteIdentity(identity.identityProviderType, identity.did)
        console.log('Success:', result)
      } catch (e) {
        console.error(e)
      }
    }
  })
