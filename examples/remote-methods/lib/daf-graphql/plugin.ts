import 'cross-fetch/polyfill'
import { IAgentPlugin, TMethodMap } from 'daf-core'
import { GraphQLClient } from 'graphql-request'
import { supportedMethods } from './methods'

export class GraphQLAgentPlugin implements IAgentPlugin {
  private client: GraphQLClient
  readonly methods: TMethodMap = {}

  constructor(options: { url: string; apiKey?: string; methods: string[] }) {
    this.client = new GraphQLClient(options.url)

    for (const method of options.methods) {
      if (supportedMethods[method]) {
        this.methods[method] = async (args: any) => {
          const data = await this.client.request(supportedMethods[method].query, args)
          return data[method]
        }
      }
    }
  }
}
