import { W3CCredential } from 'daf-core'
import { getAgent } from './setup'
import program from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'

program
  .command('credential')
  .description('Create W3C Verifiable Credential')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async (cmd) => {
    const agent = getAgent(program.config)
    const identities = await agent.identityManagerGetIdentities()
    if (identities.length === 0) {
      console.error('No dids')
      process.exit()
    }
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'iss',
        choices: identities.map((item) => ({
          name: `${item.did} ${item.alias}`,
          value: item.did,
        })),
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

    const credential: W3CCredential = {
      issuer: { id: answers.iss },
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      issuanceDate: new Date().toISOString(),
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

      credential['credentialStatus'] = {
        type: statusAnswers.type,
        id: statusAnswers.id,
      }
    }

    const verifiableCredential = await agent.createVerifiableCredential({
      save: true,
      credential,
      proofFormat: 'jwt',
    })

    if (cmd.send) {
      try {
        const message = await agent.sendMessageDIDCommAlpha1({
          save: true,
          data: {
            from: answers.iss,
            to: answers.sub,
            type: 'jwt',
            body: verifiableCredential.proof.jwt,
          },
        })
        console.dir(message, { depth: 10 })
      } catch (e) {
        console.error(e)
      }
    }

    if (cmd.qrcode) {
      qrcode.generate(verifiableCredential.proof.jwt)
    } else {
      console.dir(verifiableCredential, { depth: 10 })
    }
  })

program
  .command('presentation')
  .description('Create W3C Verifiable Presentation')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async (cmd) => {
    const agent = getAgent(program.config)
    const myIdentities = await agent.identityManagerGetIdentities()
    if (myIdentities.length === 0) {
      console.error('No dids')
      process.exit()
    }

    const ids = await agent.dataStoreORMGetIdentities()

    const identities = [
      {
        name: 'Enter manualy',
        value: 'manual',
      },
    ]

    let aud = null
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'iss',
        choices: myIdentities.map((item) => ({
          name: `${item.did} ${item.alias}`,
          value: item.did,
        })),

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
        choices: ids.map((id) => id.did),
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

    const credentials = await agent.dataStoreORMGetVerifiableCredentials({
      where: [{ column: 'subject', value: [answers.iss] }],
    })

    const list: any = []
    if (credentials.length > 0) {
      for (const credential of credentials) {
        list.push({
          name:
            JSON.stringify(credential.verifiableCredential.credentialSubject) +
            ' | Issuer: ' +
            credential.verifiableCredential.issuer.id,
          value: credential,
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

      const verifiablePresentation = await agent.createVerifiablePresentation({
        save: true,
        presentation: {
          holder: answers.iss,
          verifier: [aud],
          tag: answers.tag,
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          issuanceDate: new Date().toISOString(),
          verifiableCredential,
        },
        proofFormat: 'jwt',
      })

      if (cmd.send) {
        try {
          const message = await agent.sendMessageDIDCommAlpha1({
            save: true,
            data: {
              from: answers.iss,
              to: aud,
              type: 'jwt',
              body: verifiablePresentation.proof.jwt,
            },
          })
          console.dir(message, { depth: 10 })
        } catch (e) {
          console.error(e)
        }
      }

      if (cmd.qrcode) {
        qrcode.generate(verifiablePresentation.proof.jwt)
      } else {
        console.dir(verifiablePresentation, { depth: 10 })
      }
    }
  })
