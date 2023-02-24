/**
 * Agent base interface
 * @public
 */
export interface IAgentBase {
  getSchema: () => IAgentPluginSchema
  availableMethods: () => string[]
}

/**
 * Agent that can execute methods
 * @public
 */
export interface IAgent extends IAgentBase {
  execute: <A = any, R = any>(method: string, args: A) => Promise<R>
  emit: (eventType: string, data: any) => Promise<void>
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
 * Describes a listener interface that needs to be implemented by components interested
 * in listening to events emitted by an agent.
 *
 * @public
 */
export interface IEventListener {
  /**
   * Declares the event types that this listener is interested in.
   * @public
   */
  readonly eventTypes?: string[]
  /**
   * Processes an event emitted by the agent.
   * @param context - Execution context. Requires agent with {@link @veramo/core-types#IDataStore} methods
   * @public
   */
  onEvent?(event: { type: string; data: any }, context: IAgentContext<{}>): Promise<void>
}

/**
 * Agent plugin interface
 * @public
 */
export interface IAgentPlugin extends IEventListener {
  readonly methods?: IPluginMethodMap
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
} & IAgent

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
