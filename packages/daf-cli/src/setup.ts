import yaml from 'yaml'
import { IDataStore, IIdentityManager, IMessageHandler, IKeyManager, IResolver } from 'daf-core'
import { ICredentialIssuer } from 'daf-w3c'
import { ISelectiveDisclosure } from 'daf-selective-disclosure'
import { IDIDComm } from 'daf-did-comm'
import { IDataStoreORM } from 'daf-typeorm'
const fs = require('fs')
import { createAgentFromConfig } from './lib/agentCreator'

const defaultPath = process.env.HOME + '/.daf/'

const getConfig = (configFile?: string): object => {
  if (!fs.existsSync(defaultPath)) {
    fs.mkdirSync(defaultPath)
  }

  const fileName = configFile || defaultPath + 'config.yml'
  if (!fs.existsSync(fileName)) {
    console.log('Config file does not exist. Creating: ' + fileName)
    const contents = fs.readFileSync(__dirname + '/../default/config.yml')
    fs.writeFileSync(fileName, contents)
  }
  const config = yaml.parse(fs.readFileSync(fileName).toString())
  return config
}

export const agent = createAgentFromConfig<
  IIdentityManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    IMessageHandler &
    IDIDComm &
    ICredentialIssuer &
    ISelectiveDisclosure
>(getConfig())
