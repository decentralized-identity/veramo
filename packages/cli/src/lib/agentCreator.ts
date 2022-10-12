import { TAgent, IPluginMethodMap } from '@veramo/core'
import { createObjects } from './objectCreator.js'

export async function createAgentFromConfig<T extends IPluginMethodMap>(config: object): Promise<TAgent<T>> {
  //@ts-ignore
  const { agent } = await createObjects(config, { agent: '/agent' })
  return agent
}
