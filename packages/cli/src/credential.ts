import { getAgent } from './setup'
import { program } from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'
import * as fs from 'fs'
import * as json5 from 'json5'
import { readStdin } from './util'
import { CredentialPayload } from '@veramo/core'

const fuzzy = require('fuzzy')

const credential = program.command('credential').description('W3C Verifiable Credential')

credential
  .command('create', { isDefault: true })
  .description('Create W3C Verifiable Credential')
  .option('-s, --send', 'Send')
  .option('-j, --json', 'Output in JSON')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async (cmd) => {
    const agent = getAgent(program.opts().config)
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

    const credential: CredentialPayload = {
      issuer: { id: answers.iss },
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
      type: answers.type.split(','),
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
          // TODO(nickreynolds): deploy
          default: 'goerli:0x97fd27892cdcD035dAe1fe71235c636044B59348',
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
      proofFormat: answers.proofFormat,
    })

    if (cmd.send) {
      let body
      let type
      if (answers.proofFormat == 'jwt') {
        body = verifiableCredential.proof.jwt
        type = 'jwt'
      } else {
        body = verifiableCredential
        type = 'w3c.vc'
      }
      try {
        const message = await agent.sendMessageDIDCommAlpha1({
          save: true,
          data: {
            from: answers.iss,
            to: answers.sub,
            type,
            body,
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
      if (cmd.json) {
        console.log(JSON.stringify(verifiableCredential, null, 2))
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
    let credentialAsJSON: any
    try {
      credentialAsJSON = json5.parse(raw)
    } catch (e: any) {
      credentialAsJSON = {
        proof: {
          type: 'JwtProof2020',
          jwt: raw,
        },
      } as any
    }
    try {
      const result = await agent.verifyCredential({ credential: credentialAsJSON })
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
  .action(async (cmd) => {
    const agent = getAgent(program.opts().config)

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
