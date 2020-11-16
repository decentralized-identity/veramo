import { IAgent, IPluginMethodMap, IAgentPlugin, TAgent, IAgentPluginSchema } from './types/IAgent'
import { validateArguments, validateReturnType } from './validator'
import ValidationErrorSchema from './schemas/ValidationError'
import Debug from 'debug'
import { EventEmitter } from 'events'
import { EventEmitterError, EventListenerError } from './types/IEventListener'

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
 * Agent configuration options.
 *
 * This interface is used to describe the constellation of plugins that this agent
 * will use and provide.
 *
 * You will use this to attach plugins, to setup overrides for their methods and to
 * explicitly set the methods that this agent instance is allowed to call.
 * This permissioning method is also used for internal calls made by plugin code.
 *
 * @public
 */
export interface IAgentOptions {
  /**
   * The array of agent plugins
   */
  plugins?: IAgentPlugin[]

  /**
   * The map of plugin methods. Can be used to override methods provided by plugins,
   * or to add additional methods without writing a plugin
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
 * Provides a common context for all plugin methods.
 *
 * This is the main entry point into the API of the DID Agent Framework.
 * When plugins are installed, they extend the API of the agent and the methods
 * they provide can all use the common context so that plugins can build on top
 * of each other and create a richer experience.
 *
 * @public
 */
export class Agent implements IAgent {
  /**
   * The map of plugin + override methods
   */
  readonly methods: IPluginMethodMap = {}

  private schema: IAgentPluginSchema
  private context?: Record<string, any>
  private readonly eventBus: EventEmitter = new EventEmitter()
  private protectedMethods = ['execute', 'availableMethods', 'emit']

  /**
   * Constructs a new instance of the `Agent` class
   *
   * @param options - Configuration options
   * @public
   */
  constructor(options?: IAgentOptions) {
    this.context = options?.context

    this.schema = {
      components: {
        schemas: {
          ...ValidationErrorSchema.components.schemas,
        },
        methods: {},
      },
    }

    if (options?.plugins) {
      for (const plugin of options.plugins) {
        this.methods = {
          ...this.methods,
          ...filterUnauthorizedMethods(plugin.methods || {}, options.authorizedMethods),
        }
        if (plugin.schema) {
          this.schema = {
            components: {
              schemas: {
                ...this.schema.components.schemas,
                ...plugin.schema.components.schemas,
              },
              methods: {
                ...this.schema.components.methods,
                ...plugin.schema.components.methods,
              },
            },
          }
        }
        if (plugin?.eventTypes && plugin?.onEvent) {
          for (const eventType of plugin.eventTypes) {
            this.eventBus.on(eventType, async (args) => {
              try {
                await plugin?.onEvent?.({ type: eventType, data: args }, { ...this.context, agent: this })
              } catch (e) {
                await this.eventBus.emit(
                  'error',
                  new EventListenerError(`type=${eventType}, data=${args}, err=${e}`),
                )
              }
            })
          }
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
   * Returns agent plugin schema
   *
   * @returns agent plugin schema
   * @public
   */
  getSchema(): IAgentPluginSchema {
    return this.schema
  }

  /**
   * Executes a plugin method.
   *
   * Normally, the `execute()` method need not be called.
   * The agent will expose the plugin methods directly on the agent instance
   * but this can be used when dynamically deciding which methods to call.
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
    const _args = args || {}
    if (this.schema.components.methods[method]) {
      validateArguments(method, _args, this.schema)
    }
    const result = await this.methods[method](_args, { ...this.context, agent: this })
    if (this.schema.components.methods[method]) {
      validateReturnType(method, result, this.schema)
    }
    Debug('daf:agent:' + method + ':result')('%o', result)
    return result
  }

  /**
   * Broadcasts an `Event` to potential listeners.
   *
   * Listeners are `IAgentPlugin` instances that declare `eventTypes`
   * and implement an `onEvent()` method.
   *
   * During creation, the agent automatically registers listener plugins
   * to the `eventTypes` that they declare.
   *
   * @param eventType - the type of event being emitted
   * @param data - event payload.
   *     Use the same `data` type for events of a particular `eventType`.
   *
   * @public
   */
  async emit(eventType: string, data: any): Promise<void> {
    try {
      await this.eventBus.emit(eventType, data)
    } catch (e) {
      this.eventBus.emit('error', new EventEmitterError(`type=${eventType}, data=${data}, err=${e}`))
    }
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
 * import { createAgent, IResolver, IMessageHandler } from 'daf-core'
 * import { AgentRestClient } from 'daf-rest'
 * import { CredentialIssuer, ICredentialIssuer } from 'daf-w3c'
 * const agent = createAgent<IResolver & IMessageHandler & ICredentialIssuer>({
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
