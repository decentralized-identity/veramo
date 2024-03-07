import type { IAgent, IAgentOptions, IAgentPluginSchema, IPluginMethodMap, TAgent } from '@veramo/core-types'
import { CoreEvents } from '@veramo/core-types'
import { validateArguments, validateReturnType } from './validator.js'
import ValidationErrorSchema from './schemas/ValidationError.js'
import Debug from 'debug'
import { EventEmitter } from 'events'

/**
 * Filters unauthorized methods. By default, all methods are authorized
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
 * Provides a common context for all plugin methods.
 *
 * This is the main entry point into the API of Veramo.
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
  private schemaValidation: boolean
  public readonly context?: Record<string, any>
  private protectedMethods = ['execute', 'availableMethods', 'emit']

  private readonly eventBus: EventEmitter = new EventEmitter()
  private readonly eventQueue: (Promise<any> | undefined)[] = []

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
            this.eventBus.on(eventType, (args) => {
              const promise = plugin?.onEvent?.(
                { type: eventType, data: args },
                { ...this.context, agent: this },
              )
              this.eventQueue.push(promise)
              promise?.catch((rejection) => {
                if (eventType !== CoreEvents.error) {
                  this.eventBus.emit(CoreEvents.error, rejection)
                } else {
                  this.eventQueue.push(
                    Promise.reject(
                      new Error('ErrorEventHandlerError: throwing an error in an error handler should crash'),
                    ),
                  )
                }
              })
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
        // @ts-ignore
        this[method] = async (args: any) => this.execute(method, args)
      }
    }

    this.schemaValidation = options?.schemaValidation || false
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
    Debug('veramo:agent:' + method)('%s %o', 'arg', args)
    if (!this.methods[method]) throw Error('Method not available: ' + method)
    const _args = args || {}
    if (this.schemaValidation && this.schema.components.methods[method]) {
      validateArguments(method, _args, this.schema)
    }
    const result = await this.methods[method](_args, { ...this.context, agent: this })
    if (this.schemaValidation && this.schema.components.methods[method]) {
      validateReturnType(method, result, this.schema)
    }
    Debug('veramo:agent:' + method)('%s %o', 'res', JSON.stringify(result))
    return result
  }

  /**
   * Broadcasts an `Event` to potential listeners.
   *
   * Listeners are `IEventListener` instances that declare `eventTypes`
   * and implement an `async onEvent({type, data}, context)` method.
   * Note that `IAgentPlugin` is also an `IEventListener` so plugins can be listeners for events.
   *
   * During creation, the agent automatically registers listener plugins
   * to the `eventTypes` that they declare.
   *
   * Events are processed asynchronously, so the general pattern to be used is fire-and-forget.
   * Ex: `agent.emit('foo', {eventData})`
   *
   * In situations where you need to make sure that all events in the queue have been exhausted,
   * the `Promise` returned by `emit` can be awaited.
   * Ex: `await agent.emit('foo', {eventData})`
   *
   * In case an error is thrown while processing an event, the error is re-emitted as an event
   * of type `CoreEvents.error` with a `EventListenerError` as payload.
   *
   * Note that `await agent.emit()` will NOT throw an error. To process errors, use a listener
   * with `eventTypes: [ CoreEvents.error ]` in the definition.
   *
   * @param eventType - the type of event being emitted
   * @param data - event payload.
   *     Use the same `data` type for events of a particular `eventType`.
   *
   * @public
   */
  async emit(eventType: string, data: any): Promise<void> {
    this.eventBus.emit(eventType, data)
    while (this.eventQueue.length > 0) {
      try {
        await this.eventQueue.shift()
      } catch (e: any) {
        //nop
        if (typeof e?.message === 'string' && e?.message?.startsWith('ErrorEventHandlerError')) {
          throw e
        }
      }
    }
  }
}

/**
 * Helper function to create a new instance of the {@link Agent} class with correct type
 *
 * @remarks
 * Use {@link @veramo/core-types#TAgent} to configure agent type (list of available methods) for autocomplete in IDE
 *
 * @example
 * ```typescript
 * import { createAgent, IResolver, IMessageHandler } from '@veramo/core'
 * import { AgentRestClient } from '@veramo/remote-client'
 * import { CredentialIssuer, ICredentialIssuer } from '@veramo/credential-w3c'
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
export function createAgent<T extends IPluginMethodMap, C = Record<string, any>>(
  options: IAgentOptions & { context?: C },
): TAgent<T> & { context?: C } {
  // @ts-ignore
  return new Agent(options) as TAgent<T>
}
