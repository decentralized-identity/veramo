import { getAgent } from './setup'
import { program } from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'
import { readStdin } from './util'
import * as fs from 'fs'
import * as json5 from 'json5'
import { extractIssuer } from '@veramo/utils'

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
            extractIssuer(credential.verifiableCredential),
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

presentation
  .command('verify')
  .description('Verify a W3C Verifiable Presentation provided as a string param or a file or from stdin')
  .option('-c, --challenge <string>', 'Optional. Specify a challenge that the presentation should match.')
  .option('-d, --domain <string>', 'Optional. Specify a domain that the presentation should match.')
  .option('-f, --filename <string>', 'Optional. Read the presentation from a file instead of stdin')
  .option('-r, --raw <string>', 'Optional. Presentation as a parameter string instead of a file or stdin.')
  .action(async (options) => {
    const agent = getAgent(program.opts().config)
    let raw: string = ''
    if (options.raw) {
      raw = options.raw
    } else if (options.filename) {
      raw = await fs.promises.readFile(options.filename, 'utf-8')
    } else {
      raw = await readStdin()
    }
    let presentationAsJSON: any
    try {
      presentationAsJSON = json5.parse(raw)
    } catch (e: any) {
      presentationAsJSON = {
        proof: {
          type: 'JwtProof2020',
          jwt: raw,
        },
      } as any
    }
    const result = await agent.verifyPresentation({
      presentation: presentationAsJSON,
      challenge: options.challenge,
      domain: options.domain,
    })
    if (result === true) {
      console.log('Presentation was verified successfully.')
    } else {
      console.error('Presentation could not be verified.')
    }
  })
