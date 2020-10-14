import 'cross-fetch/polyfill'
import yaml from 'yaml'
import program from 'commander'
import { IDataStore, IIdentityManager, IMessageHandler, IKeyManager, IResolver, TAgent } from 'daf-core'
import { ICredentialIssuer } from 'daf-w3c'
import { ISelectiveDisclosure } from 'daf-selective-disclosure'
import { IDIDComm } from 'daf-did-comm'
import { IDataStoreORM } from 'daf-typeorm'
const fs = require('fs')
const { dirname, resolve } = require('path')
import { createAgentFromConfig } from './lib/agentCreator'

const defaultConfig = './agent.yml'
program.option('--config <path>', 'Configuration file', defaultConfig)

program
  .command('create-config')
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

export const getConfig = (fileName: string): any => {
  if (!fs.existsSync(fileName)) {
    console.log('Config file not found: ' + fileName)
    console.log('Use "daf create-config" to create one')
    process.exit(1)
  }

  const config = yaml.parse(fs.readFileSync(fileName).toString())
  return config
}

export type EnabledInterfaces = IIdentityManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolver &
  IMessageHandler &
  IDIDComm &
  ICredentialIssuer &
  ISelectiveDisclosure

export type ConfiguredAgent = TAgent<EnabledInterfaces>

export function getAgent(fileName: string) {
  try {
    return createAgentFromConfig<EnabledInterfaces>(getConfig(fileName))
  } catch (e) {
    console.log('Unable to create agent from ' + fileName + '.', e.message)
    process.exit(1)
  }
}
