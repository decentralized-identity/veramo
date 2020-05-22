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
  .option('--encrypt', 'Encrypt data to a recipient DID')
  .option('--decrypt', 'Decrypt data')
  .action(async cmd => {
    if (cmd.types) {
      const providers = (await agent).identityManager.getIdentityProviders()
      const list = providers.map(provider => ({
        type: provider.type,
        description: provider.description,
      }))

      if (list.length > 0) {
        printTable(list)
      } else {
        console.log('No controllers')
      }
    }

    if (cmd.list) {
      const list = await (await agent).identityManager.getIdentities()

      if (list.length > 0) {
        const dids = list.map(item => ({ type: item.identityProviderType, did: item.did }))
        printTable(dids)
      } else {
        console.log('No dids')
      }
    }

    if (cmd.create) {
      try {
        const providers = await (await agent).identityManager.getIdentityProviders()
        let type
        let options
        if (providers.length > 1) {
          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'type',
              choices: providers.map(provider => ({
                name: `${provider.type} - ${provider.description}`,
                value: provider.type,
              })),
              message: 'Select identity provider',
            },
          ])

          type = answers.type

          if (type === 'web-did') {
            const answers2 = await inquirer.prompt([
              {
                type: 'input',
                name: 'domain',
                message: 'Enter domain',
              },
            ])
            options = { domain: answers2.domain }
          }
        }
        const identity = await (await agent).identityManager.createIdentity(type, options)
        printTable([{ type: identity.identityProviderType, did: identity.did }])
      } catch (e) {
        console.error(e.message)
      }
    }

    if (cmd.delete) {
      try {
        const identities = await (await agent).identityManager.getIdentities()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: identities.map(item => item.did),
            message: 'Delete DID',
          },
        ])

        const identity = await (await agent).identityManager.getIdentity(answers.did)

        const result = await (await agent).identityManager.deleteIdentity(
          identity.identityProviderType,
          identity.did,
        )
        console.log('Success:', result)
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.service) {
      try {
        const identities = await (await agent).identityManager.getIdentities()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: identities.map(item => item.did),
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
        ])

        const identity = await (await agent).identityManager.getIdentity(answers.did)
        const result = await identity.identityController.addService({
          type: answers.type,
          serviceEndpoint: answers.endpoint,
          id: '',
        })
        console.log('Success:', result)
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.publicKey) {
      try {
        const identities = await (await agent).identityManager.getIdentities()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: identities.map(item => item.did),
            message: 'Select DID',
          },
          {
            type: 'list',
            name: 'type',
            choices: ['Ed25519', 'Secp256k1'],
            message: 'Type',
          },
        ])

        const identity = await (await agent).identityManager.getIdentity(answers.did)
        const result = await identity.identityController.addPublicKey(answers.type)
        console.log('Success:', result)
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.encrypt) {
      try {
        const identities = await (await agent).identityManager.getIdentities()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: identities.map(item => item.did),
            message: 'Select DID',
          },
          {
            type: 'text',
            name: 'to',
            message: 'Recipient DID',
          },
          {
            type: 'text',
            name: 'message',
            message: 'Message',
          },
        ])

        const identity = await (await agent).identityManager.getIdentity(answers.did)
        const key = await identity.keyByType('Ed25519')
        const didDoc = await (await agent).didResolver.resolve(answers.to)
        const publicKey = didDoc?.publicKey.find(item => item.type == 'Ed25519VerificationKey2018')
        if (!publicKey?.publicKeyHex) throw Error('Recipient does not have encryption publicKey')

        const result = await key.encrypt(
          {
            type: 'Ed25519',
            publicKeyHex: publicKey?.publicKeyHex,
            kid: publicKey?.publicKeyHex,
          },
          answers.message,
        )
        console.log('Success:', result)
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.decrypt) {
      try {
        const identities = await (await agent).identityManager.getIdentities()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: identities.map(item => item.did),
            message: 'Select DID',
          },
          {
            type: 'text',
            name: 'message',
            message: 'Encrypted message',
          },
        ])

        const identity = await (await agent).identityManager.getIdentity(answers.did)
        const key = await identity.keyByType('Ed25519')
        const result = await key.decrypt(answers.message)
        console.log('Success:', result)
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.export) {
      try {
        const identities = await (await agent).identityManager.getIdentities()
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'did',
            choices: identities.map(item => item.did),
            message: 'Select DID',
          },
        ])

        const identity = await (await agent).identityManager.getIdentity(answers.did)
        const secret = await (await agent).identityManager.exportIdentity(
          identity.identityProviderType,
          identity.did,
        )
        console.log(secret)
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.import) {
      try {
        const providers = await (await agent).identityManager.getIdentityProviders()

        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'provider',
            choices: providers.map(item => item.type),
            message: 'Select identity provider',
          },
          {
            type: 'text',
            name: 'secret',
            message: 'Secret',
          },
        ])

        const identity = await (await agent).identityManager.importIdentity(answers.provider, answers.secret)
        console.log(identity)
      } catch (e) {
        console.error(e)
      }
    }
  })
