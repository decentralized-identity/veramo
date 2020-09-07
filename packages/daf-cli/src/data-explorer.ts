import { IMessage } from 'daf-core'
import { agent } from './setup'
import program from 'commander'
import inquirer from 'inquirer'
import { formatDistanceToNow } from 'date-fns'
import { printTable } from 'console-table-printer'

program
  .command('data-explorer')
  .description('Explore data store')
  .option('-i, --identities', 'List known identities')
  .option('-m, --messages', 'List messages')
  .action(async (cmd) => {
    if (cmd.identities) {
      const ids = await (await agent).identityManagerGetIdentities()
      if (ids.length === 0) {
        console.error('No dids')
        process.exit()
      }

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'did',
          choices: ids.map((item) => ({
            name: `${item.did} ${item.alias}`,
            value: item.did,
          })),
          message: 'Identity',
        },
        {
          type: 'list',
          name: 'type',
          choices: ['Sent Messages', 'Received Messages', 'Credentials'],
          message: 'List',
        },
      ])

      switch (answers.type) {
        case 'Sent Messages':
          showMessageList(
            await (await agent).dataStoreORMGetMessages({
              where: [{ column: 'from', value: [answers.did] }],
            }),
          )
          break
        case 'Received Messages':
          showMessageList(
            await (await agent).dataStoreORMGetMessages({
              where: [{ column: 'to', value: [answers.did] }],
            }),
          )
          break
        case 'Credentials':
          showCredentials(answers.did)
          break
      }
    }

    if (cmd.messages) {
      showMessageList(await (await agent).dataStoreORMGetMessages())
    }
  })

const showMessageList = async (messages: IMessage[]) => {
  if (messages.length === 0) {
    console.error('No messages')
    process.exit()
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'message',
      choices: messages.map((item: IMessage) => ({
        name: `${item.createdAt} ${item.type} from: ${item.from} to: ${item.to}`,
        value: item,
      })),
      message: 'Message',
    },
  ])
  showMessage(answers.message)
}

const showMessage = async (message: IMessage) => {
  console.dir(message, { depth: 10 })

  const table = []

  if (message.credentials && message.credentials.length > 0) {
    for (const credential of message.credentials) {
      table.push({
        from: credential.issuer.id,
        credentialSubject: JSON.stringify(credential.credentialSubject),
      })
    }
    console.log('\nVerifiable Credentials:')
    printTable(table)
  }
}

const showCredentials = async (did: string) => {
  const table = []

  const credentials = await (await agent).dataStoreORMGetVerifiableCredentials({
    where: [{ column: 'subject', value: [did] }],
  })

  if (credentials.length > 0) {
    for (const credential of credentials) {
      table.push({
        from: credential.issuer.id,
        credentialSubject: JSON.stringify(credential.credentialSubject),
      })
    }
    console.log('\nVerifiable Credentials:')
    printTable(table)
  }
}
