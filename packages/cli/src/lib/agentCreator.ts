import { TAgent, IPluginMethodMap } from '@veramo/core-types'
import { createObjects } from './objectCreator.js'

/**
 * Creates a Veramo agent from a config object containing an `/agent` pointer.
 * @param config - The configuration object
 *
 * @see {@link https://veramo.io/docs/veramo_agent/configuration_internals | Configuration Internals} for details on
 *   the configuration options.
 *
 * @beta
 */
export async function createAgentFromConfig<T extends IPluginMethodMap>(config: object): Promise<TAgent<T>> {
  // @ts-ignore
  const { agent } = await createObjects(config, { agent: '/agent' })
  return agent
}
