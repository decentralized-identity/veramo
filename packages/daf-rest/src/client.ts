import { IAgentPlugin, IPluginMethodMap } from 'daf-core'
import { supportedMethods } from './methods'
import { IAgentRESTMethod } from './types'

export class AgentRestClient implements IAgentPlugin {
  readonly methods: IPluginMethodMap = {}
  private url: string

  constructor(options: {
    url: string
    enabledMethods: string[]
    headers?: Record<string, string>
    overrides?: Record<string, IAgentRESTMethod>
  }) {
    this.url = options.url

    const allMethods: Record<string, IAgentRESTMethod> = { ...supportedMethods, ...options.overrides }

    for (const method of options.enabledMethods) {
      if (allMethods[method]) {
        this.methods[method] = async (args: any) => {
          // TODO: handle GET
          const res = await fetch(this.url + allMethods[method].path, {
            headers: { ...options.headers, 'Content-Type': 'application/json' },
            method: allMethods[method].type,
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
