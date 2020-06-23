import 'cross-fetch/polyfill'
import { IAgentPlugin, IPluginMethodMap } from 'daf-core'
import { GraphQLClient } from 'graphql-request'
import { IAgentGraphQLMethod } from './types'
import { supportedMethods } from './methods'

export class AgentGraphQLClient implements IAgentPlugin {
  private client: GraphQLClient
  readonly methods: IPluginMethodMap = {}

  constructor(options: {
    url: string
    enabledMethods: string[]
    headers?: Response['headers']
    overrides?: Record<string, IAgentGraphQLMethod>
  }) {
    this.client = new GraphQLClient(options.url)

    if (options.headers) {
      this.client.setHeaders(options.headers)
    }

    let availableMethods = { ...supportedMethods }
    if (options.overrides) {
      availableMethods = { ...availableMethods, ...options.overrides }
    }

    for (const method of options.enabledMethods) {
      if (availableMethods[method]) {
        this.methods[method] = async (args: any) => {
          const data = await this.client.request(availableMethods[method].query, args)
          return data[method]
        }
      }
    }
  }
}
