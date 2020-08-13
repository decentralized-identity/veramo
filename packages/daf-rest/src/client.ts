import { IAgentPlugin, IPluginMethodMap } from 'daf-core'
import { supportedMethods } from './index'

export class AgentRestClient implements IAgentPlugin {
  readonly methods: IPluginMethodMap = {}
  private url: string

  constructor(options: {
    url: string
    enabledMethods: string[]
    headers?: Record<string, string>
    extraMethods?: Array<string>
  }) {
    this.url = options.url

    const allMethods: Array<string> = supportedMethods.concat(
      options.extraMethods ? options.extraMethods : [],
    )

    for (const method of options.enabledMethods) {
      if (allMethods.includes(method)) {
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
}
