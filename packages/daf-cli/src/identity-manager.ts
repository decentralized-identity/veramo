import { IIdentityManagerCreateIdentityArgs } from 'daf-core'
import { agent } from './setup'
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
  .option('-e, --export', 'Export identity')
  .option('-i, --import', 'Import identity')
  .option('-s, --service', 'Add service endpoint')
  .option('-p, --publicKey', 'Add public key')
  .action(async (cmd) => {
    if (cmd.types) {
      const providers = await agent.identityManagerGetProviders()
      const list = providers.map((provider) => ({ provider }))

      if (list.length > 0) {
        printTable(list)
      } else {
        console.log('No identity providers')
      }
    }

    if (cmd.list) {
      const list = await agent.identityManagerGetIdentities()

      if (list.length > 0) {
        const dids = list.map((item) => ({ provider: item.provider, alias: item.alias, did: item.did }))
        printTable(dids)
      } else {
        console.log('No dids')
      }
    }

    if (cmd.create) {
      try {
        const providers = await agent.identityManagerGetProviders()
        const kms = await agent.keyManagerGetKeyManagementSystems()
        const args: IIdentityManagerCreateIdentityArgs = {}

        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'provider',
            choices: providers,
            message: 'Select identity provider',
          },
          {
            type: 'list',
            name: 'kms',
            choices: kms,
            message: 'Select key management system',
          },
          {
            type: 'input',
            name: 'alias',
            message: 'Enter alias',
          },
        ])

        const identity = await agent.identityManagerCreateIdentity(answers)
        printTable([{ provider: identity.provider, alias: identity.alias, did: identity.did }])
      } catch (e) {
        console.error(e.message)
      }
    }

    if (cmd.delete) {
      try {
        const identities = await agent.identityManagerGetIdentities()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: identities.map((item) => item.did),
            message: 'Delete DID',
          },
        ])

        const result = await agent.identityManagerDeleteIdentity({
          did: answers.did,
        })

        console.log('Success:', result)
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.service) {
      try {
        const identities = await agent.identityManagerGetIdentities()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: identities.map((item) => item.did),
            message: 'Select DID',
          },
          {
            type: 'text',
            name: 'type',
            message: 'Service type',
            default: 'Messaging',
          },
          {
            type: 'text',
            name: 'endpoint',
            message: 'Endpoint',
          },
          {
            type: 'text',
            name: 'id',
            message: 'ID',
          },
        ])

        const result = await agent.identityManagerAddService({
          did: answers.did,
          service: {
            type: answers.type,
            serviceEndpoint: answers.endpoint,
            id: answers.id,
          },
        })

        console.log('Success:', result)
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.publicKey) {
      try {
        const identities = await agent.identityManagerGetIdentities()
        const kms = await agent.keyManagerGetKeyManagementSystems()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: identities.map((item) => item.did),
            message: 'Select DID',
          },
          {
            type: 'list',
            name: 'kms',
            choices: kms,
            message: 'Select key management system',
          },
          {
            type: 'list',
            name: 'type',
            choices: ['Ed25519', 'Secp256k1'],
            message: 'Type',
          },
        ])

        const key = await agent.keyManagerCreateKey({
          kms: answers.kms,
          type: answers.type,
        })

        const result = await agent.identityManagerAddKey({
          did: answers.did,
          key,
        })

        console.log('Success:', result)
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.export) {
      try {
        const identities = await agent.identityManagerGetIdentities()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: identities.map((item) => ({
              name: item.did + ' ' + item.alias,
              value: item.did,
            })),
            message: 'Select DID',
          },
        ])

        const identity = await agent.identityManagerGetIdentity({ did: answers.did })

        console.log(JSON.stringify(identity))
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.import) {
      try {
        const answers = await inquirer.prompt([
          {
            type: 'text',
            name: 'identity',
            message: 'Identity (JSON object)',
          },
        ])

        const identity = await agent.identityManagerImportIdentity(JSON.parse(answers.identity))
        console.log(identity)
      } catch (e) {
        console.error(e)
      }
    }
  })
