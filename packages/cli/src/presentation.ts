import { getAgent } from './setup.js'
import { Command } from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'
import { readStdin } from './util.js'
import * as fs from 'fs'
import * as json5 from 'json5'
import { extractIssuer } from '@veramo/utils'
import { PartialIdentifier, UniqueVerifiablePresentation } from '@veramo/core-types'

const presentation = new Command('presentation').description('W3C Verifiable Presentation')

presentation
  .command('create', { isDefault: true })
  .description('Create W3C Verifiable Presentation')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async (opts: { send: boolean; qrcode: boolean }, cmd: Command) => {
    const agent = await getAgent(cmd.optsWithGlobals().config)
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
      ...ids.map((id: PartialIdentifier) => id.did),
    ]

    let aud: string[] = []
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
        type: 'input',
        name: 'audnum',
        message: 'Number of Verifiers',
        default: 1,
      },
      {
        type: 'input',
        name: 'type',
        message: 'Presentation type',
        default: 'VerifiablePresentation,Profile',
      },
    ])

    for (let i = 0; i < answers.audnum; i++) {
      let answer = null
      const audAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'aud',
          message: 'Select Verifier or enter manually',
          choices: identifiers,
        },
      ])
      answer = audAnswer.aud
      if (answer === 'manual') {
        const manualAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'aud',
            message: 'Enter Verifier DID',
          },
        ])
        answer = manualAnswer.aud
      }
      aud = [...aud, answer]
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
          verifier: aud,
          tag: answers.tag,
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: answers.type.split(','),
          issuanceDate: new Date().toISOString(),
          verifiableCredential,
        },
        proofFormat: 'jwt',
      })

      if (opts.send) {
        for (var verifier in aud) {
          try {
            const message = await agent.sendMessageDIDCommAlpha1({
              save: true,
              data: {
                from: answers.iss,
                to: verifier,
                type: 'jwt',
                body: verifiablePresentation.proof.jwt,
              },
            })
            console.dir(message, { depth: 10 })
          } catch (e) {
            console.error(e)
          }
        }
      }

      if (opts.qrcode) {
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
  .action(
    async (options: { challenge: string; domain: string; filename: string; raw: string }, cmd: Command) => {
      const agent = await getAgent(cmd.optsWithGlobals().config)
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
      if (result.verified === true) {
        console.log('Presentation was verified successfully.')
      } else {
        console.error('Presentation could not be verified.')
      }
    },
  )

presentation
  .command('output')
  .description('Print W3C Verifiable Presentation to stdout')
  .option('-t, --tag <string>', 'Optional. Specify the tag for the presentation.')
  .action(async (options: { tag: string }, cmd: Command) => {
    const agent = await getAgent(cmd.optsWithGlobals().config)

    const presentations: UniqueVerifiablePresentation[] = await agent.dataStoreORMGetVerifiablePresentations(
      {},
    )

    if (presentations.length > 0) {
      let selected = null
      const list: any = []
      if (options.tag) {
        const matches = presentations.filter((pres) => pres.verifiablePresentation.tag === options.tag)
        if (matches.length > 1) {
          console.log('Found multiple matching presentations. Only showing the first one.')
        }
        selected = matches[0]
      } else {
        for (const pres of presentations) {
          list.push({
            name:
              'Issuance Date: ' +
              pres.verifiablePresentation.issuanceDate +
              ' | Holder: ' +
              pres.verifiablePresentation.holder +
              ' | Tag: ' +
              pres.verifiablePresentation.tag,
            value: pres,
          })
        }
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'presentation',
            choices: list,
            message: 'Select presentation',
          },
        ])
        selected = answers.presentation
      }

      if (selected) {
        console.dir(selected, { depth: 10 })
      } else {
        console.log('Presentation not found.')
      }
    } else {
      console.log('No presentations found.')
    }
  })

export { presentation }
