import 'cross-fetch/polyfill'
import yaml from 'yaml'
import { IDataStore, IDidManager, IMessageHandler, IKeyManager, IResolver, TAgent } from 'daf-core'
import { ICredentialIssuer } from 'daf-w3c'
import { ISelectiveDisclosure } from 'daf-selective-disclosure'
import { IDIDComm } from 'daf-did-comm'
import { IDataStoreORM } from 'daf-typeorm'
const fs = require('fs')
import { createAgentFromConfig } from './lib/agentCreator'

export const getConfig = (fileName: string): any => {
  if (!fs.existsSync(fileName)) {
    console.log('Config file not found: ' + fileName)
    console.log('Use "daf create-config" to create one')
    process.exit(1)
  }

  const config = yaml.parse(fs.readFileSync(fileName).toString())
  return config
}

export type EnabledInterfaces = IDidManager &
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
