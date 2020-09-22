import 'cross-fetch/polyfill'
import yaml from 'yaml'
import program from 'commander'
import { IDataStore, IIdentityManager, IMessageHandler, IKeyManager, IResolver, TAgent } from 'daf-core'
import { ICredentialIssuer } from 'daf-w3c'
import { ISelectiveDisclosure } from 'daf-selective-disclosure'
import { IDIDComm } from 'daf-did-comm'
import { IDataStoreORM } from 'daf-typeorm'
const fs = require('fs')
const { dirname } = require('path')
import { createAgentFromConfig } from './lib/agentCreator'

const defaultConfig = process.env.HOME + '/.daf/config.yml'
program.option('--config <path>', 'Configuration file', defaultConfig)

const getConfig = (fileName: string): object => {
  if (!fs.existsSync(dirname(fileName))) {
    fs.mkdirSync(dirname(fileName))
  }

  if (!fs.existsSync(fileName)) {
    console.log('Config file does not exist. Creating: ' + fileName)
    const contents = fs.readFileSync(__dirname + '/../default/config.yml')
    fs.writeFileSync(fileName, contents)
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
  return createAgentFromConfig<EnabledInterfaces>(getConfig(fileName))
}
