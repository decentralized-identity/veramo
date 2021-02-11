import { IAgent, IIdentifier, IDIDManager, TAgent } from '@veramo/core'
import { Request, Router } from 'express'

interface RequestWithAgentDIDManager extends Request {
  agent?: TAgent<IDIDManager>
}

export const didDocEndpoint = '/.well-known/did.json'
/**
 * @public
 */
export interface WebDidDocRouterOptions {
  /**
   * Function that returns configured agent for specific request
   */
  getAgentForRequest: (req: Request) => Promise<TAgent<IDIDManager>>
}
/**
 * Creates a router that serves `did:web` DID Documents
 *
 * @param options - Initialization option
 * @returns Expressjs router
 */
export const WebDidDocRouter = (options: WebDidDocRouterOptions): Router => {
  const router = Router()

  const didDocForIdentifier = (identifier: IIdentifier) => {
    const didDoc = {
      '@context': 'https://w3id.org/did/v1',
      id: identifier.did,
      publicKey: identifier.keys.map((key) => ({
        id: identifier.did + '#' + key.kid,
        type: key.type === 'Secp256k1' ? 'Secp256k1VerificationKey2018' : 'Ed25519VerificationKey2018',
        controller: identifier.did,
        publicKeyHex: key.publicKeyHex,
      })),
      authentication: identifier.keys.map((key) => ({
        type:
          key.type === 'Secp256k1'
            ? 'Secp256k1SignatureAuthentication2018'
            : 'Ed25519SignatureAuthentication2018',
        publicKey: identifier.did + '#' + key.kid,
      })),
      service: identifier.services,
    }

    return didDoc
  }

  router.get(didDocEndpoint, async (req: RequestWithAgentDIDManager, res) => {
    if (req.agent) {
      try {
        const serverIdentifier = await req.agent.didManagerGet({
          did: 'did:web:' + req.hostname,
        })
        const didDoc = didDocForIdentifier(serverIdentifier)
        res.json(didDoc)
      } catch (e) {
        res.status(404).send(e)
      }
    }
  })

  router.get(/^\/(.+)\/did.json$/, async (req: RequestWithAgentDIDManager, res) => {
    if (req.agent) {
      try {
        const identifier = await req.agent.didManagerGet({
          did: 'did:web:' + req.hostname + ':' + req.params[0].replace('/', ':'),
        })
        const didDoc = didDocForIdentifier(identifier)
        res.json(didDoc)
      } catch (e) {
        res.status(404).send(e)
      }
    }
  })

  return router
}
