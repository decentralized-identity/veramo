import * as Daf from 'daf-core'
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
  .action(async cmd => {
    if (cmd.identities) {
      const dbConnection = await (await agent).dbConnection
      const ids = await dbConnection.getRepository(Daf.Identity).find()
      if (ids.length === 0) {
        console.error('No dids')
        process.exit()
      }

      const identities = []
      for (const id of ids) {
        const name = await id.getLatestClaimValue((await agent).dbConnection, { type: 'name' })
        identities.push({
          value: id.did,
          name: `${id.did} - ${name || id.shortDid()}`,
        })
      }

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'did',
          choices: identities,
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
          showMessageList(await Daf.Message.find({ where: { from: answers.did } }))
          break
        case 'Received Messages':
          showMessageList(await Daf.Message.find({ where: { to: answers.did } }))
          break
        case 'Credentials':
          showCredentials(answers.did)
          break
      }
    }

    if (cmd.messages) {
      const dbConnection = await (await agent).dbConnection
      showMessageList(await dbConnection.getRepository(Daf.Message).find())
    }
  })

const showMessageList = async (messages: Daf.Message[]) => {
  if (messages.length === 0) {
    console.error('No messages')
    process.exit()
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'id',
      choices: messages.map((item: Daf.Message) => ({
        name: `${formatDistanceToNow(item.createdAt)} ${item.type} from: ${item.from?.did} to: ${
          item.to?.did
        }`,
        value: item.id,
      })),
      message: 'Message',
    },
  ])
  showMessage(answers.id)
}

const showMessage = async (id: string) => {
  const dbConnection = await (await agent).dbConnection
  const message = await dbConnection
    .getRepository(Daf.Message)
    .findOne(id, { relations: ['credentials', 'credentials.claims'] })
  console.log(message)

  const table = []

  if (message.credentials.length > 0) {
    for (const credential of message.credentials) {
      const issuer = credential.issuer.shortDid()
      const subject = credential.subject.shortDid()
      for (const claim of credential.claims) {
        table.push({
          from: issuer,
          to: subject,
          type: claim.type,
          value: claim.value,
        })
      }
    }
    console.log('\nVerifiable Credentials:')
    printTable(table)
  }
}

const showCredentials = async (did: string) => {
  const table = []
  const dbConnection = await (await agent).dbConnection

  const credentials = await dbConnection.getRepository(Daf.Credential).find({ where: { subject: did } })

  if (credentials.length > 0) {
    for (const credential of credentials) {
      const issuer = credential.issuer.shortDid()
      const subject = credential.subject.shortDid()
      for (const claim of credential.claims) {
        table.push({
          from: issuer,
          to: subject,
          type: claim.type,
          value: claim.value,
        })
      }
    }
    console.log('\nVerifiable Credentials:')
    printTable(table)
  }
}
