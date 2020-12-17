import 'cross-fetch/polyfill'
import { IAgentPlugin, IPluginMethodMap, IAgentPluginSchema } from 'daf-core'

export class AgentRestClient implements IAgentPlugin {
  readonly methods: IPluginMethodMap = {}
  readonly schema?: IAgentPluginSchema
  private url: string

  constructor(options: {
    url: string
    enabledMethods: string[]
    schema?: IAgentPluginSchema
    headers?: Record<string, string>
  }) {
    this.url = options.url
    this.schema = options.schema

    for (const method of options.enabledMethods) {
      this.methods[method] = async (args: any) => {
        const res = await fetch(this.url + '/' + method, {
          headers: { ...options.headers, 'Content-Type': 'application/json' },
          method: 'post',
          body: JSON.stringify(args),
        })
        const json = await res.json()

        if (res.status >= 400) {
          throw Error(json.error)
        }

        return json
      }
    }
  }
}
