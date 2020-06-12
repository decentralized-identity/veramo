import { IAgentBase, IAgentIdentityManager, IAgentExtension, IAgentKeyManager } from 'daf-core'
import { createJWT } from 'did-jwt'
import Debug from 'debug'

const debug = Debug('daf:selective-disclosure:action-handler')

interface Issuer {
  did: string
  url: string
}

export interface SelectiveDisclosureRequest {
  issuer: string
  subject?: string
  replyUrl?: string
  tag?: string
  claims: CredentialRequestInput[]
  credentials?: string[]
}

export interface CredentialRequestInput {
  reason?: string
  essential?: boolean
  credentialType?: string
  credentialContext?: string
  claimType: string
  claimValue?: string
  issuers?: Issuer[]
}

export interface IArgs {
  data: SelectiveDisclosureRequest
}

interface IContext {
  agent: IAgentBase & IAgentIdentityManager & IAgentKeyManager
}

type TSignSdr = (args: IArgs, context: IContext) => Promise<string>

export interface IAgentSignSdr {
  signSdr?: IAgentExtension<TSignSdr>
}

export const signSdr: TSignSdr = async (args, context) => {
  const { data } = args
  try {
    const identity = await context.agent.identityManagerGetIdentity({ did: data.issuer })
    delete data.issuer
    debug('Signing SDR with', identity.did)

    const key = identity.keys.find(k => k.type === 'Secp256k1')
    const signer = (data: string) => context.agent.keyManagerSignJWT({kid: key.kid, data})
    const jwt = await createJWT(
      {
        type: 'sdr',
        ...data,
      },
      {
        signer,
        alg: 'ES256K-R',
        issuer: identity.did,
      },
    )
    debug(jwt)
    return jwt
  } catch (error) {
    debug(error)
    return Promise.reject(error)
  }
}
