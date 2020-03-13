import * as Daf from 'daf-core'
import * as DIDComm from 'daf-did-comm'
import * as SD from 'daf-selective-disclosure'
import { core, dataStore } from './setup'
import program from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'

program
  .command('sdr')
  .description('Create Selective Disclosure Request')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async cmd => {
    const identities = await core.identityManager.getIdentities()
    if (identities.length === 0) {
      console.error('No dids')
      process.exit()
    }
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'iss',
        choices: identities.map(item => item.did),
        message: 'Issuer DID',
      },
      {
        type: 'input',
        name: 'sub',
        message: 'Subject DID (can be empty)',
      },
      {
        type: 'input',
        name: 'tag',
        message: 'Tag',
      },
    ])

    let addMoreRequests = true
    const claims = []

    while (addMoreRequests) {
      const answers2 = await inquirer.prompt([
        {
          type: 'input',
          name: 'claimType',
          message: 'Claim type',
          default: 'name',
        },
        {
          type: 'input',
          name: 'reason',
          message: 'Reason',
          default: 'We need this to comply with local law',
        },
        {
          type: 'list',
          name: 'essential',
          message: 'Is essential',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
        },
        {
          type: 'list',
          name: 'addMore',
          message: 'Add another credential?',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
        },
      ])
      claims.push({
        essential: answers2.essential,
        claimType: answers2.claimType,
        reason: answers2.reason,
      } as SD.CredentialRequestInput)
      addMoreRequests = answers2.addMore
    }

    const signAction: SD.ActionSignSdr = {
      type: SD.ActionTypes.signSdr,
      did: answers.iss,
      data: {
        tag: answers.tag === '' ? undefined : answers.tag,
        sub: answers.sub === '' ? undefined : answers.sub,
        claims,
      },
    }

    const jwt = await core.handleAction(signAction)

    await dataStore.initialize()
    if (!cmd.send) {
      await core.validateMessage(new Daf.Message({ raw: jwt, meta: { type: 'cli' } }))
    } else if (answers.sub !== '') {
      const sendAction: DIDComm.ActionSendJWT = {
        type: DIDComm.ActionTypes.sendJwt,
        data: {
          from: answers.iss,
          to: answers.sub,
          jwt,
        },
      }
      try {
        const result = await core.handleAction(sendAction)
        console.log('Sent:', result)
      } catch (e) {
        console.error(e)
      }
    } else {
      console.log('Subject not specified')
    }

    if (cmd.qrcode) {
      qrcode.generate(jwt)
    } else {
      console.log(`jwt: ${jwt}`)
    }
  })
