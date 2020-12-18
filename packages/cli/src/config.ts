import 'cross-fetch/polyfill'
import program from 'commander'
import { SecretBox } from '@veramo/kms-local'
const fs = require('fs')
const { dirname } = require('path')

program.option('--config <path>', 'Configuration file', './agent.yml')

const config = program.command('config').description('Agent configuration')

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
  .description('generate secret key')
  .action(async (raw) => {
    try {
      const secretKey = await SecretBox.createSecretKey()
      console.log(secretKey)
    } catch (e) {
      console.error(e.message)
    }
  })
