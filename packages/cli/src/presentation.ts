import { W3CCredential } from '@veramo/core'
import { getAgent } from './setup'
import { program } from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'

const presentation = program.command('presentation').description('W3C Verifiable Presentation')

presentation
  .command('create', { isDefault: true })
  .description('Create W3C Verifiable Presentation')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async (cmd) => {
    const agent = getAgent(program.opts().config)
    const myIdentifiers = await agent.didManagerFind()
    if (myIdentifiers.length === 0) {
      console.error('No dids')
      process.exit()
    }

    const ids = await agent.dataStoreORMGetIdentifiers()

    const identifiers = [
      {
        name: 'Enter manually',
        value: 'manual',
      },
      ...ids.map((id) => id.did),
    ]

    let aud = null
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'iss',
        choices: myIdentifiers.map((item) => ({
          name: `${item.did} ${item.alias}`,
          value: item.did,
        })),

        message: 'Holder DID',
      },
      {
        type: 'input',
        name: 'tag',
        message: 'Tag (threadId)',
        default: 'xyz123',
      },
      {
        type: 'list',
        name: 'aud',
        message: 'Verifier DID',
        choices: identifiers,
      },
      {
        type: 'input',
        name: 'type',
        message: 'Presentation type',
        default: 'VerifiablePresentation,Profile',
      },
    ])

    if (answers.aud === 'manual') {
      const audAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'aud',
          message: 'Enter Verifier DID',
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
          value: credential.verifiableCredential,
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
          type: answers.type.split(','),
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
