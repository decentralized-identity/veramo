import { IAgentPlugin, IPluginMethodMap } from "./types/IAgent.js"

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
  
    /**
     * Flag that enables schema validation for plugin methods.
     *
     * Defaults to `false`.
     */
    schemaValidation?: boolean
  }
  