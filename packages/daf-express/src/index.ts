/**
 * {@link https://expressjs.com | Express} router for exposing `daf-rest` OpenAPI schema
 *
 * @example
 * ```typescript
 * import express from 'express'
 * import { agent } from './agent'
 * import { AgentRouter } from 'daf-express'
 *
 * const agentRouter = AgentRouter({
 *   getAgentForRequest: async req => agent,
 *   exposedMethods: agent.availableMethods()
 * })
 *
 * const app = express()
 * app.use('/agent', agentRouter)
 * app.listen(3002)
 * ```
 *
 * @packageDocumentation
 */

import { IAgent, IIdentity, IIdentityManager, TAgent } from 'daf-core'
import { Request, Response, NextFunction, Router, json } from 'express'
import { getOpenApiSchema } from 'daf-rest'
import Debug from 'debug'

interface RequestWithAgent extends Request {
  agent?: IAgent
}

/**
 * @public
 */
export interface AgentRouterOptions {
  /**
   * Function that returns configured agent for specific request
   */
  getAgentForRequest: (req: Request) => Promise<IAgent>

  /**
   * List of exposed methods
   */
  exposedMethods: Array<string>
}

/**
 * Creates a router that exposes {@link daf-core#Agent} methods
 *
 * @param options - Initialization option
 * @returns Expressjs router
 */
export const AgentRouter = (options: AgentRouterOptions): Router => {
  const router = Router()
  router.use(json())
  router.use(async (req: RequestWithAgent, res, next) => {
    req.agent = await options.getAgentForRequest(req)
    next()
  })

  for (const exposedMethod of options.exposedMethods) {
    Debug('daf:express:initializing')(exposedMethod)

    router.post('/' + exposedMethod, async (req: RequestWithAgent, res: Response, next: NextFunction) => {
      if (!req.agent) throw Error('Agent not available')
      try {
        const result = await req.agent.execute(exposedMethod, req.body)
        res.status(200).json(result)
      } catch (e) {
        if (e.name === 'ValidationError') {
          res.status(400).json({
            name: 'ValidationError',
            message: e.message,
            method: e.method,
            path: e.path,
            code: e.code,
            description: e.description,
          })
        } else {
          res.status(500).json({ error: e.message })
        }
      }
    })
  }

  return router
}

/**
 * @public
 */
export interface AgentApiSchemaRouterOptions {
  /**
   * Function that returns configured agent for specific request
   */
  getAgentForRequest: (req: Request) => Promise<IAgent>

  /**
   * List of exposed methods
   */
  exposedMethods: Array<string>

  /**
   * Base path
   */
  basePath: string

  /**
   * Security scheme
   * @example
   * ```
   * 'bearer'
   * ```
   */
  securityScheme?: string
}

/**
 * Creates a router that exposes {@link daf-core#Agent} OpenAPI schema
 *
 * @param options - Initialization option
 * @returns Expressjs router
 */
export const AgentApiSchemaRouter = (options: AgentApiSchemaRouterOptions): Router => {
  const router = Router()
  router.use(async (req: RequestWithAgent, res, next) => {
    req.agent = await options.getAgentForRequest(req)
    next()
  })

  router.get('/', (req: RequestWithAgent, res) => {
    if (req.agent) {
      const openApiSchema = getOpenApiSchema(req.agent, '', options.exposedMethods)
      const url = req.protocol + '://' + req.hostname + options.basePath
      openApiSchema.servers = [{ url }]

      if (options.securityScheme && openApiSchema.components) {
        openApiSchema.components.securitySchemes = {
          auth: { type: 'http', scheme: options.securityScheme },
        }
        openApiSchema.security = [{ auth: [] }]
      }

      res.json(openApiSchema)
    } else {
      res.status(500).json({ error: 'Agent not available' })
    }
  })

  return router
}

interface RequestWithAgentIdentityManager extends Request {
  agent?: TAgent<IIdentityManager>
}

export const didDocEndpoint = '/.well-known/did.json'
/**
 * @public
 */
export interface AgentDidDocRouterOptions {
  /**
   * Function that returns configured agent for specific request
   */
  getAgentForRequest: (req: Request) => Promise<TAgent<IIdentityManager>>
}
/**
 * Creates a router that serves `did:web` DID Documents
 *
 * @param options - Initialization option
 * @returns Expressjs router
 */
export const AgentDidDocRouter = (options: AgentDidDocRouterOptions): Router => {
  const router = Router()
  router.use(async (req: RequestWithAgent, res, next) => {
    req.agent = await options.getAgentForRequest(req)
    next()
  })

  const didDocForIdentity = (identity: IIdentity) => {
    const didDoc = {
      '@context': 'https://w3id.org/did/v1',
      id: identity.did,
      publicKey: identity.keys.map((key) => ({
        id: identity.did + '#' + key.kid,
        type: key.type === 'Secp256k1' ? 'Secp256k1VerificationKey2018' : 'Ed25519VerificationKey2018',
        controller: identity.did,
        publicKeyHex: key.publicKeyHex,
      })),
      authentication: identity.keys.map((key) => ({
        type:
          key.type === 'Secp256k1'
            ? 'Secp256k1SignatureAuthentication2018'
            : 'Ed25519SignatureAuthentication2018',
        publicKey: identity.did + '#' + key.kid,
      })),
      service: identity.services,
    }

    return didDoc
  }

  router.get(didDocEndpoint, async (req: RequestWithAgentIdentityManager, res) => {
    if (req.agent) {
      try {
        const serverIdentity = await req.agent.identityManagerGetIdentity({
          did: 'did:web:' + req.hostname,
        })
        const didDoc = didDocForIdentity(serverIdentity)
        res.json(didDoc)
      } catch (e) {
        res.status(404).send(e)
      }
    }
  })

  router.get(/^\/(.+)\/did.json$/, async (req: RequestWithAgentIdentityManager, res) => {
    if (req.agent) {
      try {
        const identity = await req.agent.identityManagerGetIdentity({
          did: 'did:web:' + req.hostname + ':' + req.params[0].replace('/', ':'),
        })
        const didDoc = didDocForIdentity(identity)
        res.json(didDoc)
      } catch (e) {
        res.status(404).send(e)
      }
    }
  })

  return router
}
