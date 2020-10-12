import { IIdentity, IKey, IService, IAgentContext, IKeyManager } from 'daf-core'
import { AbstractIdentityProvider } from 'daf-identity-manager'
import Debug from 'debug'
const op = require('@transmute/element-lib/src/sidetree/op')
const func = require('@transmute/element-lib/src/func')
const debug = Debug('daf:elem-did:identity-provider')

type IContext = IAgentContext<IKeyManager>

/**
 * {@link daf-identity-manager#IdentityManager} identity provider for `did:elem` identities
 * @beta
 */
export class ElemIdentityProvider extends AbstractIdentityProvider {
  private defaultKms: string
  private apiUrl: string
  private network?: string

  constructor(options: { apiUrl: string; defaultKms: string; network?: string }) {
    super()
    this.defaultKms = options.defaultKms
    this.apiUrl = options.apiUrl
    this.network = options.network
  }

  async createIdentity(
    { kms, options }: { kms?: string; options?: any },
    context: IContext,
  ): Promise<Omit<IIdentity, 'provider'>> {
    const primaryKey = await context.agent.keyManagerCreateKey({
      kms: kms || this.defaultKms,
      type: 'Secp256k1',
    })
    const recoveryKey = await context.agent.keyManagerCreateKey({
      kms: kms || this.defaultKms,
      type: 'Secp256k1',
    })
    const didMethodName = 'did:elem' + (this.network ? ':' + this.network : '')

    const operations = op({ parameters: { didMethodName } })
    const didDocumentModel = operations.getDidDocumentModel(primaryKey.publicKeyHex, recoveryKey.publicKeyHex)

    const fullPrimaryKey = await context.agent.keyManagerGetKey({ kid: primaryKey.kid })

    const createPayload = await operations.getCreatePayload(didDocumentModel, {
      privateKey: fullPrimaryKey.privateKeyHex,
    })
    const didUniqueSuffix = func.getDidUniqueSuffix(createPayload)
    const did = didMethodName + ':' + didUniqueSuffix
    debug('Creating new DID at', this.apiUrl)
    debug('Posting new DID Document for', did)
    const response = await fetch(this.apiUrl + '/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
    })

    if (response.status !== 200) {
      return Promise.reject(response.statusText)
    }

    const identity: Omit<IIdentity, 'provider'> = {
      did,
      controllerKeyId: primaryKey.kid,
      keys: [primaryKey, recoveryKey],
      services: [],
    }

    debug('Created', identity.did)
    return identity
  }

  async deleteIdentity(identity: IIdentity, context: IContext): Promise<boolean> {
    for (const { kid } of identity.keys) {
      await context.agent.keyManagerDeleteKey({ kid })
    }
    return true
  }

  async addKey(
    { identity, key, options }: { identity: IIdentity; key: IKey; options?: any },
    context: IContext,
  ): Promise<any> {
    if (!identity.controllerKeyId) throw Error('ControllerKeyId does not exist')
    
    const primaryKey = await await context.agent.keyManagerGetKey({ kid: identity.controllerKeyId })

    debug('Fetching list of previous operations')
    const response = await fetch(this.apiUrl + '/operations/' + identity.did)
    const operations = await response.json()

    debug('Operations count:', operations.length)
    if (operations.length === 0) {
      return Promise.reject('There should be at least one operation')
    }

    const lastOperation = operations.pop()

    const newPublicKey = {
      id: key.kid,
      usage: 'signing',
      type: key.type == 'Secp256k1' ? 'Secp256k1VerificationKey2018' : 'Ed25519VerificationKey2018',
      publicKeyHex: key.publicKeyHex,
    }

    const ops = op({ parameters: { didMethodName: 'did:elem' } })

    const updatePayload = await ops.getUpdatePayloadForAddingAKey(
      lastOperation,
      newPublicKey,
      primaryKey.privateKeyHex,
    )

    debug('Posting DID Doc update')
    const response2 = await fetch(this.apiUrl + '/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    })

    if (response2.status !== 200) {
      debug(response2.statusText)
      return Promise.reject(response2.statusText)
    }

    debug('Success. New publicKey:', key.publicKeyHex)
    return true
  }

  async addService(
    { identity, service, options }: { identity: IIdentity; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('[daf-elem-did] addService not implemented')
  }

  async removeKey(
    args: { identity: IIdentity; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('[daf-elem-did] removeKey not implemented')
  }

  async removeService(
    args: { identity: IIdentity; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('[daf-elem-did] removeService not implemented')
  }
}
