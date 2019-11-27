import { core, dataStore } from './setup'
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
      const dids = await dataStore.allIdentities()
      if (dids.length === 0) {
        console.error('No dids')
        process.exit()
      }

      const identities = []
      for (const did of dids) {
        const shortId = await dataStore.shortId(did.did)
        identities.push({
          value: did.did,
          name: `${did.did} - ${shortId}`,
        })
      }

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'sub',
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
          showMessageList(await dataStore.findMessages({ iss: answers.sub }))
          break
        case 'Received Messages':
          showMessageList(await dataStore.findMessages({ sub: answers.sub }))
          break
        case 'Credentials':
          showCredentials(answers.sub)
          break
      }
    }
  })

const showMessageList = async (messages: any) => {
  if (messages.length === 0) {
    console.error('No messages')
    process.exit()
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'hash',
      choices: messages.map((item: any) => ({
        name: `${formatDistanceToNow(item.nbf * 1000)} ${item.type}`,
        value: item.hash,
      })),
      message: 'Message',
    },
  ])
  showMessage(answers.hash)
}

const showMessage = async (hash: string) => {
  const message = await dataStore.findMessage(hash)
  console.log(message)

  const table = []
  const credentials = await dataStore.credentialsForMessageHash(hash)
  if (credentials.length > 0) {
    for (const credential of credentials) {
      const fields = await dataStore.credentialsFieldsForClaimHash(credential.hash)
      const issuer = await dataStore.shortId(credential.iss.did)
      const subject = await dataStore.shortId(credential.sub.did)
      for (const field of fields) {
        table.push({
          from: issuer,
          to: subject,
          type: field.type,
          value: field.value,
        })
      }
    }
    console.log('\nVerifiable Credentials:')
    printTable(table)
  }
}

const showCredentials = async (did: string) => {
  const table = []
  const credentials = await dataStore.findCredentials({ sub: did })
  if (credentials.length > 0) {
    for (const credential of credentials) {
      const fields = await dataStore.credentialsFieldsForClaimHash(credential.hash)
      const issuer = await dataStore.shortId(credential.iss.did)
      const subject = await dataStore.shortId(credential.sub.did)
      for (const field of fields) {
        table.push({
          from: issuer,
          to: subject,
          type: field.type,
          value: field.value,
        })
      }
    }
    console.log('\nVerifiable Credentials:')
    printTable(table)
  }
}
