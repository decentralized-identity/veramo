import { IAgent, IAgentIdentityManager, IAgentExtension } from 'daf-core'
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

type ConfiguredAgent = IAgent & IAgentIdentityManager
type TContext = {
  agent: ConfiguredAgent
}

type TSignSdr = (args: IArgs, context: TContext) => Promise<string>

export interface IAgentSignSdr {
  signSdr?: IAgentExtension<TSignSdr>
}

export const signSdr: TSignSdr = async (args, ctx) => {
  const { data } = args
  try {
    const identity = await ctx.agent.getIdentity({ did: data.issuer })
    delete data.issuer
    debug('Signing SDR with', identity.did)

    const key = await identity.keyByType('Secp256k1')
    const jwt = await createJWT(
      {
        type: 'sdr',
        ...data,
      },
      {
        signer: key.signer(),
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
