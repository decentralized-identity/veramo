import * as Daf from 'daf-core'
import * as W3c from 'daf-w3c'
import * as DIDComm from 'daf-did-comm'
import { agent } from './setup'
import program from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'

program
  .command('credential')
  .description('Create W3C Verifiable Credential')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async cmd => {
    const identities = await (await agent).identityManager.getIdentities()
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
        default: identities[0].did,
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
      {
        type: 'list',
        name: 'addStatus',
        message: 'Is the credential revocable?',
        choices: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
    ])

    const credentialSubject: any = {}
    credentialSubject.id = answers.sub
    const type: string = answers.claimType
    credentialSubject[type] = answers.claimValue

    const data = {
      issuer: answers.iss,
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject,
    }

    if (answers.addStatus) {
      const statusAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'type',
          message: 'Credential status type',
          default: 'EthrStatusRegistry2019',
        },
        {
          type: 'input',
          name: 'id',
          message: 'Credential status ID',
          default: 'rinkeby:0x97fd27892cdcD035dAe1fe71235c636044B59348',
        },
      ])

      data['credentialStatus'] = {
        type: statusAnswers.type,
        id: statusAnswers.id,
      }
    }

    const signAction: W3c.ActionSignW3cVc = {
      type: W3c.ActionTypes.signCredentialJwt,
      save: true,
      data,
    }

    const credential: Daf.Credential = await (await agent).handleAction(signAction)

    if (cmd.send) {
      const sendAction: DIDComm.ActionSendDIDComm = {
        type: DIDComm.ActionTypes.sendMessageDIDCommAlpha1,
        data: {
          from: answers.iss,
          to: answers.sub,
          type: 'jwt',
          body: credential.raw,
        },
      }
      try {
        const message: Daf.Message = await (await agent).handleAction(sendAction)
        console.log('Sent:', message)
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.qrcode) {
      qrcode.generate(credential.raw)
    } else {
      console.log(`jwt: ${credential.raw}`)
    }
  })

program
  .command('presentation')
  .description('Create W3C Verifiable Presentation')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async cmd => {
    const myIdentities = await (await agent).identityManager.getIdentities()
    if (myIdentities.length === 0) {
      console.error('No dids')
      process.exit()
    }

    const ids = await Daf.Identity.find()

    const identities = [
      {
        name: 'Enter manualy',
        value: 'manual',
      },
    ]
    for (const id of ids) {
      const name = await id.getLatestClaimValue((await agent).dbConnection, { type: 'name' })
      identities.push({
        value: id.did,
        name: `${id.did} - ${name}`,
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

    const credentials = await Daf.Credential.find({
      where: { subject: answers.iss },
      relations: ['claims'],
    })
    const list: any = []
    if (credentials.length > 0) {
      for (const credential of credentials) {
        const issuer = credential.issuer.shortDid()
        const claims = []
        for (const claim of credential.claims) {
          claims.push(claim.type + ' = ' + claim.value)
        }
        list.push({
          name: claims.join(', ') + ' | Issuer: ' + issuer,
          value: credential.raw,
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
        type: W3c.ActionTypes.signPresentationJwt,
        save: true,
        data: {
          issuer: answers.iss,
          audience: [aud],
          tag: answers.tag,
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          verifiableCredential,
        },
      }

      const presentation: Daf.Presentation = await (await agent).handleAction(signAction)

      if (cmd.send) {
        const sendAction: DIDComm.ActionSendDIDComm = {
          type: DIDComm.ActionTypes.sendMessageDIDCommAlpha1,
          data: {
            from: answers.iss,
            to: aud,
            type: 'jwt',
            body: presentation.raw,
          },
        }
        try {
          const message: Daf.Message = await (await agent).handleAction(sendAction)
          console.log('Sent:', message)
        } catch (e) {
          console.error(e)
        }
      }

      if (cmd.qrcode) {
        qrcode.generate(presentation.raw)
      } else {
        console.log(`jwt: ${presentation.raw}`)
      }
    }
  })
