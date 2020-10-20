import { ICredentialRequestInput } from 'daf-selective-disclosure'
import { getAgent } from './setup'
import program from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'
import { shortDate, shortDid } from './data-explorer/utils'
import { VerifiableCredential } from 'daf-core'
const fuzzy = require('fuzzy')

program
  .command('sdr-create')
  .description('Create Selective Disclosure Request')
  .action(async (cmd) => {
    const agent = getAgent(program.config)
    const identities = await agent.identityManagerGetIdentities()

    const knownDids = await agent.dataStoreORMGetIdentities()

    const subjects = [...knownDids.map((id) => id.did)]

    if (identities.length === 0) {
      console.error('No dids')
      process.exit()
    }
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'iss',
        choices: identities.map((item) => item.did),
        message: 'Issuer DID',
      },
      {
        name: 'sub',
        message: 'Subject DID',
        type: 'autocomplete',
        pageSize: 15,
        suggestOnly: true,
        source: async (answers: any, search: string) => {
          const res = fuzzy
            .filter(search, subjects)
            .map((el: any) => (typeof el === 'string' ? el : el.original))
          return res
        },
      },
      {
        type: 'input',
        name: 'tag',
        message: 'Tag (threadId)',
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
          name: 'addIssuer',
          message: 'Add accepted issuer?',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
        },
      ])

      let addIssuer = answers2.addIssuer
      const issuers = []
      while (addIssuer) {
        const issuerAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'did',
            message: 'Issuer DID',
            default: 'did:web:uport.me',
          },
          {
            type: 'input',
            name: 'url',
            message: 'URL',
            default: 'https://uport.me',
          },
          {
            type: 'list',
            name: 'addIssuer',
            message: 'Add another accepted issuer?',
            choices: [
              { name: 'Yes', value: true },
              { name: 'No', value: false },
            ],
          },
        ])
        issuers.push({
          did: issuerAnswers.did,
          url: issuerAnswers.url,
        })
        addIssuer = issuerAnswers.addIssuer
      }

      const answers4 = await inquirer.prompt([
        {
          type: 'list',
          name: 'addMore',
          message: 'Add another claim?',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
        },
      ])

      claims.push({
        issuers: issuers,
        essential: answers2.essential,
        claimType: answers2.claimType,
        reason: answers2.reason,
      } as ICredentialRequestInput)
      addMoreRequests = answers4.addMore
    }

    const answers5 = await inquirer.prompt([
      {
        type: 'list',
        name: 'addCredentials',
        message: 'Add profile credentials?',
        choices: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
    ])

    const credentials = []
    if (answers5.addCredentials) {
      const vcs = await agent.dataStoreORMGetVerifiableCredentials({
        where: [{ column: 'subject', value: [answers.iss] }],
      })

      const list: any = []
      if (vcs.length > 0) {
        for (const credential of vcs) {
          list.push({
            name:
              JSON.stringify(credential.verifiableCredential.credentialSubject) +
              ' | Issuer: ' +
              credential.verifiableCredential.issuer.id,
            value: credential.verifiableCredential.proof.jwt,
          })
        }

        let addMoreCredentials = true

        while (addMoreCredentials) {
          const answers6 = await inquirer.prompt([
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
          credentials.push(answers6.credential)
          addMoreCredentials = answers6.addMore
        }
      }
    }

    const data: any = {
      issuer: answers.iss,
      claims,
      credentials,
    }
    if (answers.tag !== '') {
      data.tag = answers.tag
    }
    if (answers.sub !== '') {
      data.subject = answers.sub
    }
    const jwt = await agent.createSelectiveDisclosureRequest({
      data,
    })

    const { send } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'send',
        message: 'Send',
      },
    ])

    if (!send) {
      await agent.handleMessage({ raw: jwt, metaData: [{ type: 'cli' }], save: true })
    } else if (answers.sub !== '') {
      try {
        const result = await agent.sendMessageDIDCommAlpha1({
          data: {
            from: answers.iss,
            to: answers.sub,
            type: 'jwt',
            body: jwt,
          },
        })
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
      console.dir(data, { depth: 10 })
      console.log(`jwt: ${jwt}`)
    }
  })

program
  .command('sdr-reply')
  .description('Reply to Selective Disclosure Request')
  .action(async (cmd) => {
    const agent = getAgent(program.config)
    const sdrMessages = await agent.dataStoreORMGetMessages({
      where: [{ column: 'type', value: ['sdr'] }],
      order: [{ column: 'createdAt', direction: 'DESC' }],
    })

    const list = sdrMessages.map((message) => ({
      //FIXME
      name:
        shortDate(message.createdAt) +
        ' ' +
        shortDid(message.from) +
        ' asking to share: ' +
        //@ts-ignore
        message.data?.claims?.map((claim) => claim.claimType).join(','),
      value: message,
    }))

    const { message } = await inquirer.prompt([
      {
        type: 'list',
        name: 'message',
        choices: list,
        message: 'Selective disclosure request',
      },
    ])
    const args: any = {
      sdr: message.data,
    }
    if (message.to) {
      args.did = message.to
    }
    const credentialsForSdr = await agent.getVerifiableCredentialsForSdr(args)

    const questions = []

    for (const item of credentialsForSdr) {
      questions.push({
        type: 'checkbox',
        name: item.claimType + ' ' + (item.essential ? '(essential)' : '') + item.reason,
        choices: item.credentials.map((c) => ({
          name:
            c.credentialSubject[item.claimType] +
            ' (' +
            c.type.join(',') +
            ') issued by: ' +
            c.issuer.id +
            ' ' +
            shortDate(c.issuanceDate) +
            ' ago',
          value: c,
        })),
      })
    }

    const answers = await inquirer.prompt(questions)

    let selectedCredentials: Array<VerifiableCredential> = []

    for (const questionName of Object.keys(answers)) {
      selectedCredentials = selectedCredentials.concat(answers[questionName])
    }

    const verifiablePresentation = await agent.createVerifiablePresentation({
      save: false,
      presentation: {
        holder: message.to,
        verifier: [message.from],
        tag: message.tag,
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        issuanceDate: new Date().toISOString(),
        verifiableCredential: selectedCredentials,
      },
      proofFormat: 'jwt',
    })

    await agent.sendMessageDIDCommAlpha1({
      save: true,
      data: {
        from: message.to,
        to: message.from,
        type: 'jwt',
        body: verifiablePresentation.proof.jwt,
      },
    })

    console.dir(verifiablePresentation, { depth: 10 })
  })
