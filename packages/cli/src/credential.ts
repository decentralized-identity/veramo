import { getAgent } from './setup.js'
import { Command } from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'
import * as fs from 'fs'
import json5 from 'json5'
import { readStdin } from './util.js'
import { CredentialPayload } from '@veramo/core-types'
import Debug from 'debug'

import fuzzy from 'fuzzy'

const debug = Debug('veramo:cli:credential')
const credential = new Command('credential').description('W3C Verifiable Credential')

credential
  .command('create')
  .description('Create W3C Verifiable Credential (for demo purposes)')
  .option('-j, --json', 'Output in JSON')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async (opts: { send: boolean; qrcode: boolean; json: boolean }, cmd: Command) => {
    const agent = await getAgent(cmd.optsWithGlobals().config)
    const identifiers = await agent.didManagerFind()

    const knownDids = await agent.dataStoreORMGetIdentifiers()
    const subjects = [...knownDids.map((id) => id.did)]

    if (identifiers.length === 0) {
      console.error('No dids')
      process.exit()
    }
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'proofFormat',
        choices: ['jwt', 'lds', 'EthereumEip712Signature2021'],
        message: 'Credential proofFormat',
      },
      {
        type: 'list',
        name: 'iss',
        choices: identifiers.map((item) => ({
          name: `${item.did} ${item.alias}`,
          value: item.did,
        })),
        message: 'Issuer DID',
      },
      {
        type: 'autocomplete',
        name: 'sub',
        pageSize: 15,
        source: async (answers: any, input: string) => {
          const res = fuzzy
            .filter(input, subjects)
            .map((el: any) => (typeof el === 'string' ? el : el.original))
          return res
        },
        message: 'Subject DID',
      },
      {
        type: 'input',
        name: 'type',
        message: 'Credential Type',
        default: 'VerifiableCredential,Profile',
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
    credentialSubject.id = answers.sub
    const type: string = answers.claimType
    credentialSubject[type] = answers.claimValue

    const credential: CredentialPayload = {
      issuer: { id: answers.iss },
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
      type: answers.type.split(','),
      issuanceDate: new Date().toISOString(),
      credentialSubject,
    }

    const verifiableCredential = await agent.createVerifiableCredential({
      credential,
      proofFormat: answers.proofFormat,
    })

    try {
      const saved = await agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
    } catch (e: any) {
      debug('could not save credential', e)
    }

    if (opts.qrcode) {
      qrcode.generate(verifiableCredential.proof.jwt)
    } else {
      if (opts.json) {
        console.log(JSON.stringify(verifiableCredential))
      } else {
        console.dir(verifiableCredential, { depth: 10 })
      }
    }
  })

credential
  .command('verify')
  .description('Verify a W3C Verifiable Credential provided as raw string, file or stdin')
  .option('-f, --filename <string>', 'Optional. Read the credential from a file instead of stdin')
  .option('-r, --raw <string>', 'Optional. Specify the credential as a parameter instead of file or stdin')
  .action(async (options: { raw: string; filename: string }, cmd: Command) => {
    const agent = await getAgent(cmd.optsWithGlobals().config)
    let raw: string = ''
    if (options.raw) {
      raw = options.raw
    } else if (options.filename) {
      raw = await fs.promises.readFile(options.filename, 'utf-8')
    } else {
      console.log('Please provide the credential as a JWT or JSON string. Press Ctrl+D to finish.');
      raw = await readStdin()
    }
    let parsedCredential: any
    try {
      parsedCredential = json5.parse(raw)
    } catch (e: any) {
      debug('Could not parse credential as JSON5', e.message)
      parsedCredential = raw
    }
    try {
      const result = await agent.verifyCredential({ credential: parsedCredential })
      if (result.verified === true) {
        console.log('Credential was verified successfully.')
      } else {
        console.error('Credential could not be verified.')
      }
    } catch (e) {
      console.error(e.message)
    }
  })

credential
  .command('output')
  .description('Print W3C Verifiable Credential to stdout')
  .action(async (opts: {}, cmd: Command) => {
    const agent = await getAgent(cmd.optsWithGlobals().config)

    const credentials = await agent.dataStoreORMGetVerifiableCredentials()

    if (credentials.length > 0) {
      const list: any = []
      for (const cred of credentials) {
        list.push({
          name:
            JSON.stringify(cred.verifiableCredential.credentialSubject) +
            ' | Issuer: ' +
            JSON.stringify(cred.verifiableCredential.issuer),
          value: cred,
        })
      }

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'credential',
          choices: list,
          message: 'Select credential',
        },
      ])

      console.dir(answers.credential, { depth: 10 })
    } else {
      console.log('No credentials found.')
    }
  })

export { credential }
