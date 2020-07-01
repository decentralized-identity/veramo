/**
 * The main library for creating Decentralized Identity Agents
 *
 * @packageDocumentation
 */
export { Agent, createAgent, IAgentOptions } from './agent'
export * from './types'
export { IdentityManager, IIdentityManager } from './identity-manager'
export { KeyManager, IKeyManager } from './key-manager'
export { MessageHandler, IHandleMessage } from './message-handler'
export { Message } from './message'
export { AbstractIdentityProvider } from './abstract/abstract-identity-provider'
export { AbstractKeyManagementSystem } from './abstract/abstract-key-management-system'
export { AbstractIdentityStore } from './abstract/abstract-identity-store'
export { AbstractKeyStore } from './abstract/abstract-key-store'
export { AbstractSecretBox } from './abstract/abstract-secret-box'
export { AbstractMessageHandler } from './abstract/abstract-message-handler'
export { DIDDocument } from 'did-resolver'
