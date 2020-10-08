/**
 * Agent base interface
 * @public
 */
export interface IAgentBase {
  availableMethods: () => string[]
}

/**
 * Agent that can execute methods
 * @public
 */
export interface IAgent extends IAgentBase {
  execute: <A = any, R = any>(method: string, args: A) => Promise<R>
}

/**
 * Agent plugin method interface
 * @public
 */
export interface IPluginMethod {
  (args: any, context: any): Promise<any>
}

/**
 * Plugin method map interface
 * @public
 */
export interface IPluginMethodMap extends Record<string, IPluginMethod> {}

/**
 * Agent plugin schema
 * @public
 */
export interface IAgentPluginSchema {
  components: {
    schemas: any
    methods: any
  }
}


/**
 * Agent plugin interface
 * @public
 */
export interface IAgentPlugin {
  readonly methods: IPluginMethodMap
  readonly schema?: IAgentPluginSchema
}

/**
 * Removes context parameter from plugin method interface
 * @public
 */
export interface RemoveContext<T extends IPluginMethod> {
  (args?: Parameters<T>[0] | undefined): ReturnType<T>
}

/**
 * Utility type for constructing agent type that has a list of available methods
 * @public
 */
export type TAgent<T extends IPluginMethodMap> = {
  [P in keyof T]: RemoveContext<T[P]>
} &
  IAgent

/**
 * Standard plugin method context interface
 *
 * @remarks
 * When executing plugin method, you don't need to pass in the context.
 * It is done automatically by the agent
 *
 * @example
 * ```typescript
 * await agent.resolveDid({
 *   didUrl: 'did:example:123'
 * })
 * ```
 * @public
 */
export interface IAgentContext<T extends IPluginMethodMap> {
  /**
   * Configured agent
   */
  agent: TAgent<T>
}

