import 'cross-fetch/polyfill'
import { IAgentPlugin, TMethodMap } from 'daf-core'
import { GraphQLClient } from 'graphql-request'
import * as SupportedMethods from './methods'

export class DafGraphQL implements IAgentPlugin {
  private client: GraphQLClient
  readonly methods: TMethodMap = {}

  constructor(options: { url: string; apiKey?: string; methods: string[] }) {
    this.client = new GraphQLClient(options.url)

    for (const method of options.methods) {
      this.methods[method] = async (args: any) => {
        const { result } = await this.client.request(SupportedMethods[method], args)
        return result
      }
    }
  }
}
