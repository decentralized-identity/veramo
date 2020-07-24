import {
  IAgentContext,
  IAgentPlugin,
  IResolveDid,
  IIdentityManager,
  IKeyManager,
  IPluginMethodMap,
  W3CCredential,
  W3CPresentation,
  VerifiableCredential,
  VerifiablePresentation,
  IDataStore,
} from 'daf-core'
import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  transformCredentialInput,
  transformPresentationInput,
  normalizeCredential,
  normalizePresentation,
} from 'did-jwt-vc'

import Debug from 'debug'
const debug = Debug('daf:w3c:action-handler')

export interface ICreateVerifiablePresentationArgs {
  presentation: W3CPresentation
  save?: boolean
  proofFormat: 'jwt'
}

export interface ICreateVerifiableCredentialArgs {
  credential: W3CCredential
  save?: boolean
  proofFormat: 'jwt'
}

export interface IW3c extends IPluginMethodMap {
  createVerifiablePresentation(
    args: ICreateVerifiablePresentationArgs,
    context: IContext,
  ): Promise<VerifiablePresentation>
  createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IContext,
  ): Promise<VerifiableCredential>
}
export type IContext = IAgentContext<
  IResolveDid &
    Pick<IIdentityManager, 'identityManagerGetIdentity'> &
    Pick<IDataStore, 'dataStoreSaveVerifiablePresentation' | 'dataStoreSaveVerifiableCredential'> &
    Pick<IKeyManager, 'keyManagerSignJWT'>
>

export class W3c implements IAgentPlugin {
  readonly methods: IW3c

  constructor() {
    this.methods = {
      createVerifiablePresentation: this.createVerifiablePresentation,
      createVerifiableCredential: this.createVerifiableCredential,
    }
  }

  async createVerifiablePresentation(
    args: ICreateVerifiablePresentationArgs,
    context: IContext,
  ): Promise<VerifiablePresentation> {
    try {
      const identity = await context.agent.identityManagerGetIdentity({ did: args.presentation.holder })
      const key = identity.keys.find(k => k.type === 'Secp256k1')
      if (!key) throw Error('No signing key for ' + identity.did)
      const signer = (data: string) => context.agent.keyManagerSignJWT({ kid: key.kid, data })
      debug('Signing VP with', identity.did)
      const jwt = await createVerifiablePresentationJwt(args.presentation, { did: identity.did, signer })
      debug(jwt)
      const presentation = normalizePresentation(jwt)
      if (args.save) {
        await context.agent.dataStoreSaveVerifiablePresentation(presentation)
      }
      return presentation
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  async createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IContext,
  ): Promise<VerifiableCredential> {
    try {
      const identity = await context.agent.identityManagerGetIdentity({ did: args.credential.issuer.id })
      const key = identity.keys.find(k => k.type === 'Secp256k1')
      if (!key) throw Error('No signing key for ' + identity.did)
      const signer = (data: string) => context.agent.keyManagerSignJWT({ kid: key.kid, data })

      debug('Signing VC with', identity.did)
      const jwt = await createVerifiableCredentialJwt(args.credential, { did: identity.did, signer })
      debug(jwt)
      const credential = normalizeCredential(jwt)
      if (args.save) {
        await context.agent.dataStoreSaveVerifiableCredential(credential)
      }

      return credential
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }
}
