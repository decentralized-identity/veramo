import { IAgentPlugin, TMethodMap } from 'daf-core'
import { supportedMethods } from './methods'

export class RESTAgentPlugin implements IAgentPlugin {
  readonly methods: TMethodMap = {}
  private url: string

  constructor(options: { url: string; methods: string[] }) {
    this.url = options.url

    for (const method of options.methods) {
      if (supportedMethods[method]) {
        this.methods[method] = async (args: any) => {
          // TODO: handle GET
          const data = await fetch(this.url + supportedMethods[method].path, {
            headers: { 'Content-Type': 'application/json' },
            method: supportedMethods[method].type,
            body: JSON.stringify(args),
          })
          return data.json()
        }
      }
    }
  }
}
