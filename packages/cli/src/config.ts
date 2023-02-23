import { Command } from 'commander'
import { SecretBox } from '@veramo/kms-local'
import { getAgent } from './setup.js'
import fs from 'fs'
import { dirname } from 'path'

import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const config = new Command('config').description('Agent configuration')

config
  .command('create', { isDefault: true })
  .description('Create default agent config')
  .option('--filename <string>', 'Config file name', './agent.yml')
  .option('--template <string>', 'Use template (default,client)', 'default')

  .action(async (options) => {
    const { filename, template } = options

    const templateFile = __dirname + '/../default/' + template + '.yml'
    if (!fs.existsSync(templateFile)) {
      console.log('Template not available: ' + template)
      process.exit(1)
    }

    if (!fs.existsSync(dirname(filename))) {
      fs.mkdirSync(dirname(filename))
    }

    if (!fs.existsSync(filename)) {
      console.log('Creating: ' + filename)
      const contents = fs.readFileSync(templateFile)
      fs.writeFileSync(filename, contents)
    } else {
      console.log('File already exists: ' + filename)
    }
  })

config
  .command('create-secret-key')
  .alias('gen-key')
  .alias('key-gen')
  .alias('keygen')
  .alias('genkey')
  .description('generate secret key')
  .option('-q, --quiet', 'Only print the raw key, no instructions', false)
  .action(async (options) => {
    try {
      const dbEncryptionKey = await SecretBox.createSecretKey()
      if (options.quiet === true) {
        console.log(dbEncryptionKey)
      } else {
        console.log(`
        X25519 raw private key (hex encoded):
  
        ${dbEncryptionKey}
  
        You can use this key with @veramo/kms-local#SecretBox
        or replace the default agent.yml 'dbEncryptionKey' constant
        `)
      }
    } catch (e: any) {
      console.error(e.message)
    }
  })

config
  .command('check')
  .alias('verify')
  .description('Verify an agent config file syntax')
  .option('-f, --filename <string>', 'Config file name', './agent.yml')
  .option('-m, --method <string>', 'Check that a specific method is exposed by the agent.', 'execute')
  .action(async (options) => {
    const agent = await getAgent(options.filename)
    if (!agent) {
      console.error(
        'unknown error while creating the agent from your config. Consider running `veramo config create` to generate a new configuration file, or to manually compare differences.',
      )
    } else {
      if (typeof agent[options.method] !== 'function') {
        console.error(
          `The agent was created using the config, but the 'agent.${options.method}()' method is not available. Make sure the plugin that implements that method is installed.`,
        )
      } else {
        console.log(
          `Your Veramo configuration seems fine. An agent can be created and the 'agent.${options.method}()' method can be called on it.`,
        )
      }
    }
  })

export { config }
