import { IAgent, IPluginMethodMap, IAgentPlugin, TAgent } from './types'
import Debug from 'debug'

/**
 * Filters unauthorized methods. By default all methods are authorized
 * @internal
 */
const filterUnauthorizedMethods = (
  methods: IPluginMethodMap,
  authorizedMethods?: string[],
): IPluginMethodMap => {
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

/**
 * Agent configuration options
 *
 * @public
 */
export interface IAgentOptions {
  /**
   * The array of agent plugins
   */
  plugins?: IAgentPlugin[]

  /**
   * The map of plugin methods. Can be used to override methods provided by plugins, or to add additional methods without writing a plugin
   */
  overrides?: IPluginMethodMap

  /**
   * The array of method names that will be exposed by the agent
   */
  authorizedMethods?: string[]

  /**
   * The context object that will be available to the plugin methods
   *
   * @example
   * ```typescript
   * {
   *   authorizedDid: 'did:example:123'
   * }
   * ```
   */
  context?: Record<string, any>
}

/**
 * Provides a common context for all plugin methods
 *
 * @public
 */
export class Agent implements IAgent {
  /**
   * The map of plugin + override methods
   */
  readonly methods: IPluginMethodMap = {}

  private context?: Record<string, any>
  private protectedMethods = ['execute', 'availableMethods']

  /**
   * Constructs a new instance of the `Agent` class
   *
   * @param options - Configuration options
   * @public
   */
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

  /**
   * Lists available agent method names
   *
   * @returns a list of available methods
   * @public
   */
  availableMethods(): string[] {
    return Object.keys(this.methods)
  }

  /**
   * Executes a plugin method
   *
   * @remarks
   * Plugin method will receive a context object as a second argument.
   * Context object always has `agent` property that is the `Agent` instance that is executing said method
   *
   * @param method - method name
   * @param args - arguments object
   * @example
   * ```typescript
   * await agent.execute('foo', { bar: 'baz' })
   *
   * // is equivalent to:
   * await agent.foo({ bar: 'baz' })
   * ```
   * @public
   */
  async execute<P = any, R = any>(method: string, args: P): Promise<R> {
    Debug('daf:agent:' + method)('%o', args)
    if (!this.methods[method]) throw Error('Method not available: ' + method)
    const result = await this.methods[method](args, { ...this.context, agent: this })
    Debug('daf:agent:' + method + ':result')('%o', result)
    return result
  }
}

/**
 * Helper function to create a new instance of the {@link Agent} class with correct type
 *
 * @remarks
 * Use {@link TAgent} to configure agent type (list of available methods) for autocomplete in IDE
 *
 * @example
 * ```typescript
 * import { createAgent, IResolveDid, IMessageHandler } from 'daf-core'
 * import { AgentRestClient } from 'daf-rest'
 * import { CredentialIssuer, ICredentialIssuer } from 'daf-w3c'
 * const agent = createAgent<IResolveDid & IMessageHandler & ICredentialIssuer>({
 *   plugins: [
 *     new CredentialIssuer(),
 *     new AgentRestClient({
 *       url: 'http://localhost:3002/agent',
 *       enabledMethods: [
 *         'resolveDid',
 *         'handleMessage',
 *       ],
 *     }),
 *   ],
 * })
 * ```
 * @param options - Agent configuration options
 * @returns configured agent
 * @public
 */
export function createAgent<T extends IPluginMethodMap>(options: IAgentOptions): TAgent<T> {
  //@ts-ignore
  return new Agent(options)
}
