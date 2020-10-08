import 'cross-fetch/polyfill'
import { IAgentPlugin, IPluginMethodMap, IAgentPluginSchema } from 'daf-core'
import { GraphQLClient } from 'graphql-request'
import { IAgentGraphQLMethod } from './types'
import { supportedMethods } from './methods'
import IMessageHandler from 'daf-core/build/schemas/IMessageHandler'
import IDataStore from 'daf-core/build/schemas/IDataStore'
import IKeyManager from 'daf-core/build/schemas/IKeyManager'
import IResolver from 'daf-core/build/schemas/IResolver'

const schema: IAgentPluginSchema = {
  components: {
    schemas: {
      ...IMessageHandler.components.schemas,
      ...IDataStore.components.schemas,
      ...IKeyManager.components.schemas,
      ...IResolver.components.schemas,
    },
    methods: {
      ...IMessageHandler.components.methods,
      ...IDataStore.components.methods,
      ...IKeyManager.components.methods,
      ...IResolver.components.methods,
    },
  }
}

export class AgentGraphQLClient implements IAgentPlugin {
  private client: GraphQLClient
  readonly methods: IPluginMethodMap = {}
  readonly schema = schema

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
