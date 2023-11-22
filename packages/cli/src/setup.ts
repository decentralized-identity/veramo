import yaml from 'yaml'
import {
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '@veramo/core-types'
import {
  IMediationManager,

} from "@veramo/mediation-manager"
import { ISelectiveDisclosure } from '@veramo/selective-disclosure'
import { IDIDComm } from '@veramo/did-comm'
import { IDIDDiscovery } from '@veramo/did-discovery'
import { createAgentFromConfig } from './lib/agentCreator.js'

import fs from 'fs'

/**
 * Parses a yaml config file and returns a config object
 * @param filePath
 */
export const getConfig = async (filePath: fs.PathLike): Promise<{ version?: number; [x: string]: any }> => {
  let fileContent: string

  // read file async
  try {
    fileContent = await fs.promises.readFile(filePath, 'utf8')
  } catch (e) {
    console.log('Config file not found: ' + filePath)
    console.log('Use "veramo config create" to create one')
    process.exit(1)
  }

  let config

  try {
    config = yaml.parse(fileContent, { prettyErrors: true })
  } catch (e) {
    console.error(`Unable to parse config file: ${e.message} ${e.linePos}`)
    process.exit(1)
  }

  if (config?.version != 3) {
    console.error('Unsupported configuration file version:', config.version)
    process.exit(1)
  }
  return config
}

export type EnabledInterfaces = IDIDManager &
  IKeyManager &
  IDataStore &
  IDataStoreORM &
  IResolver &
  IMessageHandler &
  IDIDComm &
  ICredentialPlugin &
  ISelectiveDisclosure &
  IDIDDiscovery &
  IMediationManager

export type ConfiguredAgent = TAgent<EnabledInterfaces>

export async function getAgent(fileName: string): Promise<ConfiguredAgent> {
  try {
    return await createAgentFromConfig<EnabledInterfaces>(await getConfig(fileName))
  } catch (e: any) {
    console.log('Unable to create agent from ' + fileName + '.', e.message)
    process.exit(1)
  }
}
