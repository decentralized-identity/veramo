import { IAgent, IPluginMethodMap, IAgentPlugin } from './types'
import Debug from 'debug'

const filterUnauthorizedMethods = (
  methods: IPluginMethodMap,
  authorizedMethods?: string[],
): IPluginMethodMap => {
  // All methods are authorized by default
  if (!authorizedMethods) {
    return methods
  }

  const result: IPluginMethodMap = {}
  for (const methodName of Object.keys(methods)) {
    if (authorizedMethods.includes(methodName)) {
      result[methodName] = methods[methodName]
    }
  }

  return result
}

export interface IAgentOptions {
  plugins?: IAgentPlugin[]
  overrides?: IPluginMethodMap
  authorizedMethods?: string[]
  context?: Record<string, any>
}

export class Agent implements IAgent {
  readonly methods: IPluginMethodMap = {}
  private context?: Record<string, any>
  private protectedMethods = ['execute', 'availableMethods']

  constructor(options?: IAgentOptions) {
    this.context = options?.context

    if (options?.plugins) {
      for (const plugin of options.plugins) {
        this.methods = {
          ...this.methods,
          ...filterUnauthorizedMethods(plugin.methods, options.authorizedMethods),
        }
      }
    }

    if (options?.overrides) {
      this.methods = {
        ...this.methods,
        ...filterUnauthorizedMethods(options.overrides, options.authorizedMethods),
      }
    }

    for (const method of Object.keys(this.methods)) {
      if (!this.protectedMethods.includes(method)) {
        //@ts-ignore
        this[method] = async (args: any) => this.execute(method, args)
      }
    }
  }

  availableMethods() {
    return Object.keys(this.methods)
  }

  async execute<P = any, R = any>(method: string, args: P): Promise<R> {
    Debug('daf:agent:' + method)('%o', args)
    if (!this.methods[method]) throw Error('Method not available: ' + method)
    const result = await this.methods[method](args, { ...this.context, agent: this })
    Debug('daf:agent:' + method + ':result')('%o', result)
    return result
  }
}

export function createAgent<T>(options: IAgentOptions): T {
  //@ts-ignore
  return new Agent(options)
}
