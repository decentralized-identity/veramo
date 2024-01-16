import { IAgentPlugin, IPluginMethodMap, IAgentPluginSchema } from '@veramo/core-types'

/**
 * This plugin can be used to access the methods of a remote Veramo agent as if they were implemented locally.
 *
 * The remote agent should be provided by {@link @veramo/remote-server#AgentRouter | AgentRouter}, or a similar
 * implementation of this API.
 *
 * The schema of the remote agent is usually provided by {@link @veramo/remote-server#ApiSchemaRouter |
 * ApiSchemaRouter}.
 *
 * @public
 */
export class AgentRestClient implements IAgentPlugin {
  readonly methods: IPluginMethodMap = {}
  readonly schema?: IAgentPluginSchema
  private url: string

  constructor(options: {
    url: string
    enabledMethods: string[]
    schema?: IAgentPluginSchema
    headers?: Record<string, string> | (() => Promise<Record<string, string>>)
  }) {
    this.url = options.url
    this.schema = options.schema

    for (const method of options.enabledMethods) {
      this.methods[method] = async (args: any) => {
        // in case headers is an async call, we will wait for it to resolve
        const headers = typeof options.headers === 'function' ? await options.headers() : options.headers
        const res = await fetch(this.url + '/' + method, {
          headers: { ...headers, 'Content-Type': 'application/json' },
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
