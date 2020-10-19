import { ICredentialRequestInput } from 'daf-selective-disclosure'
import { getAgent } from './setup'
import program from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'

program
  .command('sdr')
  .description('Create Selective Disclosure Request')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async (cmd) => {
    const agent = getAgent(program.config)
    const identities = await agent.identityManagerGetIdentities()

    const knownDids = await agent.dataStoreORMGetIdentities()

    const subjects = [
      {
        name: 'None',
        value: '',
      },
      ...knownDids.map((id) => id.did),
    ]

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
        type: 'list',
        name: 'sub',
        message: 'Subject DID',
        choices: subjects,
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

    if (!cmd.send) {
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
