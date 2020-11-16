import { IAgentContext } from './IAgent'

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
   * @param context - Execution context. Requires agent with {@link daf-core#IDataStore} methods
   */
  onEvent?(event: { type: string; data: any }, context: IAgentContext<{}>): Promise<void>
}

/**
 * Signals that an error occurred when emitting an event
 *
 * @public
 */
export class EventEmitterError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = EventEmitterError.name
  }
}

/**
 * Signals that an error was thrown while a `IEventListener` plugin was processing an event.
 */
export class EventListenerError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = EventListenerError.name
  }
}
