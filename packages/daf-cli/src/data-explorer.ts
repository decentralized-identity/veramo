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
  .action(async (cmd) => {
    const dbConnection = await (await agent).dbConnection
    if (!dbConnection) {
      throw new Error('A database connection is required')
    }
    if (cmd.identities) {
      const ids = await dbConnection.getRepository(Daf.Identity).find()
      if (ids.length === 0) {
        console.error('No dids')
        process.exit()
      }

      const identities = []
      for (const id of ids) {
        const name = await id.getLatestClaimValue(dbConnection, { type: 'name' })
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
          await showMessageList(await Daf.Message.find({ where: { from: answers.did } }))
          break
        case 'Received Messages':
          await showMessageList(await Daf.Message.find({ where: { to: answers.did } }))
          break
        case 'Credentials':
          await showCredentials(answers.did)
          break
      }
    }

    if (cmd.messages) {
      await showMessageList(await dbConnection.getRepository(Daf.Message).find())
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
        name: `${formatDistanceToNow(item.createdAt || 0)} ${item.type} from: ${item.from?.did} to: ${
          item.to?.did
        }`,
        value: item.id,
      })),
      message: 'Message',
    },
  ])
  await showMessage(answers.id)
}

const showMessage = async (id: string) => {
  const dbConnection = await (await agent).dbConnection
  if (!dbConnection) {
    throw new Error('A database connection is required')
  }
  const message = await dbConnection
    .getRepository(Daf.Message)
    .findOne(id, { relations: ['credentials', 'credentials.claims'] })

  if (!message) {
    throw new Error(`Message with id ${id} could not be found`)
  }

  const table = []

  if (message.credentials.length > 0) {
    for (const credential of message.credentials) {
      const issuer = credential.issuer.shortDid()
      if (!credential.subject) {
        throw new Error('Credential does not have a subject')
      }
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
  if (!dbConnection) {
    throw new Error('A database connection is required')
  }
  const credentials = await dbConnection.getRepository(Daf.Credential).find({ where: { subject: did } })

  if (credentials.length > 0) {
    for (const credential of credentials) {
      const issuer = credential.issuer.shortDid()
      if (!credential.subject) {
        throw new Error('Credential does not have a subject')
      }
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
