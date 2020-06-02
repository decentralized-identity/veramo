export interface IAgent {
  execute: <A = any, R = any>(method: string, args: A) => Promise<R>
  availableMethods: () => string[]
}

export interface IContext extends Record<string, any> {
  agent: IAgent
}

export type TAgentMethod = (args?: any, context?: IContext) => Promise<any>
export type TMethodMap = Record<string, TAgentMethod>
export interface IAgentExtension<T extends TAgentMethod> {
  (arg: Parameters<T>[0]): ReturnType<T>
}
export interface IAgentPlugin {
  readonly methods: TMethodMap
}

export class Agent implements IAgent {
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
    if (!this.methods[method]) throw Error('Method not available: ' + method)
    return this.methods[method](args, { ...this.context, agent: this })
  }
}
