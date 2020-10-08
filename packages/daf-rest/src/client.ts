import 'cross-fetch/polyfill'
import { IAgentPlugin, IPluginMethodMap, IAgentPluginSchema } from 'daf-core'
import { supportedMethods } from './index'
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


export class AgentRestClient implements IAgentPlugin {
  readonly methods: IPluginMethodMap = {}
  readonly schema = schema
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
