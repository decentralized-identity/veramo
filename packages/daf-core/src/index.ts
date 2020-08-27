/**
 * The core package of DID Agent Framework
 *
 * @packageDocumentation
 */
export { Agent, createAgent, IAgentOptions } from './agent'
export * from './types'
export { MessageHandler, IHandleMessage, IHandleMessageArgs } from './message-handler'
export { Message } from './message'
export { AbstractMessageHandler } from './abstract/abstract-message-handler'
export { DIDDocument } from 'did-resolver'
