import * as W3c from 'daf-w3c'
import * as DIDComm from 'daf-did-comm'
import { core, dataStore } from './setup'
import program from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'

program
  .command('credential')
  .description('Manage W3C Verifiable Credentials')
  .option('-c, --create', 'Create new credential')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .option('-r, --receiver <did>', 'Credential subject')
  .action(async (cmd) => {
    if (cmd.create) {
      const myDids = await core.identityManager.listDids()
      if (myDids.length === 0) {
        console.error('No dids')
        process.exit()
      }
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'iss',
          choices: myDids,
          message: 'Issuer DID'
        },
        {
          type: 'input',
          name: 'sub',
          message: 'Subject DID',
          default: cmd.receiver
        },
        {
          type: 'input',
          name: 'claimType',
          message: 'Claim Type',
          default: 'name'
        },
        {
          type: 'input',
          name: 'claimValue',
          message: 'Claim Value',
          default: 'Alice'
        },
      ])

      const credentialSubject: any = {}
      const type: string = answers.claimType
      credentialSubject[ type ] = answers.claimValue

      const signAction: W3c.ActionSignW3cVc = {
        type: W3c.ActionTypes.signVc,
        did: answers.iss,
        data: {
          sub: answers.sub,
          vc: {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            credentialSubject
          },
        }
      }

      const jwt = await core.handleAction(signAction)

      if (!cmd.send) {
        await dataStore.initialize()
        await core.onRawMessage({raw: jwt})
      } else {

        const sendAction: DIDComm.ActionSendJWT = {
          type: DIDComm.ActionTypes.sendJwt,
          data: {
            from: answers.iss,
            to: answers.sub,
            jwt
          }
        }
        try {  
          const result = await core.handleAction(sendAction)
          console.log('Sent:', result)
        } catch (e) {
          console.error(e)
        }
      }

      if (cmd.qrcode) {
        qrcode.generate(jwt)
      }

    }

  })
  