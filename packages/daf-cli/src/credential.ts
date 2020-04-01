import * as Daf from 'daf-core'
import * as W3c from 'daf-w3c'
import * as DIDComm from 'daf-did-comm'
import { agent, dataStore } from './setup'
import program from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'

program
  .command('credential')
  .description('Create W3C Verifiable Credential')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async cmd => {
    const identities = await agent.identityManager.getIdentities()
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
        message: 'Subject DID',
      },
      {
        type: 'input',
        name: 'claimType',
        message: 'Claim Type',
        default: 'name',
      },
      {
        type: 'input',
        name: 'claimValue',
        message: 'Claim Value',
        default: 'Alice',
      },
    ])

    const credentialSubject: any = {}
    const type: string = answers.claimType
    credentialSubject[type] = answers.claimValue

    const signAction: W3c.ActionSignW3cVc = {
      type: W3c.ActionTypes.signVc,
      did: answers.iss,
      data: {
        sub: answers.sub,
        vc: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          credentialSubject,
        },
      },
    }

    const jwt = await agent.handleAction(signAction)

    if (!cmd.send) {
      await agent.handleMessage({ raw: jwt, metaData: [{ type: 'cli' }] })
    } else {
      const sendAction: DIDComm.ActionSendDIDComm = {
        type: DIDComm.ActionTypes.sendMessageDIDCommAlpha1,
        data: {
          from: answers.iss,
          to: answers.sub,
          type: 'jwt',
          body: jwt,
        },
      }
      try {
        const result = await agent.handleAction(sendAction)
        console.log('Sent:', result)
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.qrcode) {
      qrcode.generate(jwt)
    } else {
      console.log(`jwt: ${jwt}`)
    }
  })

program
  .command('presentation')
  .description('Create W3C Verifiable Presentation')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async cmd => {
    const myIdentities = await agent.identityManager.getIdentities()
    if (myIdentities.length === 0) {
      console.error('No dids')
      process.exit()
    }

    const dids = await dataStore.allIdentities()

    const identities = [
      {
        name: 'Enter manualy',
        value: 'manual',
      },
    ]
    for (const did of dids) {
      const shortId = await dataStore.shortId(did.did)
      identities.push({
        value: did.did,
        name: `${did.did} - ${shortId}`,
      })
    }

    let aud = null
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'iss',
        choices: myIdentities.map(item => item.did),
        message: 'Issuer DID',
      },
      {
        type: 'input',
        name: 'tag',
        message: 'Tag',
      },
      {
        type: 'list',
        name: 'aud',
        message: 'Audience DID',
        choices: identities,
      },
    ])

    if (answers.aud === 'manual') {
      const audAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'aud',
          message: 'Enter audience DID',
        },
      ])
      aud = audAnswer.aud
    } else {
      aud = answers.aud
    }

    const credentials = await dataStore.findCredentials({ sub: answers.iss })
    const list: any = []
    if (credentials.length > 0) {
      for (const credential of credentials) {
        const fields = await dataStore.credentialsFieldsForClaimHash(credential.hash)
        const issuer = await dataStore.shortId(credential.iss.did)
        const claims = []
        for (const field of fields) {
          claims.push(field.type + ' = ' + field.value)
        }
        list.push({
          name: claims.join(', ') + ' | Issuer: ' + issuer,
          value: credential.jwt,
        })
      }

      let addMoreCredentials = true
      const verifiableCredential = []

      while (addMoreCredentials) {
        const answers2 = await inquirer.prompt([
          {
            type: 'list',
            name: 'credential',
            choices: list,
            message: 'Select credential',
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
        verifiableCredential.push(answers2.credential)
        addMoreCredentials = answers2.addMore
      }

      const signAction: W3c.ActionSignW3cVp = {
        type: W3c.ActionTypes.signVp,
        did: answers.iss,
        data: {
          aud: aud,
          tag: answers.tag,
          vp: {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiablePresentation'],
            verifiableCredential,
          },
        },
      }

      const jwt = await agent.handleAction(signAction)

      if (!cmd.send) {
        await agent.handleMessage({ raw: jwt, metaData: [{ type: 'cli' }] })
      } else {
        const sendAction: DIDComm.ActionSendDIDComm = {
          type: DIDComm.ActionTypes.sendMessageDIDCommAlpha1,
          data: {
            from: answers.iss,
            to: aud,
            type: 'jwt',
            body: jwt,
          },
        }
        try {
          const result = await agent.handleAction(sendAction)
          console.log('Sent:', result)
        } catch (e) {
          console.error(e)
        }
      }

      if (cmd.qrcode) {
        qrcode.generate(jwt)
      } else {
        console.log(`jwt: ${jwt}`)
      }
    }
  })
