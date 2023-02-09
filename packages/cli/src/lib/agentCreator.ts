import { TAgent, IPluginMethodMap } from '@veramo/core-types'
import { createObjects } from './objectCreator.js'

export function createAgentFromConfig<T extends IPluginMethodMap>(config: object): TAgent<T> {
  //@ts-ignore
  const { agent } = createObjects(config, { agent: '/agent' })
  return agent
}
