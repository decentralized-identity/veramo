import { IAgentBase, TMethodMap, IAgentPlugin } from './types'
import Debug from 'debug'

export class Agent implements IAgentBase {
  readonly methods: TMethodMap = {}
  private context: Record<string, any>
  private protectedMethods = ['execute', 'availableMethods']

  constructor(options?: { plugins?: IAgentPlugin[]; overrides?: TMethodMap; context?: Record<string, any> }) {
    this.context = options?.context

    if (options?.plugins) {
      for (const plugin of options.plugins) {
        this.methods = { ...this.methods, ...plugin.methods }
      }
    }

    if (options?.overrides) {
      this.methods = { ...this.methods, ...options.overrides }
    }

    for (const method of Object.keys(this.methods)) {
      if (!this.protectedMethods.includes(method)) {
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
