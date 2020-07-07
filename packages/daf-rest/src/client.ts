import { IAgentPlugin, IPluginMethodMap } from 'daf-core'
import { supportedMethods } from './methods'
import { IAgentRESTMethod } from './types'

export class AgentRestClient implements IAgentPlugin {
  readonly methods: IPluginMethodMap = {}
  private url: string

  constructor(options: {
    url: string
    enabledMethods: string[]
    headers?: Response['headers']
    overrides?: Record<string, IAgentRESTMethod>
  }) {
    this.url = options.url

    for (const method of options.enabledMethods) {
      if (supportedMethods[method]) {
        this.methods[method] = async (args: any) => {
          // TODO: handle GET
          const res = await fetch(this.url + supportedMethods[method].path, {
            headers: { ...options.headers, 'Content-Type': 'application/json' },
            method: supportedMethods[method].type,
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
}
