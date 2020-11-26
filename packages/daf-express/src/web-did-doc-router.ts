import { IAgent, IIdentity, IIdentityManager, TAgent } from 'daf-core'
import { Request, Router } from 'express'

interface RequestWithAgentIdentityManager extends Request {
  agent?: TAgent<IIdentityManager>
}

interface RequestWithAgent extends Request {
  agent?: IAgent
}

export const didDocEndpoint = '/.well-known/did.json'
/**
 * @public
 */
export interface WebDidDocRouterOptions {
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
export const WebDidDocRouter = (options: WebDidDocRouterOptions): Router => {
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
